// ==UserScript==
// @name        Steam Hunters Assistant
// @version     1.1.1
// @author      Rudey
// @description General-purpose userscript for Steam Hunters.
// @homepage    https://github.com/RudeySH/steam-hunters-assistant#readme
// @supportURL  https://github.com/RudeySH/steam-hunters-assistant/issues
// @match       https://steamhunters.com/*
// @match       https://store.steampowered.com/*
// @license     AGPL-3.0-or-later
// @icon        https://steamhunters.com/content/img/steam_hunters.svg
// @namespace   https://github.com/RudeySH/steam-hunters-assistant
// @grant       GM.getValue
// @grant       GM.setValue
// @grant       GM.xmlHttpRequest
// @connect     steamhunters.com
// @connect     store.steampowered.com
// @downloadURL https://github.com/RudeySH/steam-hunters-assistant/raw/main/dist/steam-hunters-assistant.user.js
// @updateURL   https://github.com/RudeySH/steam-hunters-assistant/raw/main/dist/steam-hunters-assistant.meta.js
// ==/UserScript==

/******/ (() => { // webpackBootstrap
/******/ 	"use strict";
var __webpack_exports__ = {};

;// CONCATENATED MODULE: ./src/utils/utils.ts
async function getJSON(url, details) {
    const data = await xmlHttpRequest({
        method: 'GET',
        overrideMimeType: 'application/json',
        url,
        ...details,
    });
    return JSON.parse(data.responseText);
}
async function postJSON(url, data) {
    await xmlHttpRequest({
        method: 'POST',
        url,
        headers: {
            'Content-Type': 'application/json',
        },
        data: JSON.stringify(data),
    });
}
function xmlHttpRequest(details) {
    console.debug(`${details.method} ${details.url}`);
    return new Promise((resolve, reject) => {
        GM.xmlHttpRequest({
            onabort: reject,
            onerror: reject,
            ontimeout: reject,
            onload: resolve,
            ...details,
        });
    });
}

;// CONCATENATED MODULE: ./src/index.ts

window.addEventListener('DOMContentLoaded', () => {
    const userId = getUserId();
    if (userId === undefined) {
        return;
    }
    runIfLastRunWasOverAnHourAgo(async () => {
        const userData = await getUserData();
        await submitOwnedAppIds(userId, userData);
        await submitIgnoredAppIds(userId, userData);
    });
    if (location.host === 'store.steampowered.com') {
        const hiddenButton = document.querySelector('#ignoreBtn [style="display: none;"]');
        if (hiddenButton !== null) {
            const observer = new MutationObserver(async () => {
                const userData = await getUserData();
                submitIgnoredAppIds(userId, userData);
            });
            observer.observe(hiddenButton, { attributeFilter: ['style'] });
        }
    }
});
function getUserId() {
    switch (location.host) {
        case 'steamhunters.com':
            return getSteamHuntersUserId();
        case 'store.steampowered.com':
            return getSteamStoreUserId();
        default:
            return undefined;
    }
}
function getSteamHuntersUserId() {
    if (unsafeWindow.app.identity === undefined) {
        return undefined;
    }
    const value = unsafeWindow.app.identity.steamId;
    return { value, type: 'steamId' };
}
function getSteamStoreUserId() {
    var _a, _b;
    const avatarLink = document.querySelector(`
		a[href^="https://steamcommunity.com/id/"],
		a[href^="https://steamcommunity.com/profiles/"]`);
    const avatarLinkParts = (_b = (_a = avatarLink === null || avatarLink === void 0 ? void 0 : avatarLink.href) === null || _a === void 0 ? void 0 : _a.split('/')) !== null && _b !== void 0 ? _b : [];
    console.log(avatarLink);
    switch (avatarLinkParts[3]) {
        case 'id':
            return { value: avatarLinkParts[4], type: 'vanityId' };
        case 'profiles':
            return { value: avatarLinkParts[4], type: 'steamId' };
        default:
            return undefined;
    }
}
async function runIfLastRunWasOverAnHourAgo(run) {
    const key = 'lastRunDate_v1_1_1';
    const lastRunDateString = await GM.getValue(key);
    if (lastRunDateString !== undefined) {
        const lastRunDate = new Date(lastRunDateString);
        if (new Date().getTime() - lastRunDate.getTime() < 3600000) {
            return;
        }
    }
    await GM.setValue(key, new Date().toISOString());
    run();
}
async function getUserData() {
    return await getJSON('https://store.steampowered.com/dynamicstore/userdata/', {
        headers: {
            'Cache-Control': 'no-cache',
            'Pragma': 'no-cache',
        },
    });
}
async function submitOwnedAppIds(userId, userData) {
    const userIdPath = userId.type === 'steamId' ? userId.value : `id/${userId.value}`;
    await postJSON(`https://steamhunters.com/api/steam-users/${userIdPath}/update/owned`, userData.rgOwnedApps);
}
async function submitIgnoredAppIds(userId, userData) {
    const userIdPath = userId.type === 'steamId' ? userId.value : `id/${userId.value}`;
    const ignoredAppIds = Object.keys(userData.rgIgnoredApps).map(x => parseInt(x));
    await postJSON(`https://steamhunters.com/api/steam-users/${userIdPath}/update/ignored`, ignoredAppIds);
}

/******/ })()
;