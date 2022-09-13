// ==UserScript==
// @name        Steam Hunters Assistant
// @version     1.1.0
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

runIfLastRunWasOverAnHourAgo(async () => {
    const userData = await getUserData();
    await submitOwnedAppIds(userData);
    await submitIgnoredAppIds(userData);
});
if (location.host === 'store.steampowered.com') {
    const hiddenButton = document.querySelector('#ignoreBtn [style="display: none;"]');
    if (hiddenButton !== null) {
        const observer = new MutationObserver(async () => {
            const userData = await getUserData();
            submitIgnoredAppIds(userData);
        });
        observer.observe(hiddenButton, { attributeFilter: ['style'] });
    }
}
async function runIfLastRunWasOverAnHourAgo(run) {
    const lastRunDateString = await GM.getValue('lastRunDate');
    if (lastRunDateString !== undefined) {
        const lastRunDate = new Date(lastRunDateString);
        if (new Date().getTime() - lastRunDate.getTime() < 3600000) {
            return;
        }
    }
    await GM.setValue('lastRunDate', new Date().toISOString());
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
async function submitOwnedAppIds(userData) {
    await postJSON('https://steamhunters.com/api/steam-users/76561198044364065/update/owned', userData.rgOwnedApps);
}
async function submitIgnoredAppIds(userData) {
    const ignoredAppIds = Object.keys(userData.rgIgnoredApps).map(x => parseInt(x));
    await postJSON('https://steamhunters.com/api/steam-users/76561198044364065/update/ignored', ignoredAppIds);
}

/******/ })()
;