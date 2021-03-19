import get from 'lodash/get';

const color = '#3aa757';

chrome.runtime.onInstalled.addListener(() => {
  chrome.storage.sync.set({ color });
});

chrome.alarms.create({ periodInMinutes: 1.0 });

chrome.alarms.onAlarm.addListener(async () => {
  console.log('---');
  console.log('alarm at:', new Date());

  const inactiveTabs = await chrome.tabs.query({ active: false, url: ['http://*/*', 'https://*/*'] });
  const keys = inactiveTabs.map((tab) => `tabActivity:${tab.id}`);
  console.log('keys:', keys);

  // const tabActivities = await chrome.storage.local.get(keys);
  const tabActivities = await new Promise((resolve) => chrome.storage.local.get(keys, resolve));
  console.log('tabActivities:', tabActivities);

  // TODO: suspend page

  const updateItems = inactiveTabs.reduce((acc, tab) => {
    const lastActiveAt = get(tabActivities, `['tabActivity:${tab.id}'].lastActiveAt`);
    // const lastActiveAt = (tabActivities[`tabActivity:${tab.id}`] || {}).lastActiveAt;
    // const { lastActiveAt } = (tabActivities[`tabActivity:${tab.id}`] || {});
    // const { [`tabActivity:${tab.id}`]: { lastActiveAt } = {} } = (tabActivities || {});

    if (lastActiveAt) {
      return acc;
    }

    const item = { id: tab.id, lastActiveAt: new Date() };
    return { ...acc, [`tabActivity:${tab.id}`]: item };
  }, {});
  console.log('updateItems:', updateItems);

  if (Object.keys(updateItems).length > 0) {
    await chrome.storage.local.set(updateItems);
  }
  console.log('---');
});

chrome.tabs.onActivated.addListener(async ({ tabId }) => {
  const suspendedPageUrl = `chrome-extension://${chrome.runtime.id}/suspended.html`;
  const activity = { id: tabId, lastActiveAt: null };
  const tab = await chrome.tabs.get(tabId);

  await chrome.storage.local.set({ [`tabActivity:${tabId}`]: activity });

  console.log('active tab URL:', tab.url);

  if (tab.url.startsWith(suspendedPageUrl)) {
    console.log('Hello world!');
  }
});
