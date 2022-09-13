import { UserData } from './interfaces/user-data';
import { UserId } from './interfaces/user-id';
import { getJSON, postJSON } from './utils/utils';

declare global {
	interface Window {
		app: { identity?: { steamId: string } };
	}
}

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

	return { value, type: 'steamId' } as UserId;
}

function getSteamStoreUserId() {
	const avatarLink = document.querySelector<HTMLAnchorElement>(`
		a[href^="https://steamcommunity.com/id/"],
		a[href^="https://steamcommunity.com/profiles/"]`);

	const avatarLinkParts = avatarLink?.href?.split('/') ?? [];

	console.log(avatarLink);

	switch (avatarLinkParts[3]) {
		case 'id':
			return { value: avatarLinkParts[4], type: 'vanityId' } as UserId;

		case 'profiles':
			return { value: avatarLinkParts[4], type: 'steamId' } as UserId;

		default:
			return undefined;
	}
}

async function runIfLastRunWasOverAnHourAgo(run: () => void) {
	const key = 'lastRunDate_v1_1_1';
	const lastRunDateString = await GM.getValue<string>(key);

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
	return await getJSON<UserData>('https://store.steampowered.com/dynamicstore/userdata/', {
		headers: {
			'Cache-Control': 'no-cache',
			'Pragma': 'no-cache',
		},
	});
}

async function submitOwnedAppIds(userId: UserId, userData: UserData) {
	const userIdPath = userId.type === 'steamId' ? userId.value : `id/${userId.value}`;

	await postJSON(`https://steamhunters.com/api/steam-users/${userIdPath}/update/owned`, userData.rgOwnedApps);
}

async function submitIgnoredAppIds(userId: UserId, userData: UserData) {
	const userIdPath = userId.type === 'steamId' ? userId.value : `id/${userId.value}`;

	const ignoredAppIds = Object.keys(userData.rgIgnoredApps).map(x => parseInt(x));

	await postJSON(`https://steamhunters.com/api/steam-users/${userIdPath}/update/ignored`, ignoredAppIds);
}
