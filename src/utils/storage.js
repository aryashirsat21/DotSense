import AsyncStorage from '@react-native-async-storage/async-storage';

const SCAN_HISTORY_KEY = 'dotsense_scan_history';

export async function saveScan(scan) {
  try {
    const existing = await getHistory();
    const updated = [scan, ...existing].slice(0, 50); // keep last 50
    await AsyncStorage.setItem(SCAN_HISTORY_KEY, JSON.stringify(updated));
    return true;
  } catch (err) {
    console.warn('Save scan failed:', err.message);
    return false;
  }
}

export async function getHistory() {
  try {
    const data = await AsyncStorage.getItem(SCAN_HISTORY_KEY);
    return data ? JSON.parse(data) : [];
  } catch {
    return [];
  }
}

export async function clearHistory() {
  try {
    await AsyncStorage.removeItem(SCAN_HISTORY_KEY);
    return true;
  } catch {
    return false;
  }
}