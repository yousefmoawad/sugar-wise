const User = require('../models/User');

exports.pingPresence = async (req, res) => {
  try {
    const userId = req.user?.id || req.authUser?._id;
    if (!userId) {
      return res.status(401).json({ success: false, message: 'Not authenticated' });
    }

    await User.updateOne(
      { _id: userId },
      { $set: { lastSeenAt: new Date(), status: 'online' } }
    );

    return res.status(200).json({ success: true, serverTime: new Date().toISOString() });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message || 'Presence ping failed' });
  }
};

