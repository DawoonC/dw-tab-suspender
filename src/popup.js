import { MDCSwitch } from '@material/switch';
import { MDCRipple } from '@material/ripple';
import { MDCList } from '@material/list';
import map from 'lodash/map';

import '../styles/popup.scss';
import {
  getTabActivityKey,
  storageLocalSet,
} from './storage';
import {
  removeFromWhitelist,
  getDomainFromUrl,
  getTabActivity,
  addToWhitelist,
  getWhitelist,
  restore,
  suspend,
} from './utils';

const domainSwitchControl = new MDCSwitch(document.querySelector('.domain-suspend-switch-container'));
const urlSwitchControl = new MDCSwitch(document.querySelector('.url-suspend-switch-container'));
const checkboxList = new MDCList(document.querySelector('.checkbox-list'));
const linkList = new MDCList(document.querySelector('.link-list'));
const domainSwitch = document.getElementById('domain-suspend-switch');
const urlSwitch = document.getElementById('url-suspend-switch');
const suspendNowLink = document.getElementById('suspend-now-link');
const settingsLink = document.getElementById('settings-link');
const restoreAllLink = document.getElementById('restore-all-link');

checkboxList.listElements.map((listItemEl) => new MDCRipple(listItemEl));
linkList.listElements.map((listItemEl) => new MDCRipple(listItemEl));

chrome.tabs.query({ active: true, currentWindow: true }, async (tabs) => {
  const [tab] = tabs;
  const domain = `${getDomainFromUrl(tab.url)}/*`;
  const whitelist = await getWhitelist();

  domainSwitchControl.checked = whitelist.indexOf(domain) !== -1;
  urlSwitchControl.checked = whitelist.indexOf(tab.url) !== -1;

  domainSwitch.addEventListener('change', async (event) => {
    if (event.target.checked) {
      await addToWhitelist(domain);
    } else {
      await removeFromWhitelist(domain);
    }
  });

  urlSwitch.addEventListener('change', async (event) => {
    if (event.target.checked) {
      await addToWhitelist(tab.url);
    } else {
      await removeFromWhitelist(tab.url);
    }
  });
});

suspendNowLink.addEventListener('click', async () => {
  const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
  await suspend(tab);
});

restoreAllLink.addEventListener('click', async () => {
  const suspendedTabs = await chrome.tabs.query({
    active: false,
    url: [`chrome-extension://${chrome.runtime.id}/suspended.html*`],
  });

  // eslint-disable-next-line no-alert
  if (!window.confirm(`Restore ${suspendedTabs.length} tabs now?`)) {
    return;
  }

  await Promise.all(map(suspendedTabs, async (tab) => {
    const key = getTabActivityKey(tab.id);
    const activity = await getTabActivity(tab.id);

    activity.lastActiveAt = null;
    await storageLocalSet({ [key]: activity });
    await restore(tab);
  }));
});

settingsLink.addEventListener('click', () => {
  if (chrome.runtime.openOptionsPage) {
    chrome.runtime.openOptionsPage();
  } else {
    window.open(chrome.runtime.getURL('options.html'));
  }
});
