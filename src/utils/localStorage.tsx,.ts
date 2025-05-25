// src/utils/localStorage.js

// Lưu dữ liệu vào localStorage
export function saveToLocalStorage(key, value) {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch (e) {
    // eslint-disable-next-line no-console
    console.warn('Lỗi khi lưu localStorage:', e);
  }
}

// Lấy dữ liệu từ localStorage
export function loadFromLocalStorage(key, defaultValue = null) {
  try {
    const item = localStorage.getItem(key);
    return item ? JSON.parse(item) : defaultValue;
  } catch (e) {
    // eslint-disable-next-line no-console
    console.warn('Lỗi khi đọc localStorage:', e);
    return defaultValue;
  }
}