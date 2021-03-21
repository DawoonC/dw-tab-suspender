import get from 'lodash/get';

// Base functions
async function storageGet(keys, location) {
  return new Promise((resolve) => chrome.storage[location].get(keys, resolve));
}

async function storageGetSingle(key, location) {
  return get(await storageGet([key], location), key);
}

async function storageClear(location) {
  return new Promise((resolve) => chrome.storage[location].clear(resolve));
}

async function storageSet(items, location) {
  return chrome.storage[location].set(items);
}

// Local functions
export async function storageLocalGet(keys) {
  return storageGet(keys, 'local');
}

export async function storageLocalGetSingle(keys) {
  return storageGetSingle(keys, 'local');
}

export async function storageLocalClear() {
  return storageClear('local');
}

export async function storageLocalSet(items) {
  return storageSet(items, 'local');
}

// Sync functions
export async function storageSyncGet(keys) {
  return storageGet(keys, 'sync');
}

export async function storageSyncGetSingle(keys) {
  return storageGetSingle(keys, 'sync');
}

export async function storageSyncSet(items) {
  return storageSet(items, 'sync');
}

// etc.
export function getTabActivityKey(tabId) {
  return `tabActivity:${tabId}`;
}
