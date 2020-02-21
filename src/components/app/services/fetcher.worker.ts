const ctx: Worker = self as any;
ctx.addEventListener("message", async (eventArgs: MessageEvent) => {
	if (eventArgs.data.url) {
		const url = eventArgs.data.url;
		Fetcher.initialize(url);
	}
	if (eventArgs.data.userId != null) {
		await Fetcher.selectUser(eventArgs.data.userId);
		ctx.postMessage({ loaded: true });
	}
});

/**
 * Class for fetching user data from remote API
 */
class Fetcher {
	private static readonly maxRequests = 3;
	private static readonly requestInterval = 200;
	private static activeRequests = 0;
	private static loadStatuses: LoadStatus[];
	private static url: string;
	private static ids: string[];

	/**
	 * Initializes the fetcher
	 * @param url API Url
	 */
	public static async initialize(url: string): Promise<void> {
		this.url = url;

		//Load names
		this.activeRequests++;
		const names = await this.fetchNames();
		if (!names) {
			throw new Error("Unable to load names!");
		}
		this.activeRequests--;

		//Start background loading
		setTimeout(this.backgroundLoad.bind(this), this.requestInterval);
	}

	/**
	 * Triggers fetch on user selection
	 */
	public static async selectUser(userId: number): Promise<void> {
		//Get last 30 days
		if (this.loadStatuses[userId] == LoadStatus.None) {
			this.activeRequests++;
			this.loadStatuses[userId] = LoadStatus.Requested;
			if (await this.fetchSessions(userId)) {
				this.loadStatuses[userId] = LoadStatus.Loaded;
			}
			this.activeRequests--;
		}

		//Get the rest
		setTimeout(
			(async (): Promise<void> => {
				if (this.loadStatuses[userId] != LoadStatus.Full) {
					this.activeRequests++;
					if (await this.fetchSessions(userId, true)) {
						this.loadStatuses[userId] = LoadStatus.Full;
					}
					this.activeRequests--;
				}
			}).bind(this),
			this.requestInterval
		);
	}

	/**
	 * Fetches users' sessions from API and emits the events
	 */
	private static async fetchSessions(
		userId: number,
		all: boolean = false
	): Promise<IUserSessions | null> {
		let result: IUserSessions | null = null;
		let check: number | undefined;
		const id = this.ids[userId];

		const networkPromise = fetch(
			`${this.url}/api/sessions/get/${id}/${all ? "30" : "0/30"}`
		);

		const cachedResponse = await caches.match(
			`${id}/${all ? "all" : "30"}`
		);

		if (cachedResponse) {
			result = await cachedResponse.json();
			check = result?.sessions.length;
			await this.call("gotsessions", result, userId);
		}

		try {
			const networkResponse = await networkPromise;
			const cache = await caches.open("api-cache");
			cache.put(`${id}/${all ? "all" : "30"}`, networkResponse.clone());
			result = await networkResponse.json();
			if (result?.sessions.length != check) {
				await this.call("gotsessions", result, userId);
			}
		} catch {
			//Network error
		}

		return result;
	}

	/**
	 * Fetches users' names from API and emits the events
	 */
	private static async fetchNames(): Promise<IUserName[] | null> {
		let result: IUserName[] | null = null;
		let check: number | undefined;
		const networkPromise = fetch(this.url + "/api/users/name/all");
		const cachedResponse = await caches.match("names");

		if (cachedResponse) {
			result = (await cachedResponse.json()) as IUserName[];
			this.ids = result.map((x: { id: string }) => x.id);
			this.loadStatuses = result.map(() => LoadStatus.None);
			check = result.length;
			await this.call("gotnames", result);
		}

		try {
			const networkResponse = await networkPromise;
			const cache = await caches.open("api-cache");
			cache.put("names", networkResponse.clone());

			result = (await networkResponse.json()) as IUserName[];
			this.ids = result.map((x: { id: string }) => x.id);
			this.loadStatuses = result.map(() => LoadStatus.None);
			if (result.length != check) {
				await this.call("gotnames", result);
			}
		} catch {
			//Network error
		}

		return result;
	}

	/**
	 * Fetches users' days from API
	 */
	private static async fetchMap(): Promise<ISessionMap | null> {
		let result: ISessionMap | null = null;
		const networkPromise = fetch(this.url + "/api/sessions/map");
		const cachedResponse = await caches.match("map");

		if (cachedResponse) {
			result = (await cachedResponse.json()) as ISessionMap;
			await this.call("gotmap", result);
		}

		try {
			const networkResponse = await networkPromise;
			const cache = await caches.open("api-cache");
			cache.put("map", networkResponse.clone());
			result = await networkResponse.json();
			await this.call("gotmap", result);
		} catch {
			//Network error
		}

		return result;
	}

	/**
	 * Recursive background loading
	 * @param iteration Number of loading iteration
	 */
	private static async backgroundLoad(iteration: number): Promise<void> {
		//Starting with density map
		if (iteration == null) {
			this.activeRequests++;
			this.fetchMap().then(() => {
				this.activeRequests--;
			});

			setTimeout(() => {
				this.backgroundLoad(0);
			}, this.requestInterval);
		} else {
			//Iteration out of bounds
			if (iteration >= this.ids.length) {
				if (!this.loadStatuses.every(x => x != LoadStatus.None)) {
					setTimeout(() => {
						this.backgroundLoad(0);
					}, this.requestInterval);
				}

				return;
			}
			//Reached requests limit
			if (this.activeRequests >= this.maxRequests) {
				setTimeout(() => {
					this.backgroundLoad(iteration);
				}, this.requestInterval);
				return;
			}
			//Already loaded
			if (this.loadStatuses[iteration] != LoadStatus.None) {
				setTimeout(() => {
					this.backgroundLoad(iteration + 1);
				}, this.requestInterval);
				return;
			}

			//Fetch sessions
			this.activeRequests++;
			this.loadStatuses[iteration] = LoadStatus.Requested;
			this.fetchSessions(iteration).then(
				(sessions: IUserSessions | null) => {
					this.loadStatuses[iteration] = LoadStatus.Loaded;
					this.activeRequests--;
				}
			);

			setTimeout(() => {
				this.backgroundLoad(iteration + 1);
			}, this.requestInterval);
		}
	}

	/**
	 * Posts the worker's event message
	 * @param event Emitting event
	 * @param args Event arguments
	 */
	private static call(event: string, ...args: any[]): void {
		ctx.postMessage({
			event: event,
			args: args
		});
	}
}

enum LoadStatus {
	None,
	Requested,
	Loaded,
	Full
}

interface ISessionMap {
	[userId: string]: { [hour: string]: number };
}

interface IUserSessions {
	id: string;
	sessions: { platform: number; from: number; to: number }[];
}

interface IUserName {
	id: string;
	name: string;
}
