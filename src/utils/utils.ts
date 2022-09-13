export async function getJSON<T = never>(url: string, details?: Partial<GM.Request>) {
	const data = await xmlHttpRequest({
		method: 'GET',
		overrideMimeType: 'application/json',
		url,
		...details,
	});

	return JSON.parse(data.responseText) as T;
}

export async function postJSON<T>(url: string, data: T) {
	await xmlHttpRequest({
		method: 'POST',
		url,
		headers: {
			'Content-Type': 'application/json',
		},
		data: JSON.stringify(data),
	});
}

export function xmlHttpRequest(details: GM.Request) {
	console.debug(`${details.method} ${details.url}`);

	return new Promise<GM.Response<unknown>>((resolve, reject) => {
		GM.xmlHttpRequest({
			onabort: reject,
			onerror: reject,
			ontimeout: reject,
			onload: resolve,
			...details,
		});
	});
}
