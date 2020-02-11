import Service from "../../common/service.abstract";

/**
 * Service for fetching user data from remote API
 */
export default class Fetcher extends Service<
	"gotnames" | "gotdays" | "gotsessions" | "gotmap"
>() {
	private static readonly maxRequests = 3;
	private static readonly requestInterval = 100;
	private static activeRequests = 0;
	private static loadStatuses: LoadStatus[];
	private static url: string;
	private static ids: string[];

	/**
	 * Initializes the fetcher service
	 * @param url API Url
	 */
	public static async initialize(url: string): Promise<void> {
		this.url = url;

		//Initial data calls
		this.activeRequests++;
		this.fetchNames().then((names: IUserName[]) => {
			this.ids = names.map(x => x.id);
			this.loadStatuses = names.map(() => LoadStatus.None);

			this.call("gotnames", names);
			this.activeRequests--;

			setTimeout(this.backgroundLoad.bind(this), this.requestInterval);
		});
		this.activeRequests++;
		this.fetchDays().then((days: IUserDays[]) => {
			this.call("gotdays", days);
			this.activeRequests--;
		});
	}

	/**
	 * Triggers fetches on user selection
	 */
	public static async selectUser(userId: number): Promise<void> {
		this.activeRequests += 2;

		//Get last 30 days
		if (this.loadStatuses[userId] == LoadStatus.None) {
			this.loadStatuses[userId] = LoadStatus.Requested;
			const sessions = await this.fetchSessions(userId);
			this.call("gotsessions", sessions);
			this.loadStatuses[userId] = LoadStatus.Loaded;
		}

		//Get the rest
		if (this.loadStatuses[userId] != LoadStatus.Full) {
			const sessions = await this.fetchSessions(userId, true);
			this.call("gotsessions", sessions);
			this.loadStatuses[userId] = LoadStatus.Full;
		}

		this.activeRequests -= 2;
	}

	/**
	 * Fetches users' sessions from API
	 */
	private static async fetchSessions(
		userId: number,
		all: boolean = false
	): Promise<IUserSessions> {
		const id = this.ids[userId];

		const sessions = await fetch(
			`${this.url}/api/sessions/get/${id}/${all ? "30" : "0/30"}`
		);
		return (await sessions.json()) as IUserSessions;
	}

	/**
	 * Fetches users' names from API
	 */
	private static async fetchNames(): Promise<IUserName[]> {
		const names = await fetch(this.url + "/api/users/name/all");
		return (await names.json()) as IUserName[];
	}

	/**
	 * Fetches users' days from API
	 */
	private static async fetchDays(): Promise<IUserDays[]> {
		const days = await fetch(this.url + "/api/users/days/all");
		return (await days.json()) as IUserDays[];
	}

	/**
	 * Fetches users' days from API
	 */
	private static async fetchMap(): Promise<ISessionMap> {
		const map = await fetch(this.url + "/api/sessions/map");
		return (await map.json()) as ISessionMap;
	}

	private static async backgroundLoad(iteration: number): Promise<void> {
		//Starting with density map
		if (iteration == null) {
			this.activeRequests++;
			this.fetchMap().then((map: ISessionMap) => {
				this.call("gotmap", map);
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
			this.fetchSessions(iteration).then((sessions: IUserSessions) => {
				this.call("gotsessions", sessions);
				this.loadStatuses[iteration] = LoadStatus.Loaded;
				this.activeRequests--;
			});

			setTimeout(() => {
				this.backgroundLoad(iteration + 1);
			}, this.requestInterval);
		}
	}
}

enum LoadStatus {
	None,
	Requested,
	Loaded,
	Full
}

export interface ISessionMap {
	[userId: string]: { [day: string]: number };
}

export interface IUserSessions {
	id: string;
	sessions: { platform: number; from: number; to: number }[];
}

export interface IUserName {
	id: string;
	name: string;
}

export interface IUserDays {
	id: string;
	days: number | null;
}
