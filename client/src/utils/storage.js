/**
 * Unified storage utility for managing mock data in localStorage.
 */

// Simulated network latency
export const delay = (ms = 600) => new Promise(resolve => setTimeout(resolve, ms));

export const loadData = (key, defaultData = []) => {
  try {
    const data = localStorage.getItem(key);
    if (data) {
      return JSON.parse(data);
    }
    // Seed with default data if empty
    saveData(key, defaultData);
    return defaultData;
  } catch (error) {
    console.error(`Error loading data for key ${key}:`, error);
    return defaultData;
  }
};

export const saveData = (key, data) => {
  try {
    localStorage.setItem(key, JSON.stringify(data));
  } catch (error) {
    console.error(`Error saving data for key ${key}:`, error);
  }
};

export const resetData = (key, defaultData = []) => {
  saveData(key, defaultData);
  return defaultData;
};
