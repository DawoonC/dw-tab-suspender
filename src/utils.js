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
