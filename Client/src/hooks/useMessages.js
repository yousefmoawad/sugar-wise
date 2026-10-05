import { useState, useCallback } from 'react';
import { normalizeRefId } from '../utils/normalizeRefId';

const API_BASE = '/api/messages';

const getAuthHeaders = () => {
  const token = localStorage.getItem('token');
  const headers = {};
  if (token) headers.Authorization = `Bearer ${token}`;
  return headers;
};

const getStoredUserId = () => {
  try {
    const storedUser = localStorage.getItem('user');
    const parsedUser = storedUser ? JSON.parse(storedUser) : null;
    if (!parsedUser) return '';
    const raw = parsedUser._id ?? parsedUser.id;
    return normalizeRefId(raw);
  } catch {
    return '';
  }
};

function useMessages() {
  const [items, setItems] = useState([]);
  const [item, setItem] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleError = (err) => {
    console.error(err);
    setError(err);
    setLoading(false);
  };

  const fetchChatsQuiet = useCallback(async () => {
    const userId = getStoredUserId();
    if (!userId) {
      setItems([]);
      return [];
    }
    const endpoint = `${API_BASE}/chats?userId=${encodeURIComponent(userId)}`;
    const response = await fetch(endpoint, { headers: getAuthHeaders() });
    if (!response.ok) throw new Error('Failed to fetch messages');
    const data = await response.json();
    const value = data.data ? data.data : data;
    setItems(value);
    return value;
  }, []);

  const fetchAll = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const value = await fetchChatsQuiet();
      return value;
    } catch (err) {
      handleError(err);
      throw err;
    } finally { setLoading(false); }
  }, [fetchChatsQuiet]);

  const fetchById = useCallback(async (id) => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch(`${API_BASE}/chats/${id}`, { headers: getAuthHeaders() });
      if (!response.ok) throw new Error('Failed to fetch item');
      const data = await response.json();
      const value = data.data ? data.data : data;
      setItem(value);
      return value;
    } catch (err) {
      handleError(err);
      throw err;
    } finally { setLoading(false); }
  }, []);

  const createItem = useCallback(async (payload) => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch(API_BASE, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', ...getAuthHeaders() },
        body: JSON.stringify(payload),
      });
      if (!response.ok) throw new Error('Create failed');
      const data = await response.json();
      return data.data ? data.data : data;
    } catch (err) {
      handleError(err);
      throw err;
    } finally { setLoading(false); }
  }, []);

  const updateItem = useCallback(async (id, payload) => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch(`${API_BASE}/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', ...getAuthHeaders() },
        body: JSON.stringify(payload),
      });
      if (!response.ok) throw new Error('Update failed');
      const data = await response.json();
      return data.data ? data.data : data;
    } catch (err) {
      handleError(err);
      throw err;
    } finally { setLoading(false); }
  }, []);

  const deleteItem = useCallback(async (id) => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch(`${API_BASE}/${id}`, { method: 'DELETE', headers: getAuthHeaders() });
      if (!response.ok) throw new Error('Delete failed');
      const data = await response.json();
      return data.data ? data.data : data;
    } catch (err) {
      handleError(err);
      throw err;
    } finally { setLoading(false); }
  }, []);

  const deleteChat = useCallback(async (chatId) => {
    const userId = getStoredUserId();
    const response = await fetch(`${API_BASE}/chats/${chatId}?userId=${encodeURIComponent(userId)}`, {
      method: 'DELETE',
      headers: getAuthHeaders(),
    });
    const data = await response.json().catch(() => ({}));
    if (!response.ok) throw new Error(data.message || 'Delete chat failed');
    setItems((prev) =>
      Array.isArray(prev)
        ? prev.filter((chat) => String(chat._id || chat.id) !== String(chatId))
        : prev,
    );
    return data.data ? data.data : data;
  }, []);

  /** Load messages for a chat without toggling global loading (for polling). */
  const fetchMessagesQuiet = useCallback(async (chatId, opts = {}) => {
    const userId = getStoredUserId();
    const params = new URLSearchParams();
    if (userId) params.set('userId', userId);

    if (opts.after) params.set('after', String(opts.after));
    if (opts.afterId) params.set('afterId', String(opts.afterId));
    if (opts.limit != null) params.set('limit', String(opts.limit));

    if (opts.includeSender === false) params.set('includeSender', '0');
    if (opts.markRead === false) params.set('markRead', '0');

    const q = params.toString() ? `?${params.toString()}` : '';

    const response = await fetch(`${API_BASE}/chats/${chatId}${q}`, { headers: getAuthHeaders() });
    if (!response.ok) throw new Error('Failed to fetch messages');
    const data = await response.json();
    return data.data ? data.data : data;
  }, []);

  /** Mark chat as read */
  const markChatRead = useCallback(async (chatId) => {
    const userId = getStoredUserId();
    const response = await fetch(`${API_BASE}/chats/${chatId}/read`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json', ...getAuthHeaders() },
      body: JSON.stringify({ userId }),
    });
    if (!response.ok) return false;
    return true;
  }, []);

  /** Send a chat message without toggling global loading. */
  const sendMessage = useCallback(async (payload) => {
    const response = await fetch(API_BASE, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', ...getAuthHeaders() },
      body: JSON.stringify(payload),
    });
    if (!response.ok) throw new Error('Send failed');
    const data = await response.json();
    return data.data ? data.data : data;
  }, []);

  return {
    items,
    item,
    loading,
    error,
    fetchAll,
    fetchChatsQuiet,
    fetchById,
    createItem,
    updateItem,
    deleteItem,
    deleteChat,
    fetchMessagesQuiet,
    markChatRead,
    sendMessage,
  };
}

export default useMessages;
