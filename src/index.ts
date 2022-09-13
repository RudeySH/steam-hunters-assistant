import { HttpService } from './classes/HttpService';
import { IUserData } from './interfaces/IUserData';
import { IUserId } from './interfaces/IUserId';

declare global {
	interface Window {
		app: { identity?: { steamId: string } };
	}
}

const httpService = new HttpService();

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

	return { value, type: 'steamId' } as IUserId;
}

function getSteamStoreUserId() {
	const avatarLink = document.querySelector<HTMLAnchorElement>(`
		a[href^="https://steamcommunity.com/id/"],
		a[href^="https://steamcommunity.com/profiles/"]`);

	const avatarLinkParts = avatarLink?.href?.split('/') ?? [];

	console.log(avatarLink);

	switch (avatarLinkParts[3]) {
		case 'id':
			return { value: avatarLinkParts[4], type: 'vanityId' } as IUserId;

		case 'profiles':
			return { value: avatarLinkParts[4], type: 'steamId' } as IUserId;

		default:
			return undefined;
	}
}

async function runIfLastRunWasOverAnHourAgo(run: () => Promise<unknown>) {
	const key = 'lastRunDate_v1_2_0';
	const lastRunDateString = await GM.getValue<string>(key);

	if (lastRunDateString !== undefined) {
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

async function submitOwnedAppIds(userId: IUserId, userData: IUserData) {
	const userIdPath = userId.type === 'steamId' ? userId.value : `id/${userId.value}`;

	const response = await httpService.postJSON(`https://steamhunters.com/api/steam-users/${userIdPath}/update/owned`, userData.rgOwnedApps);

	httpService.ensureSuccessStatusCode(response);
}

async function submitIgnoredAppIds(userId: IUserId, userData: IUserData) {
	const userIdPath = userId.type === 'steamId' ? userId.value : `id/${userId.value}`;

	const ignoredAppIds = Object.keys(userData.rgIgnoredApps).map(x => parseInt(x));

	const response = await httpService.postJSON(`https://steamhunters.com/api/steam-users/${userIdPath}/update/ignored`, ignoredAppIds);

	httpService.ensureSuccessStatusCode(response);
}
