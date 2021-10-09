// ==UserScript==
// @name        Steam Hunters Assistant
// @version     1.0.0
// @author      Rudey
// @description General-purpose userscript for Steam Hunters.
// @homepage    https://github.com/RudeySH/steam-hunters-assistant#readme
// @supportURL  https://github.com/RudeySH/steam-hunters-assistant/issues
// @match       https://store.steampowered.com/app/*
// @namespace   https://github.com/RudeySH/steam-hunters-assistant
// @grant       GM.xmlHttpRequest
// @connect     steamhunters.com
// @downloadURL https://github.com/RudeySH/steam-hunters-assistant/raw/main/dist/steam-hunters-assistant.user.js
// @updateURL   https://github.com/RudeySH/steam-hunters-assistant/raw/main/dist/steam-hunters-assistant.meta.js
// ==/UserScript==

/******/ (() => { // webpackBootstrap
/******/ 	"use strict";
var __webpack_exports__ = {};

;// CONCATENATED MODULE: ./src/utils/utils.ts
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

const hiddenButton = document.querySelector('#ignoreBtn [style="display: none;"]');
if (hiddenButton !== null) {
    const observer = new MutationObserver(submitIgnoredAppIds);
    observer.observe(hiddenButton, { attributeFilter: ['style'] });
}
async function submitIgnoredAppIds() {
    const response = await fetch('https://store.steampowered.com/dynamicstore/userdata/', {
        headers: {
            'Cache-Control': 'no-cache',
            'Pragma': 'no-cache',
        },
    });
    const userData = await response.json();
    const ignoredAppIds = Object.keys(userData.rgIgnoredApps).map(x => parseInt(x));
    await xmlHttpRequest({
        method: 'POST',
        url: 'https://steamhunters.com/api/steam-users/76561198044364065/update/ignored',
        headers: {
            'Content-Type': 'application/json',
        },
        data: JSON.stringify(ignoredAppIds),
    });
}

/******/ })()
;