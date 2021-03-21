import { MDCSlider } from '@material/slider';
import get from 'lodash/get';

import '../styles/options.scss';
import { storageSyncSet } from './storage';
import { SUSPEND_AFTER_KEY, DEFAULT_SUSPEND_AFTER, MIN_IN_MS } from './consts';

const slider = new MDCSlider(document.querySelector('.suspend-after-selector'));
const suspendAfterLabelValue = document.getElementById('suspend-after-label-value');

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
