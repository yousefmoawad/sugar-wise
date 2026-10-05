import { useState, useCallback } from 'react';
import { apiClient } from '../services/api';

const API_BASE = '/users';

function useUsers() {
  const [items, setItems] = useState([]);
  const [item, setItem] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleError = (err) => {
    console.error(err);
    setError(err);
    setLoading(false);
  };

  const readValue = (response) => {
    const data = response?.data;
    return data?.data ? data.data : data;
  };

  const readMessage = (err, fallback) =>
    err?.response?.data?.error ||
    err?.response?.data?.message ||
    err?.message ||
    fallback;

  const fetchAll = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await apiClient.get(API_BASE);
      const value = readValue(response);
      setItems(Array.isArray(value) ? value : []);
      return value;
    } catch (err) {
      handleError(new Error(readMessage(err, 'Failed to fetch users')));
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchById = useCallback(async (id) => {
    setLoading(true);
    setError(null);
    try {
      const response = await apiClient.get(`${API_BASE}/${id}`);
      const value = readValue(response);
      setItem(value);
      return value;
    } catch (err) {
      handleError(new Error(readMessage(err, 'Failed to fetch user')));
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const createItem = useCallback(async (payload) => {
    setLoading(true);
    setError(null);
    try {
      const response = await apiClient.post(API_BASE, payload);
      return readValue(response);
    } catch (err) {
      handleError(new Error(readMessage(err, 'Create failed')));
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const updateItem = useCallback(async (id, payload) => {
    setLoading(true);
    setError(null);
    try {
      const response = await apiClient.put(`${API_BASE}/${id}`, payload);
      return readValue(response);
    } catch (err) {
      handleError(new Error(readMessage(err, 'Update failed')));
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const deleteItem = useCallback(async (id) => {
    setLoading(true);
    setError(null);
    try {
      const response = await apiClient.delete(`${API_BASE}/${id}`);
      return readValue(response);
    } catch (err) {
      handleError(new Error(readMessage(err, 'Delete failed')));
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  return { items, item, loading, error, fetchAll, fetchById, createItem, updateItem, deleteItem };
}

export default useUsers;
