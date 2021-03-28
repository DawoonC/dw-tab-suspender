import filter from 'lodash/filter';
import uniq from 'lodash/uniq';
import map from 'lodash/map';
import {
  storageLocalGetSingle,
  storageSyncGetSingle,
  getTabActivityKey,
  storageSyncSet,
} from './storage';
import { WHITELIST_KEY } from './consts';

export async function getTabActivity(tabId) {
  const key = getTabActivityKey(tabId);

  return (await storageLocalGetSingle(key))
    || { id: tabId, lastActiveAt: null };
}

export async function getWhitelist() {
  return (await storageSyncGetSingle(WHITELIST_KEY)) || [];
}

export async function addToWhitelist(url) {
  const whitelist = await getWhitelist();

  await storageSyncSet({
    [WHITELIST_KEY]: uniq([...whitelist, url]),
  });
}

export async function removeFromWhitelist(url) {
  const whitelist = await getWhitelist();

  await storageSyncSet({
    [WHITELIST_KEY]: filter(whitelist, (item) => item !== url),
  });
}

export function createWhitelistRegExp(whitelist) {
  const combined = map(whitelist, (url) => {
    if (url.endsWith('/*')) {
      return `^${url.replace('/*', '')}`;
    }

    return `^${url}$`;
  }).join('|');

  if (combined.length > 0) {
    return new RegExp(combined);
  }

  return new RegExp('^$');
}

export function getDomainFromUrl(url) {
  const a = document.createElement('a');
  a.setAttribute('href', url);

  return a.origin;
}

export function createElementFromHTML(html) {
  const template = document.createElement('template');
  template.innerHTML = html.trim();

  return template.content.firstChild;
}

export function getHashParams(url) {
  return url.split('#')[1]
    .split('&')
    .reduce((acc, curr) => {
      const [key, val] = curr.split('=');
      return { ...acc, [key]: decodeURIComponent(val) };
    }, {});
}

export async function suspend(tabInfo) {
  const { title, favIconUrl, url } = tabInfo;
  const params = `title=${title}&favIconUrl=${favIconUrl}&url=${url}`;
  const suspendedUrl = `chrome-extension://${chrome.runtime.id}/suspended.html#${params}`;

  console.log(suspendedUrl, 'is now suspended!');
  return chrome.tabs.update(tabInfo.id, { url: suspendedUrl });
}

export async function restore(tabInfo) {
  const { url } = getHashParams(tabInfo.url);
  console.log(url, 'is now active!');
  await chrome.tabs.update(tabInfo.id, { url });
}
