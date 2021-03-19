import isEmpty from 'lodash/isEmpty';
import keyBy from 'lodash/keyBy';
import get from 'lodash/get';
import map from 'lodash/map';

const color = '#3aa757';
const defaultSuspendAfter = 30 * 60 * 1000; // 30 mins

async function storageGet(keys) {
  return new Promise((resolve) => chrome.storage.local.get(keys, resolve));
}

async function storageGetSingle(key) {
  return get(await storageGet([key]), key);
}

function getHashParams(url) {
  return url.split('#')[1]
    .split('&')
    .reduce((acc, curr) => {
      const [key, val] = curr.split('=');
      return { ...acc, [key]: decodeURIComponent(val) };
    }, {});
}

async function suspend(tabInfo) {
  const { title, favIconUrl, url } = tabInfo;
  const params = `title=${title}&favIconUrl=${favIconUrl}&url=${url}`;
  const suspendedUrl = `chrome-extension://${chrome.runtime.id}/suspended.html#${params}`;

  return chrome.tabs.update(tabInfo.id, { url: suspendedUrl });
}

chrome.runtime.onInstalled.addListener(() => {
  chrome.storage.sync.set({ color });
  chrome.storage.local.clear(() => console.log('storage cleared!'));
  chrome.storage.local.set({ suspendAfter: defaultSuspendAfter });
});

chrome.alarms.create({ periodInMinutes: 1.0 });

chrome.alarms.onAlarm.addListener(async () => {
  const suspendAfter = await storageGetSingle('suspendAfter');
  const inactiveTabs = await chrome.tabs.query({ active: false, url: ['http://*/*', 'https://*/*'] });
  const tabsById = keyBy(inactiveTabs, 'id');
  const keys = map(inactiveTabs, (tab) => `tabActivity:${tab.id}`);
  console.log('suspendAfter:', suspendAfter);
  console.log('keys:', keys);

  const tabActivities = await storageGet(keys);
  console.log('tabActivities:', tabActivities);

  const updateItems = inactiveTabs.reduce((acc, tab) => {
    const lastActiveAt = get(tabActivities, `['tabActivity:${tab.id}'].lastActiveAt`);

    if (lastActiveAt) {
      return acc;
    }

    const item = {
      id: tab.id,
      lastActiveAt: Date.now(),
      isAlwaysOn: false,
    };
    return { ...acc, [`tabActivity:${tab.id}`]: item };
  }, {});
  console.log('updateItems:', updateItems);

  // update lastActiveAt in storage
  if (!isEmpty(updateItems)) {
    await chrome.storage.local.set(updateItems);
  }

  // suspend tabs
  await Promise.all(map(updateItems, (item) => {
    if ((Date.now() - item.lastActiveAt) > suspendAfter) {
      return suspend(tabsById[item.id]);
    }

    return Promise.resolve();
  }));
});

chrome.tabs.onActivated.addListener(async ({ tabId }) => {
  const suspendedPageUrl = `chrome-extension://${chrome.runtime.id}/suspended.html`;
  const key = `tabActivity:${tabId}`;
  const activity = (await storageGetSingle(key))
    || { id: tabId, lastActiveAt: null, isAlwaysOn: false };
  const tab = await chrome.tabs.get(tabId);

  activity.lastActiveAt = null;
  await chrome.storage.local.set({ [key]: activity });

  console.log('active tab URL:', tab.url);

  if (tab.url.startsWith(suspendedPageUrl)) {
    const { url } = getHashParams(tab.url);
    await chrome.tabs.update(tab.id, { url });
  }
});
