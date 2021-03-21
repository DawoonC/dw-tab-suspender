import { MDCSwitch } from '@material/switch';
import { MDCRipple } from '@material/ripple';
import { MDCList } from '@material/list';

import '../styles/popup.scss';
import { getTabActivityKey, storageLocalSet } from './storage';
import { getTabActivity } from './utils';

const switchControl = new MDCSwitch(document.querySelector('.tab-suspender-switch-container'));
const checkboxList = new MDCList(document.querySelector('.checkbox-list'));
const linkList = new MDCList(document.querySelector('.link-list'));
const tabSuspendSwitch = document.getElementById('tab-suspender-switch');
const settingsLink = document.getElementById('settings-link');

checkboxList.listElements.map((listItemEl) => new MDCRipple(listItemEl));
linkList.listElements.map((listItemEl) => new MDCRipple(listItemEl));

chrome.tabs.query({ active: true, currentWindow: true }, async (tabs) => {
  const [tab] = tabs;
  const key = getTabActivityKey(tab.id);
  let activity = await getTabActivity(tab.id);

  switchControl.checked = activity.isAlwaysOn;

  tabSuspendSwitch.addEventListener('change', async (event) => {
    activity = await getTabActivity(tab.id);

    activity.isAlwaysOn = event.target.checked;
    await storageLocalSet({ [key]: activity });
  });
});

settingsLink.addEventListener('click', () => {
  if (chrome.runtime.openOptionsPage) {
    chrome.runtime.openOptionsPage();
  } else {
    window.open(chrome.runtime.getURL('options.html'));
  }
});
