import {
  storageLocalGetSingle,
  getTabActivityKey,
} from './storage';

// eslint-disable-next-line import/prefer-default-export
export async function getTabActivity(tabId) {
  const key = getTabActivityKey(tabId);

  return (await storageLocalGetSingle(key))
    || { id: tabId, lastActiveAt: null, isAlwaysOn: false };
}
