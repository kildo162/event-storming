/**
 * Save data to local storage with the specified key
 */
export const saveToLocalStorage = <T>(key: string, data: T): void => {
  try {
    const serializedData = JSON.stringify(data);
    localStorage.setItem(key, serializedData);
    
    // Verify the save was successful
    const saved = localStorage.getItem(key);
    if (!saved) {
      console.warn("Failed to save data to localStorage");
    }
  } catch (error) {
    console.error('Error saving to localStorage:', error);
  }
};

/**
 * Load data from local storage with the specified key
 */
export const loadFromLocalStorage = <T>(key: string, defaultValue: T): T => {
  try {
    const item = localStorage.getItem(key);
    
    // Log debug info
    if (item) {
      console.log(`Found data in localStorage for key "${key}"`);
    } else {
      console.log(`No data found in localStorage for key "${key}"`);
    }
    
    // Parse the item if it exists, otherwise return default
    return item ? JSON.parse(item) : defaultValue;
  } catch (error) {
    console.error('Error loading from localStorage:', error);
    return defaultValue;
  }
};
