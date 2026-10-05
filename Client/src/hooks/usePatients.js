import { useState, useCallback } from 'react';
import { getAuthHeaders } from '../utils/getAuthHeaders';

const API_BASE = '/api/patients';

const normalizeRole = (role) => String(role || '').trim().toLowerCase();

const maybeUpdateSessionPatientId = (patientId, { allowOverwrite = false } = {}) => {
  try {
    const stored = localStorage.getItem('user');
    if (!stored || !patientId) return;
    const sessionUser = JSON.parse(stored);
    const role = normalizeRole(sessionUser?.role);
    // Avoid "data jumps": never overwrite patient id for non-patient sessions.
    if (role !== 'patient') return;
    if (!allowOverwrite && sessionUser.patient && String(sessionUser.patient) !== String(patientId)) return;
    sessionUser.patient = patientId;
    localStorage.setItem('user', JSON.stringify(sessionUser));
  } catch {
    /* ignore */
  }
};

function usePatients() {
  const [items, setItems] = useState([]);
  const [item, setItem] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleError = (err) => {
    console.error(err);
    setError(err);
    setLoading(false);
  };

  /**
   * دالة جلب جميع المرضى
   * تقوم بجلب قائمة جميع المرضى من قاعدة البيانات
   * @returns {Promise<Array>} - قائمة المرضى
   */
  const fetchAll = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch(API_BASE, { headers: getAuthHeaders() });
      if (!response.ok) throw new Error('Failed to fetch patient');
      const data = await response.json();
      const value = data.data ? data.data : data;
      setItems(value);
      return value;
    } catch (err) {
      handleError(err);
      throw err;
    } finally { setLoading(false); }
  }, []);

  /**
   * دالة جلب بيانات مريض محدد
   * تقوم بجلب بيانات مريض محدد بناءً على معرفه
   * @param {string} id - معرف المريض
   * @returns {Promise<Object>} - بيانات المريض
   */
  const fetchById = useCallback(async (id) => {
    setLoading(true);
    setError(null);
    try {
      if (!id || id === 'undefined' || id === 'null') throw new Error('Patient ID is missing');
      const response = await fetch(`${API_BASE}/${id}`, { headers: getAuthHeaders() });
      if (!response.ok) {
        const body = await response.json().catch(() => ({}));
        throw new Error(body.error || body.message || `Failed to fetch item (Status: ${response.status})`);
      }
      const data = await response.json();
      const value = data.data ? data.data : data;
      setItem(value);
      if (value && value._id) maybeUpdateSessionPatientId(value._id, { allowOverwrite: false });
      return value;
    } catch (err) {
      handleError(err);
      throw err;
    } finally { setLoading(false); }
  }, []);

  /**
   * دالة جلب بيانات المريض الحالي
   * تقوم بجلب بيانات المريض المسجل حالياً باستخدام التوكن
   * @returns {Promise<Object>} - بيانات المريض الحالي
   */
  const fetchMe = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch(`${API_BASE}/me`, { headers: getAuthHeaders() });
      if (!response.ok) {
        const body = await response.json().catch(() => ({}));
        throw new Error(body.error || body.message || `Failed to load profile (${response.status})`);
      }
      const data = await response.json();
      const value = data.data ? data.data : data;
      setItem(value);
      if (value && value._id) maybeUpdateSessionPatientId(value._id, { allowOverwrite: true });
      return value;
    } catch (err) {
      handleError(err);
      throw err;
    } finally { setLoading(false); }
  }, []);

  /**
   * دالة إنشاء مريض جديد
   * تقوم بإنشاء مريض جديد في قاعدة البيانات
   * @param {Object} payload - بيانات المريض الجديد
   * @returns {Promise<Object>} - بيانات المريض المنشأ
   */
  const createItem = useCallback(async (payload) => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch(API_BASE, {
        method: 'POST',
        headers: getAuthHeaders({ 'Content-Type': 'application/json' }),
        body: JSON.stringify(payload),
      });
      if (!response.ok) {
        const body = await response.json().catch(() => ({}));
        throw new Error(body.error || body.message || `Create failed (Status: ${response.status})`);
      }
      const data = await response.json();
      const newItem = data.data ? data.data : data;

      // تحديث البيانات المحلية
      setItem(newItem);
      setItems(prev => [...prev, newItem]);

      return newItem;
    } catch (err) {
      handleError(err);
      throw err;
    } finally { setLoading(false); }
  }, []);

  /**
   * دالة تحديث بيانات مريض موجود
   * تقوم بتحديث بيانات المريض في قاعدة البيانات وتحديث البيانات المحلية
   * @param {string} id - معرف المريض
   * @param {Object} payload - البيانات الجديدة للمريض
   * @returns {Promise<Object>} - البيانات المحدثة للمريض
   */
  const updateItem = useCallback(async (id, payload) => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch(`${API_BASE}/${id}`, {
        method: 'PUT',
        headers: getAuthHeaders({ 'Content-Type': 'application/json' }),
        body: JSON.stringify(payload),
      });
      if (!response.ok) {
        const body = await response.json().catch(() => ({}));
        throw new Error(body.error || body.message || `Update failed (Status: ${response.status})`);
      }
      const data = await response.json();
      const updatedItem = data.data ? data.data : data;

      // تحديث البيانات المحلية
      setItem(updatedItem);
      setItems(prev => prev.map(item => 
        (item._id === id || item.id === id) ? updatedItem : item
      ));

      // تحديث بيانات المستخدم في localStorage إذا كان هو المريض الحالي
      try {
        const stored = localStorage.getItem('user');
        if (stored) {
          const sessionUser = JSON.parse(stored);
          if (sessionUser.patient === id || sessionUser.patientProfileId === id) {
            localStorage.setItem('user', JSON.stringify(sessionUser));
          }
        }
      } catch {
        /* ignore */
      }

      return updatedItem;
    } catch (err) {
      handleError(err);
      throw err;
    } finally { setLoading(false); }
  }, []);

  /**
   * دالة حذف مريض
   * تقوم بحذف مريض من قاعدة البيانات وتحديث البيانات المحلية
   * @param {string} id - معرف المريض
   * @returns {Promise<Object>} - نتيجة عملية الحذف
   */
  const deleteItem = useCallback(async (id) => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch(`${API_BASE}/${id}`, { method: 'DELETE', headers: getAuthHeaders() });
      if (!response.ok) {
        const body = await response.json().catch(() => ({}));
        throw new Error(body.error || body.message || `Delete failed (Status: ${response.status})`);
      }
      const data = await response.json();
      const deletedItem = data.data ? data.data : data;

      // تحديث البيانات المحلية
      setItem(null);
      setItems(prev => prev.filter(item => item._id !== id && item.id !== id));

      return deletedItem;
    } catch (err) {
      handleError(err);
      throw err;
    } finally { setLoading(false); }
  }, []);

  return { items, item, loading, error, fetchAll, fetchById, fetchMe, createItem, updateItem, deleteItem };
}

export default usePatients;
