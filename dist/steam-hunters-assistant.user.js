// ==UserScript==
// @name Steam Hunters Assistant
// @description General-purpose userscript for Steam Hunters.
// @version 1.2.2
// @author Rudey
// @homepage https://github.com/RudeySH/steam-hunters-assistant#readme
// @supportURL https://github.com/RudeySH/steam-hunters-assistant/issues
// @match https://steamhunters.com/*
// @match https://store.steampowered.com/*
// @connect steamhunters.com
// @connect store.steampowered.com
// @grant GM.getValue
// @grant GM.setValue
// @grant GM.xmlHttpRequest
// @icon https://steamhunters.com/content/img/steam_hunters.svg
// @namespace https://github.com/RudeySH/steam-hunters-assistant
// ==/UserScript==

/******/ (() => { // webpackBootstrap
/******/ 	"use strict";
var __webpack_exports__ = {};

;// CONCATENATED MODULE: ./src/classes/HttpService.ts
class HttpService {
    ensureSuccessStatusCode(response) {
        if (response.status >= 200 && response.status < 300) {
            return;
        }
        throw `Response status code does not indicate success: ${response.status} (${response.statusText}).`;
    }
    async getJSON(url, details) {
        const response = await this.xmlHttpRequest({
            method: 'GET',
            overrideMimeType: 'application/json',
            url,
            ...details,
        });
        this.ensureSuccessStatusCode(response);
        return JSON.parse(response.responseText);
    }
    async postJSON(url, data) {
        const response = await this.xmlHttpRequest({
            method: 'POST',
            url,
            headers: {
                'Content-Type': 'application/json',
            },
            data: JSON.stringify(data),
        });
        return response;
    }
    async xmlHttpRequest(details) {
        console.debug(`${details.method} ${details.url}`);
        const response = await new Promise((resolve, reject) => {
            GM.xmlHttpRequest({
                onabort: reject,
                onerror: reject,
                ontimeout: reject,
                onload: resolve,
                ...details,
            });
        });
        console.info(`${details.method} ${details.url} ${response.status}`);
        return response;
    }
}

;// CONCATENATED MODULE: ./src/index.ts

const versionKey = 'v1_2_2';
const httpService = new HttpService();
ensureDOMContentLoaded().then(() => {
    const userId = getUserId();
    if (userId === undefined) {
        console.log('User ID not found. Are you signed in?');
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
function ensureDOMContentLoaded() {
    return new Promise(resolve => {
        if (document.readyState === 'interactive' || document.readyState === 'complete') {
            resolve();
            return;
        }
        document.addEventListener('readystatechange', function listener() {
            if (document.readyState === 'interactive' || document.readyState === 'complete') {
                document.removeEventListener('readystatechange', listener);
                resolve();
            }
        });
    });
}
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
    const key = `lastRunDate_${versionKey}`;
    const lastRunDateString = await GM.getValue(key, '');
    if (lastRunDateString) {
        const lastRunDate = new Date(lastRunDateString);
        if (new Date().getTime() - lastRunDate.getTime() < 3600000) {
            return;
        }
    }
    await run();
    await GM.setValue(key, new Date().toISOString());
}
async function getUserData() {
    var _a;
    const userData = await httpService.getJSON('https://store.steampowered.com/dynamicstore/userdata/', {
        headers: {
            'Cache-Control': 'no-cache',
            'Pragma': 'no-cache',
        },
    });
    if (!((_a = userData === null || userData === void 0 ? void 0 : userData.rgOwnedApps) === null || _a === void 0 ? void 0 : _a.length)) {
        throw 'Unable to retrieve userdata. Are you signed in on store.steampowered.com?';
    }
    return userData;
}
async function submitOwnedAppIds(userId, userData) {
    const userIdPath = userId.type === 'steamId' ? userId.value : `id/${userId.value}`;
    const response = await httpService.postJSON(`https://steamhunters.com/api/steam-users/${userIdPath}/update/owned`, userData.rgOwnedApps);
    httpService.ensureSuccessStatusCode(response);
}
async function submitIgnoredAppIds(userId, userData) {
    const userIdPath = userId.type === 'steamId' ? userId.value : `id/${userId.value}`;
    const ignoredAppIds = Object.keys(userData.rgIgnoredApps).map(x => parseInt(x));
    const response = await httpService.postJSON(`https://steamhunters.com/api/steam-users/${userIdPath}/update/ignored`, ignoredAppIds);
    httpService.ensureSuccessStatusCode(response);
}

/******/ })()
;