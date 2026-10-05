// 💬 Messages Controller - Handle messaging and chat operations
const mongoose = require('mongoose');
const Message = require('../models/Message');
const Chat = require('../models/Chat');
const User = require('../models/User');
const Doctor = require('../models/Doctor');
const Patient = require('../models/Patient');
const Notification = require('../models/Notification');

const toChatObjectId = (chatId) => {
  try {
    return new mongoose.Types.ObjectId(String(chatId).trim());
  } catch {
    return null;
  }
};

const ONLINE_WINDOW_MS = 5 * 60 * 1000; // 5 minutes

const normalizePresence = (userLike) => {
  if (userLike == null || typeof userLike !== 'object') return userLike;
  const o = userLike.toObject ? userLike.toObject() : { ...userLike };
  const last = o.lastSeenAt ? new Date(o.lastSeenAt) : null;
  const hasLast = last && !Number.isNaN(last.getTime());
  const recent = hasLast && Date.now() - last.getTime() <= ONLINE_WINDOW_MS;
  const st = String(o.status || '').trim().toLowerCase();
  return {
    ...o,
    // If we have a lastSeenAt, it is the source of truth. Otherwise fall back to stored status.
    status: recent ? 'online' : hasLast ? 'offline' : st === 'online' ? 'online' : 'offline',
  };
};

const touchPresence = async (userId) => {
  if (!userId) return;
  try {
    const oid =
      userId instanceof mongoose.Types.ObjectId
        ? userId
        : new mongoose.Types.ObjectId(String(userId).trim());
    await User.updateOne(
      { _id: oid },
      { $set: { lastSeenAt: new Date(), status: 'online' } }
    );
  } catch {
    // ignore
  }
};

const formatMessage = (doc) => {
  const o = doc && doc.toObject ? doc.toObject() : { ...doc };
  const senderRef = o.sender;
  const senderId = senderRef && senderRef._id ? senderRef._id : senderRef;
  return {
    ...o,
    content: o.messageText,
    message: o.messageText,
    text: o.messageText,
    senderId,
  };
};

const readAuthUserId = (req) =>
  req.authUser?._id || req.user?.id || req.body?.userId || req.query?.userId || null;

const buildDirectChatName = (userA, userB) => {
  const nameA = userA?.name || userA?.email || 'User';
  const nameB = userB?.name || userB?.email || 'User';
  return `${nameA} & ${nameB}`;
};

const resolveUser = async (anyId) => {
  if (!anyId) return null;
  const sid = String(anyId).trim();
  if (!sid || sid === 'undefined' || sid === 'null') return null;

  // 1. Try finding as User ID directly
  let user = await User.findById(sid);
  if (user) return user;

  // 2. Try finding as Patient profile link
  user = await User.findOne({ patient: sid });
  if (user) return user;

  // 3. Try finding as Doctor profile link
  user = await User.findOne({ doctor: sid });
  if (user) return user;

  // 4. If still not found, check if this ID belongs to a Patient/Doctor directly
  // and trigger a sync if needed.
  const pat = await Patient.findById(sid).select(
    'email password firstName lastName role profileImage'
  );
  if (pat && pat.email) {
    const email = pat.email.toLowerCase();
    // Check if a user already exists for this email
    let user = await User.findOne({ email }).sort({ createdAt: 1 });
    if (user) {
      if (!user.patient) {
        user.patient = pat._id;
        user.role = 'Patient';
        await user.save();
      }
      return user;
    }
    try {
      const synced = await User.create({
        email,
        patient: pat._id,
        role: pat.role || 'Patient',
        name: `${pat.firstName || ''} ${pat.lastName || ''}`.trim() || 'Patient',
        password: pat.password,
        image: pat.profileImage || '',
      });
      return synced;
    } catch {
      const again = await User.findOne({ email }).sort({ createdAt: 1 });
      return again || null;
    }
  }

  const doc = await Doctor.findById(sid).select(
    'email password firstName lastName role profileImage'
  );
  if (doc && doc.email) {
    const email = doc.email.toLowerCase();
    let user = await User.findOne({ email }).sort({ createdAt: 1 });
    if (user) {
      if (!user.doctor) {
        user.doctor = doc._id;
        user.role = 'Doctor';
        await user.save();
      }
      return user;
    }
    try {
      const synced = await User.create({
        email,
        doctor: doc._id,
        role: doc.role || 'Doctor',
        name: `${doc.firstName || ''} ${doc.lastName || ''}`.trim() || 'Doctor',
        password: doc.password,
        image: doc.profileImage || '',
      });
      return synced;
    } catch {
      const again = await User.findOne({ email }).sort({ createdAt: 1 });
      return again || null;
    }
  }

  return null;
};

const ensureUsersForRole = async (targetRole) => {
  const normalized = String(targetRole || '').trim().toLowerCase();
  if (normalized === 'doctor') {
    const doctors = await Doctor.find({}).select('_id firstName lastName email password role profileImage Status').limit(50);
    for (const doc of doctors) {
      const email = String(doc.email || '').toLowerCase();
      if (!email) continue;
      await User.findOneAndUpdate(
        { email },
        {
          doctor: doc._id,
          name: `${doc.firstName || ''} ${doc.lastName || ''}`.trim() || 'Doctor',
          role: doc.role || 'Doctor',
          image: doc.profileImage || '',
          email,
          password: doc.password,
          status: String(doc.Status || 'Offline').toLowerCase() === 'online' ? 'online' : 'offline',
        },
        { upsert: true, new: true, setDefaultsOnInsert: true }
      );
    }
  }

  if (normalized === 'patient') {
    const patients = await Patient.find({}).select('_id firstName lastName email password role profileImage Status').limit(50);
    for (const pat of patients) {
      const email = String(pat.email || '').toLowerCase();
      if (!email) continue;
      await User.findOneAndUpdate(
        { email },
        {
          patient: pat._id,
          name: `${pat.firstName || ''} ${pat.lastName || ''}`.trim() || 'Patient',
          role: pat.role || 'Patient',
          image: pat.profileImage || '',
          email,
          password: pat.password,
          status: String(pat.Status || 'Offline').toLowerCase() === 'online' ? 'online' : 'offline',
        },
        { upsert: true, new: true, setDefaultsOnInsert: true }
      );
    }
  }
};

// Get all chats for the current user
exports.getChats = async (req, res) => {
  try {
    const userId =
      req.query.userId ||
      req.body?.userId ||
      req.authUser?._id ||
      req.user?.id;

    if (!userId) {
      return res.status(400).json({
        success: false,
        message: 'User ID is required'
      });
    }

    let participantId;
    const resolvedParticipant = await resolveUser(userId);
    if (resolvedParticipant && resolvedParticipant._id) {
      const rid = resolvedParticipant._id;
      participantId =
        rid instanceof mongoose.Types.ObjectId
          ? rid
          : new mongoose.Types.ObjectId(String(rid));
    } else {
      try {
        participantId = new mongoose.Types.ObjectId(String(userId).trim());
      } catch (e) {
        return res.status(400).json({
          success: false,
          message: 'Invalid user ID format',
        });
      }
    }

    let chats = await Chat.find({
      participants: participantId,
      hiddenFor: { $ne: participantId },
    })
      .populate('participants', 'name email role image status lastSeenAt patient doctor')
      .populate({
        path: 'lastMessage',
        populate: { path: 'sender', select: 'name email role image status lastSeenAt' },
      })
      .sort({ lastMessageTime: -1, updatedAt: -1 });

    // Mark requester as online (best-effort).
    touchPresence(participantId).catch(() => {});

    // Bootstrap direct chats so patients/doctors can start messaging immediately.
    if (chats.length === 0) {
      const currentUser = await User.findById(participantId).select('role name email');
      if (currentUser) {
        const normalizedRole = String(currentUser.role || '').trim().toLowerCase();
        let targetRoles = [];
        if (normalizedRole === 'patient') targetRoles = ['Doctor'];
        if (normalizedRole === 'doctor') targetRoles = ['Patient'];

        if (targetRoles.length > 0) {
          for (const roleName of targetRoles) {
            await ensureUsersForRole(roleName);
          }

          const peers = await User.find({
            $or: targetRoles.map((rn) => ({ role: new RegExp(`^${rn}$`, 'i') })),
          })
            .select('_id name email role')
            .limit(40);

          for (const peer of peers) {
            if (String(peer._id) === String(participantId)) continue;
            const exists = await Chat.findOne({
              isGroup: false,
              participants: { $all: [participantId, peer._id], $size: 2 },
            });

            if (!exists) {
              await Chat.create({
                participants: [participantId, peer._id],
                chatName: buildDirectChatName(currentUser, peer),
                isGroup: false,
              });
            }
          }

          chats = await Chat.find({
            participants: participantId,
            hiddenFor: { $ne: participantId },
          })
            .populate('participants', 'name email role image status lastSeenAt patient doctor')
            .populate({
              path: 'lastMessage',
              populate: { path: 'sender', select: 'name email role image status lastSeenAt' },
            })
            .sort({ lastMessageTime: -1, updatedAt: -1 });
        }
      }
    }

    const data = await Promise.all(
      chats.map(async (c) => {
        const plain = c.toObject ? c.toObject() : c;
        const unreadCount = await Message.countDocuments({
          chat: plain._id,
          isRead: false,
          sender: { $ne: participantId },
        });
        const last =
          plain.lastMessage && typeof plain.lastMessage === 'object' && plain.lastMessage.messageText !== undefined
            ? (() => {
                const lm = plain.lastMessage.toObject ? plain.lastMessage.toObject() : { ...plain.lastMessage };
                if (lm.sender && typeof lm.sender === 'object') lm.sender = normalizePresence(lm.sender);
                return formatMessage(lm);
              })()
            : plain.lastMessage;
        const participants = (plain.participants || []).map((p) => {
          if (p == null || typeof p !== 'object') return p;
          if (p._id == null && p.id == null) return p;
          return normalizePresence(p);
        });
        return {
          ...plain,
          participants,
          lastMessage: last,
          unreadCount,
        };
      })
    );

    res.status(200).json({
      success: true,
      count: data.length,
      data,
      message: 'Chats retrieved successfully'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to fetch chats'
    });
  }
};

// Get messages in a specific chat
exports.getMessages = async (req, res) => {
  try {
    const { chatId } = req.params;
    const viewerId =
      req.query.userId || req.body?.userId || req.authUser?._id || req.user?.id;

    // Optional incremental loading for faster polling:
    // - after: ISO date string (or ms) for createdAt cursor (exclusive)
    // - afterId: ObjectId string to disambiguate equal timestamps (exclusive)
    // - limit: max number of messages to return
    // - includeSender: "0"/"false" to skip populate(sender)
    // - markRead: "0"/"false" to skip marking messages/notifications as read
    const afterRaw = req.query.after || req.query.since;
    const afterIdRaw = req.query.afterId;
    const limitRaw = req.query.limit;
    const includeSender =
      String(req.query.includeSender || '').toLowerCase() !== '0' &&
      String(req.query.includeSender || '').toLowerCase() !== 'false';
    const hasCursor = Boolean(afterRaw || afterIdRaw);
    const markReadParam = req.query.markRead;
    const markRead =
      markReadParam == null
        ? !hasCursor
        : ['1', 'true', 'yes'].includes(String(markReadParam).toLowerCase());

    if (!chatId) {
      return res.status(400).json({
        success: false,
        message: 'Chat ID is required'
      });
    }

    let viewerOid = null;
    if (viewerId) {
      const resolvedViewer = await resolveUser(viewerId);
      if (resolvedViewer && resolvedViewer._id) {
        const vid = resolvedViewer._id;
        try {
          viewerOid =
            vid instanceof mongoose.Types.ObjectId
              ? vid
              : new mongoose.Types.ObjectId(String(vid));
        } catch {
          viewerOid = null;
        }
      }
      if (!viewerOid) {
        try {
          viewerOid = new mongoose.Types.ObjectId(String(viewerId).trim());
        } catch {
          viewerOid = null;
        }
      }
    }
    if (viewerOid) {
      const ch = await Chat.findById(chatId).select('participants').lean();
      const allowed = (ch?.participants || []).some((p) => String(p) === String(viewerOid));
      if (!allowed) {
        return res.status(403).json({
          success: false,
          message: 'You are not a participant in this chat',
        });
      }

      // Mark requester as online (best-effort).
      touchPresence(viewerOid).catch(() => {});

      if (markRead) {
        const chatOid = toChatObjectId(chatId);
        if (chatOid) {
          await Message.updateMany(
            { chat: chatOid, sender: { $ne: viewerOid }, isRead: false },
            { $set: { isRead: true, readAt: new Date() } }
          );
          await Notification.updateMany(
            {
              user: viewerOid,
              type: 'message',
              isRead: false,
              relatedChat: chatOid,
            },
            { $set: { isRead: true } }
          );
        }
      }
    }

    let afterDate = null;
    if (afterRaw != null && String(afterRaw).trim() !== '') {
      const d = new Date(afterRaw);
      if (!Number.isNaN(d.getTime())) afterDate = d;
    }

    let afterOid = null;
    if (afterIdRaw != null && String(afterIdRaw).trim() !== '') {
      try {
        afterOid = new mongoose.Types.ObjectId(String(afterIdRaw).trim());
      } catch {
        afterOid = null;
      }
    }

    const findQuery = { chat: chatId };
    if (afterDate && afterOid) {
      findQuery.$or = [
        { createdAt: { $gt: afterDate } },
        { createdAt: afterDate, _id: { $gt: afterOid } },
      ];
    } else if (afterDate) {
      findQuery.createdAt = { $gt: afterDate };
    } else if (afterOid) {
      // Fallback cursor in case client only sends afterId
      findQuery._id = { $gt: afterOid };
    }

    let limit = null;
    if (limitRaw != null && String(limitRaw).trim() !== '') {
      const n = parseInt(String(limitRaw), 10);
      if (Number.isFinite(n) && n > 0) limit = n;
    } else if (hasCursor) {
      // When polling with a cursor, keep the response bounded.
      limit = 200;
    }
    if (limit != null) limit = Math.max(1, Math.min(limit, 500));

    let q = Message.find(findQuery).sort({ createdAt: 1, _id: 1 });
    if (includeSender) {
      q = q.populate('sender', 'name email role image status lastSeenAt');
    }
    if (limit != null) q = q.limit(limit);

    const messages = await q.lean();

    res.status(200).json({
      success: true,
      count: messages.length,
      data: messages.map((m) => {
        const mm = { ...m };
        if (mm.sender && typeof mm.sender === 'object') mm.sender = normalizePresence(mm.sender);
        return formatMessage(mm);
      }),
      message: 'Messages retrieved successfully'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to fetch messages'
    });
  }
};

// Send a new message
exports.sendMessage = async (req, res) => {
  try {
    const { chatId, senderId } = req.body;
    const receiverId = req.body.receiverId || req.body.recipientId;
    const rawText = req.body.messageText || req.body.content || req.body.message || req.body.text || '';
    const messageText = String(rawText).trim();

    if (!messageText || !senderId) {
      return res.status(400).json({
        success: false,
        message: 'Message text and sender ID are required'
      });
    }

    let senderOid;
    try {
      senderOid = new mongoose.Types.ObjectId(String(senderId).trim());
    } catch (e) {
      return res.status(400).json({
        success: false,
        message: 'Invalid sender ID',
      });
    }

    // Get sender info
    const sender = await User.findById(senderOid);
    if (!sender) {
      return res.status(404).json({
        success: false,
        message: 'Sender not found'
      });
    }

    // Mark sender as online (best-effort).
    touchPresence(senderOid).catch(() => {});

    let resolvedChatId = chatId;

    // If chatId is missing but receiver is provided, create/find direct chat.
    if (!resolvedChatId && receiverId) {
      let receiverOid;
      try {
        receiverOid = new mongoose.Types.ObjectId(String(receiverId).trim());
      } catch (e) {
        return res.status(400).json({
          success: false,
          message: 'Invalid receiver ID',
        });
      }
      let directChat = await Chat.findOne({
        isGroup: false,
        participants: { $all: [senderOid, receiverOid], $size: 2 },
      });
      if (!directChat) {
        const receiver = await resolveUser(receiverOid);
        if (!receiver) {
          return res.status(404).json({ success: false, message: 'Receiver not found' });
        }
        // Update receiverOid to the actual User ID if it was a profile ID
        receiverOid = receiver._id;
        
        // Re-check for chat with the resolved User ID
        directChat = await Chat.findOne({
          isGroup: false,
          participants: { $all: [senderOid, receiverOid], $size: 2 },
        });
        
        if (!directChat) {
          directChat = await Chat.create({
            participants: [senderOid, receiverOid],
            chatName: buildDirectChatName(sender, receiver),
            isGroup: false,
          });
        }
      }
      resolvedChatId = directChat._id;
    }

    if (!resolvedChatId) {
      return res.status(400).json({
        success: false,
        message: 'Chat ID or receiver ID is required'
      });
    }

    const chatForSend = await Chat.findById(resolvedChatId).select('participants').lean();
    const memberIds = (chatForSend?.participants || []).map(String);
    if (!memberIds.includes(String(senderOid))) {
      return res.status(403).json({
        success: false,
        message: 'Sender is not a member of this chat',
      });
    }

    // Create new message
    const newMessage = new Message({
      chat: resolvedChatId,
      sender: senderOid,
      senderName: sender.name || sender.email || 'User',
      messageText
    });

    await newMessage.save();
    await newMessage.populate('sender', 'name email role image status lastSeenAt');

    // Update chat's last message
    await Chat.findByIdAndUpdate(resolvedChatId, {
      lastMessage: newMessage._id,
      lastMessageTime: new Date(),
      $pull: { hiddenFor: { $in: chatForSend?.participants || [] } },
    });

    const chatDoc = await Chat.findById(resolvedChatId).select('participants').lean();
    const otherUserIdStr = Array.isArray(chatDoc?.participants)
      ? chatDoc.participants.map(String).find((pid) => String(pid) !== String(senderOid))
      : null;
    let notifyUserOid = null;
    if (otherUserIdStr) {
      try {
        notifyUserOid = new mongoose.Types.ObjectId(otherUserIdStr);
      } catch {
        notifyUserOid = null;
      }
    }

    if (notifyUserOid) {
      try {
        await Notification.create({
          user: notifyUserOid,
          type: 'message',
          relatedChat: resolvedChatId,
          title: 'New message',
          message: messageText.slice(0, 240),
          actionUrl: `/messages?chat=${String(resolvedChatId)}`,
          isRead: false,
        });
      } catch (notifyErr) {
        // ignore notification failures
      }
    }

    res.status(201).json({
      success: true,
      data: formatMessage(newMessage),
      message: 'Message sent successfully'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to send message'
    });
  }
};

exports.markChatRead = async (req, res) => {
  try {
    const { chatId } = req.params;
    const viewerId = req.body.userId || req.query.userId || req.authUser?._id || req.user?.id;

    if (!chatId || !viewerId) {
      return res.status(400).json({
        success: false,
        message: 'Chat ID and user ID are required',
      });
    }

    let viewerOid = null;
    const resolvedViewer = await resolveUser(viewerId);
    if (resolvedViewer && resolvedViewer._id) {
      const vid = resolvedViewer._id;
      try {
        viewerOid =
          vid instanceof mongoose.Types.ObjectId
            ? vid
            : new mongoose.Types.ObjectId(String(vid));
      } catch {
        viewerOid = null;
      }
    }
    if (!viewerOid) {
      try {
        viewerOid = new mongoose.Types.ObjectId(String(viewerId).trim());
      } catch {
        return res.status(400).json({ success: false, message: 'Invalid user ID' });
      }
    }

    const ch = await Chat.findById(chatId).select('participants').lean();
    const allowed = (ch?.participants || []).some((p) => String(p) === String(viewerOid));
    if (!allowed) {
      return res.status(403).json({
        success: false,
        message: 'You are not a participant in this chat',
      });
    }

    const chatOid = toChatObjectId(chatId);
    if (!chatOid) {
      return res.status(400).json({ success: false, message: 'Invalid chat ID' });
    }

    await Message.updateMany(
      { chat: chatOid, sender: { $ne: viewerOid }, isRead: false },
      { $set: { isRead: true, readAt: new Date() } }
    );

    await Notification.updateMany(
      {
        user: viewerOid,
        type: 'message',
        isRead: false,
        relatedChat: chatOid,
      },
      { $set: { isRead: true } }
    );

    res.status(200).json({
      success: true,
      message: 'Chat marked as read',
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to mark chat read',
    });
  }
};

exports.deleteChat = async (req, res) => {
  try {
    const { chatId } = req.params;
    const authUserId = readAuthUserId(req);

    if (!chatId || !authUserId) {
      return res.status(400).json({
        success: false,
        message: 'Chat ID and user ID are required',
      });
    }

    const resolvedUser = await resolveUser(authUserId);
    const viewerId = resolvedUser?._id || authUserId;
    let viewerOid = null;
    try {
      viewerOid =
        viewerId instanceof mongoose.Types.ObjectId
          ? viewerId
          : new mongoose.Types.ObjectId(String(viewerId).trim());
    } catch {
      return res.status(400).json({ success: false, message: 'Invalid user ID' });
    }

    const chat = await Chat.findById(chatId).select('participants hiddenFor').lean();
    const isParticipant = (chat?.participants || []).some(
      (participantId) => String(participantId) === String(viewerOid),
    );
    if (!chat || !isParticipant) {
      return res.status(404).json({ success: false, message: 'Chat not found' });
    }

    await Chat.findByIdAndUpdate(chatId, {
      $addToSet: { hiddenFor: viewerOid },
    });

    await Notification.deleteMany({
      user: viewerOid,
      relatedChat: chatId,
    }).catch(() => null);

    return res.status(200).json({
      success: true,
      message: 'Conversation removed from your list',
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message || 'Failed to delete chat',
    });
  }
};

// Delete a message
exports.deleteMessage = async (req, res) => {
  try {
    const { id } = req.params;
    const authUserId = readAuthUserId(req);

    if (!id || !authUserId) {
      return res.status(400).json({
        success: false,
        message: 'Message ID and user ID are required'
      });
    }

    const resolvedUser = await resolveUser(authUserId);
    const viewerId = resolvedUser?._id || authUserId;
    const targetMessage = await Message.findById(id).select('sender chat');

    if (!targetMessage) {
      return res.status(404).json({
        success: false,
        message: 'Message not found'
      });
    }

    const chat = await Chat.findById(targetMessage.chat).select('participants').lean();
    const isParticipant = (chat?.participants || []).some(
      (participantId) => String(participantId) === String(viewerId),
    );

    if (!isParticipant) {
      return res.status(403).json({
        success: false,
        message: 'You are not allowed to delete this message',
      });
    }

    const isOwner = String(targetMessage.sender) === String(viewerId);
    if (!isOwner) {
      return res.status(403).json({
        success: false,
        message: 'Only the sender can delete this message',
      });
    }

    const deletedMessage = await Message.findByIdAndDelete(id);

    const latestMessage = await Message.findOne({ chat: targetMessage.chat })
      .sort({ createdAt: -1, _id: -1 })
      .select('_id createdAt')
      .lean();

    await Chat.findByIdAndUpdate(targetMessage.chat, {
      lastMessage: latestMessage?._id || null,
      lastMessageTime: latestMessage?.createdAt || null,
    }).catch(() => null);

    res.status(200).json({
      success: true,
      data: null,
      message: 'Message deleted successfully'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to delete message'
    });
  }
};
