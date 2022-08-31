import { UserData } from './interfaces/user-data';
import { xmlHttpRequest } from './utils/utils';

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

	const userData: UserData = await response.json();
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
