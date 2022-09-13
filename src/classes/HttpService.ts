export class HttpService {
	public ensureSuccessStatusCode(response: GM.Response<unknown>) {
		if (response.status >= 200 && response.status < 300) {
			return;
		}

		throw `Response status code does not indicate success: ${response.status} (${response.statusText}).`;
	}

	public async getJSON<T = never>(url: string, details?: Partial<GM.Request>) {
		const response = await this.xmlHttpRequest({
			method: 'GET',
			overrideMimeType: 'application/json',
			url,
			...details,
		});

		this.ensureSuccessStatusCode(response);

		return JSON.parse(response.responseText) as T;
	}

	public async postJSON<T>(url: string, data: T) {
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

	public async xmlHttpRequest(details: GM.Request) {
		console.debug(`${details.method} ${details.url}`);

		const response = await new Promise<GM.Response<unknown>>((resolve, reject) => {
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
