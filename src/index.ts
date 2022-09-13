import { UserData } from './interfaces/user-data';
import { getJSON, postJSON } from './utils/utils';

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

async function runIfLastRunWasOverAnHourAgo(run: () => void) {
	const lastRunDateString = await GM.getValue<string>('lastRunDate');

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
	return await getJSON<UserData>('https://store.steampowered.com/dynamicstore/userdata/', {
		headers: {
			'Cache-Control': 'no-cache',
			'Pragma': 'no-cache',
		},
	});
}

async function submitOwnedAppIds(userData: UserData) {
	await postJSON('https://steamhunters.com/api/steam-users/76561198044364065/update/owned', userData.rgOwnedApps);
}

async function submitIgnoredAppIds(userData: UserData) {
	const ignoredAppIds = Object.keys(userData.rgIgnoredApps).map(x => parseInt(x));

	await postJSON('https://steamhunters.com/api/steam-users/76561198044364065/update/ignored', ignoredAppIds);
}

