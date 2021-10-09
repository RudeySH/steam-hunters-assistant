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
