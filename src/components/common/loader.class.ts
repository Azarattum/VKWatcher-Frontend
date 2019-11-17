/**
 * Class for async AJAX loading with JSON support.
 */
export default class Loader {
	public urls: string[];

	constructor(urls: Array<string>) {
		this.urls = urls;
	}

	public async load(): Promise<Array<any>> {
		let responses: Array<any> = [];
		for (const url of this.urls) {
			const response = await this.request("GET", url);
			responses.push(response)
		}

		return [...responses];
	}

	private async request(method: string, url: string): Promise<any> {
		return new Promise(function (resolve, reject) {
			let xhr = new XMLHttpRequest();
			//Assume json request
			if (url.replace(new RegExp("/$"), "").endsWith(".json")) {
				xhr.overrideMimeType("application/json");
				xhr.responseType = "json";
			}

			xhr.open(method, url);
			xhr.onload = function () {
				if (this.status >= 200 && this.status < 300) {
					resolve(xhr.response);
				} else {
					reject({
						status: this.status,
						statusText: xhr.statusText
					});
				}
			};
			xhr.onerror = function () {
				reject({
					status: this.status,
					statusText: xhr.statusText
				});
			};
			xhr.send();
		});
	}
}
