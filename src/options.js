import { MDCSlider } from '@material/slider';
import { MDCRipple } from '@material/ripple';
import { MDCList } from '@material/list';
import get from 'lodash/get';

import '../styles/options.scss';
import { storageSyncSet } from './storage';
import { createElementFromHTML, removeFromWhitelist } from './utils';
import {
  DEFAULT_SUSPEND_AFTER,
  SUSPEND_AFTER_KEY,
  WHITELIST_KEY,
  MIN_IN_MS,
} from './consts';

const whitelistList = document.getElementById('whitelist-list');
const slider = new MDCSlider(document.querySelector('.suspend-after-selector'));
const suspendAfterLabelValue = document.getElementById('suspend-after-label-value');
const deleteButtonHtml = `
  <button class="mdc-list-item__meta mdc-icon-button material-icons" aria-hidden="true">delete</button>
`;
const listSeparatorHtml = '<li role="separator" class="mdc-list-divider"></li>';

chrome.storage.sync.get(WHITELIST_KEY, (items) => {
  const whitelist = get(items, WHITELIST_KEY, []);

  whitelist.forEach((url) => {
    const listItem = createElementFromHTML(`
      <li class="mdc-list-item whitelist-item">
        <span class="mdc-list-item__text">${url}</span>
      </li>
    `);
    const deleteButton = createElementFromHTML(deleteButtonHtml);
    const listSeparator = createElementFromHTML(listSeparatorHtml);
    const deleteButtonRipple = new MDCRipple(deleteButton);
    deleteButtonRipple.unbounded = true;

    listItem.appendChild(deleteButton);
    whitelistList.appendChild(listItem);
    whitelistList.appendChild(listSeparator);

    deleteButton.addEventListener('click', async () => {
      await removeFromWhitelist(url);
      listItem.remove();
      listSeparator.remove();
    });
  });
});

// eslint-disable-next-line no-new
new MDCList(whitelistList);

chrome.storage.sync.get(SUSPEND_AFTER_KEY, (items) => {
  const suspendAfter = get(items, SUSPEND_AFTER_KEY, DEFAULT_SUSPEND_AFTER);
  const displayValue = suspendAfter / MIN_IN_MS;
  slider.setValue(displayValue);
  suspendAfterLabelValue.innerHTML = displayValue;

  slider.listen('MDCSlider:change', async ({ detail: { value } }) => {
    await storageSyncSet({ [SUSPEND_AFTER_KEY]: value * MIN_IN_MS });
    suspendAfterLabelValue.innerHTML = value;
  });
});
