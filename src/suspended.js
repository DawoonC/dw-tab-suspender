import { MDCRipple } from '@material/ripple';

import '../styles/suspended.scss';
import { restore, getHashParams } from './utils';

const restoreBtn = document.getElementById('restore-btn');
const tabIcon = document.getElementById('tab-icon');
const tabTitle = document.getElementById('tab-title');
const tabUrl = document.getElementById('tab-url');
// eslint-disable-next-line no-new
new MDCRipple(restoreBtn);

function setTabTitleAndIcon() {
  const params = getHashParams(window.location.hash);

  document.querySelector('link[rel="icon"]').href = params.favIconUrl;
  document.title = params.title;

  tabIcon.setAttribute('src', params.favIconUrl);
  tabTitle.innerText = params.title;
  tabUrl.innerText = params.url;
}

setTabTitleAndIcon();

restoreBtn.addEventListener('click', async () => {
  const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
  await restore(tab);
});
