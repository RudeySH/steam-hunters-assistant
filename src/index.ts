import { HttpService } from './classes/HttpService';
import { IUserData } from './interfaces/IUserData';

declare global {
	interface Window {
		app?: { identity?: { steamId: string } };
		g_AccountID?: number;
	}
}

const versionKey = 'v1_2_3';
const httpService = new HttpService();

ensureDOMContentLoaded().then(() => {
	const steamId = getSteamId();

	if (steamId === undefined) {
		console.log('Steam ID not found. Are you signed in?');
		return;
	}

	runIfLastRunWasOverAnHourAgo(async () => {
		const userData = await getUserData();
		await submitOwnedAppIds(steamId, userData);
		await submitIgnoredAppIds(steamId, userData);
	});

	if (location.host === 'store.steampowered.com') {
		const hiddenButton = document.querySelector('#ignoreBtn [style="display: none;"]');

		if (hiddenButton !== null) {
			const observer = new MutationObserver(async () => {
				const userData = await getUserData();
				submitIgnoredAppIds(steamId, userData);
			});
			observer.observe(hiddenButton, { attributeFilter: ['style'] });
		}
	}
});

function ensureDOMContentLoaded() {
	return new Promise<void>(resolve => {
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

function getSteamId() {
	switch (location.host) {
		case 'steamhunters.com':
			return unsafeWindow.app?.identity?.steamId;

		case 'store.steampowered.com':
			if (unsafeWindow.g_AccountID === undefined) {
				return undefined;
			}

			return (76561197960265728n + BigInt(unsafeWindow.g_AccountID)).toString();

		default:
			return undefined;
	}
}

async function runIfLastRunWasOverAnHourAgo(run: () => Promise<unknown>) {
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
	const userData = await httpService.getJSON<IUserData>('https://store.steampowered.com/dynamicstore/userdata/', {
		headers: {
			'Cache-Control': 'no-cache',
			'Pragma': 'no-cache',
		},
	});

	if (!userData?.rgOwnedApps?.length) {
		throw 'Unable to retrieve userdata. Are you signed in on store.steampowered.com?';
	}

	return userData;
}

async function submitOwnedAppIds(steamId: string, userData: IUserData) {
	const response = await httpService.postJSON(`https://steamhunters.com/api/steam-users/${steamId}/update/owned`, userData.rgOwnedApps);

	httpService.ensureSuccessStatusCode(response);
}

async function submitIgnoredAppIds(steamId: string, userData: IUserData) {
	const ignoredAppIds = Object.keys(userData.rgIgnoredApps).map(x => parseInt(x));

	const response = await httpService.postJSON(`https://steamhunters.com/api/steam-users/${steamId}/update/ignored`, ignoredAppIds);

	httpService.ensureSuccessStatusCode(response);
}
