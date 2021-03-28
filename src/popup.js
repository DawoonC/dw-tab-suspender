import { MDCSwitch } from '@material/switch';
import { MDCRipple } from '@material/ripple';
import { MDCList } from '@material/list';

import '../styles/popup.scss';
import {
  removeFromWhitelist,
  getDomainFromUrl,
  addToWhitelist,
  getWhitelist,
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

settingsLink.addEventListener('click', () => {
  if (chrome.runtime.openOptionsPage) {
    chrome.runtime.openOptionsPage();
  } else {
    window.open(chrome.runtime.getURL('options.html'));
  }
});
