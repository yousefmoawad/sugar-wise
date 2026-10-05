/**
 * مدير بيانات المريض
 * يدير البيانات بين localStorage و MongoDB
 */

const STORAGE_KEY = 'user';

/**
 * حفظ بيانات المريض في localStorage
 * @param {Object} patientData - بيانات المريض
 */
export const savePatientDataToStorage = (patientData) => {
  try {
    const storedUser = localStorage.getItem(STORAGE_KEY);
    if (storedUser) {
      const userData = JSON.parse(storedUser);
      userData.patientData = patientData;
      localStorage.setItem(STORAGE_KEY, JSON.stringify(userData));
    }
  } catch (error) {
    console.error('Failed to save patient data to localStorage:', error);
  }
};

/**
 * جلب بيانات المريض من localStorage
 * @returns {Object|null} بيانات المريض أو null
 */
export const getPatientDataFromStorage = () => {
  try {
    const storedUser = localStorage.getItem(STORAGE_KEY);
    if (storedUser) {
      const userData = JSON.parse(storedUser);
      return userData.patientData || null;
    }
    return null;
  } catch (error) {
    console.error('Failed to get patient data from localStorage:', error);
    return null;
  }
};

/**
 * تحديث معرف المريض في localStorage
 * @param {string} patientId - معرف المريض
 */
export const updatePatientIdInStorage = (patientId) => {
  try {
    const storedUser = localStorage.getItem(STORAGE_KEY);
    if (storedUser) {
      const userData = JSON.parse(storedUser);
      userData.patient = patientId;
      localStorage.setItem(STORAGE_KEY, JSON.stringify(userData));
    }
  } catch (error) {
    console.error('Failed to update patient ID in localStorage:', error);
  }
};

/**
 * مسح بيانات المريض من localStorage
 */
export const clearPatientDataFromStorage = () => {
  try {
    const storedUser = localStorage.getItem(STORAGE_KEY);
    if (storedUser) {
      const userData = JSON.parse(storedUser);
      delete userData.patientData;
      localStorage.setItem(STORAGE_KEY, JSON.stringify(userData));
    }
  } catch (error) {
    console.error('Failed to clear patient data from localStorage:', error);
  }
};
