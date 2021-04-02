import isEmpty from 'lodash/isEmpty';
import keyBy from 'lodash/keyBy';
import map from 'lodash/map';

import {
  storageSyncGetSingle,
  getTabActivityKey,
  storageLocalClear,
  storageLocalGet,
  storageLocalSet,
  storageSyncSet,
} from './storage';
import {
  createWhitelistRegExp,
  getTabActivity,
  getWhitelist,
  restore,
  suspend,
} from './utils';
import { SUSPEND_AFTER_KEY, DEFAULT_SUSPEND_AFTER } from './consts';

chrome.runtime.onInstalled.addListener(async () => {
  await storageLocalClear();

  const suspendAfter = (await storageSyncGetSingle(SUSPEND_AFTER_KEY)) || DEFAULT_SUSPEND_AFTER;

  await storageSyncSet({ [SUSPEND_AFTER_KEY]: suspendAfter });
});

chrome.alarms.create({ periodInMinutes: 1.0 });

chrome.alarms.onAlarm.addListener(async () => {
  const suspendAfter = await storageSyncGetSingle(SUSPEND_AFTER_KEY);
  const inactiveTabs = await chrome.tabs.query({
    active: false,
    audible: false,
    url: ['http://*/*', 'https://*/*'],
  });
  const tabsById = keyBy(inactiveTabs, 'id');
  const activityKeys = map(inactiveTabs, (tab) => getTabActivityKey(tab.id));
  const tabActivities = await storageLocalGet(activityKeys);
  const whitelist = await getWhitelist();
  const whitelistRegExp = createWhitelistRegExp(whitelist);

  const updateItems = inactiveTabs.reduce((acc, tab) => {
    const activity = (tabActivities[getTabActivityKey(tab.id)]
      || { id: tab.id, lastActiveAt: null });

    if (activity.lastActiveAt) {
      return acc;
    }

    activity.lastActiveAt = Date.now();
    return { ...acc, [getTabActivityKey(tab.id)]: activity };
  }, {});

  // update lastActiveAt in storage
  if (!isEmpty(updateItems)) {
    await storageLocalSet(updateItems);
  }

  const updatedTabActivities = { ...tabActivities, ...updateItems };

  // suspend tabs
  await Promise.all(map(inactiveTabs, (tab) => {
    const activity = updatedTabActivities[getTabActivityKey(tab.id)];

    if (
      whitelistRegExp.test(tab.url)
      || (Date.now() - activity.lastActiveAt) < suspendAfter
    ) {
      return Promise.resolve();
    }

    return suspend(tabsById[tab.id]);
  }));
});

chrome.tabs.onActivated.addListener(async ({ tabId }) => {
  const suspendedPageUrl = `chrome-extension://${chrome.runtime.id}/suspended.html`;
  const key = getTabActivityKey(tabId);
  const activity = await getTabActivity(tabId);
  const tab = await chrome.tabs.get(tabId);

  activity.lastActiveAt = null;
  await storageLocalSet({ [key]: activity });

  if (tab.url.startsWith(suspendedPageUrl)) {
    await restore(tab);
  }
});
