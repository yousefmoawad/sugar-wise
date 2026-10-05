import { useState, useCallback } from 'react';
import { getAuthHeaders, getPatientProfileQueryParam } from '../utils/getAuthHeaders';

const API_BASE = '/api/doctors';

function useDoctors() {
  const [items, setItems] = useState([]);
  const [item, setItem] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleError = (err) => {
    console.error(err);
    setError(err);
    setLoading(false);
  };

  const fetchAll = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const q = getPatientProfileQueryParam();
      const url = q ? `${API_BASE}?${q}` : API_BASE;
      const response = await fetch(url, { headers: getAuthHeaders() });
      if (!response.ok) throw new Error('Failed to fetch doctor');
      const data = await response.json();
      const value = data.data ? data.data : data;
      setItems(value);
      return value;
    } catch (err) {
      handleError(err);
      throw err;
    } finally { setLoading(false); }
  }, []);

  const fetchById = useCallback(async (id) => {
    setLoading(true);
    setError(null);
    try {
      const q = getPatientProfileQueryParam();
      const url = q ? `${API_BASE}/${id}?${q}` : `${API_BASE}/${id}`;
      const response = await fetch(url, { headers: getAuthHeaders() });
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
        headers: getAuthHeaders({ 'Content-Type': 'application/json' }),
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
        headers: getAuthHeaders({ 'Content-Type': 'application/json' }),
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

  const followDoctor = useCallback(async (doctorId, options = {}) => {
    setLoading(true);
    setError(null);
    try {
      let body = { ...options };
      try {
        const u = JSON.parse(localStorage.getItem('user') || 'null');
        const pid = u?.patient || u?.patientProfileId;
        if (pid && body.patientId == null) body.patientId = pid;
      } catch (_) {
        /* ignore */
      }
      const response = await fetch(`${API_BASE}/${doctorId}/follow`, {
        method: 'POST',
        headers: getAuthHeaders({ 'Content-Type': 'application/json' }),
        body: JSON.stringify(body),
      });
      const data = await response.json().catch(() => ({}));
      if (!response.ok) {
        throw new Error(data.error || data.message || 'Follow failed');
      }
      return data.data ? data.data : data;
    } catch (err) {
      handleError(err);
      throw err;
    } finally { setLoading(false); }
  }, []);

  const rateDoctor = useCallback(async (doctorId, rating, options = {}) => {
    setLoading(true);
    setError(null);
    try {
      let body = { rating, ...options };
      try {
        const u = JSON.parse(localStorage.getItem('user') || 'null');
        const pid = u?.patient || u?.patientProfileId;
        if (pid && body.patientId == null) body.patientId = pid;
      } catch (_) {
        /* ignore */
      }
      const response = await fetch(`${API_BASE}/${doctorId}/rate`, {
        method: 'POST',
        headers: getAuthHeaders({ 'Content-Type': 'application/json' }),
        body: JSON.stringify(body),
      });
      const data = await response.json().catch(() => ({}));
      if (!response.ok) {
        throw new Error(data.error || data.message || 'Rate failed');
      }
      return data.data ? data.data : data;
    } catch (err) {
      handleError(err);
      throw err;
    } finally { setLoading(false); }
  }, []);

  return {
    items,
    item,
    loading,
    error,
    fetchAll,
    fetchById,
    createItem,
    updateItem,
    deleteItem,
    followDoctor,
    rateDoctor,
  };
}

export default useDoctors;
