import Service from "../../common/service.abstract";
import Worker from "worker-loader!./fetcher.worker";

/**
 * Service for fetching user data from remote API
 */
export default class Fetcher extends Service<
	"gotnames" | "gotdays" | "gotsessions" | "gotmap"
>() {
	private static worker: Worker | null = null;

	/**
	 * Initializes the fetcher service
	 * @param url API Url
	 */
	public static async initialize(url: string): Promise<void> {
		this.worker = new Worker();
		this.worker.addEventListener("message", (eventArgs: MessageEvent) => {
			if (eventArgs.data.event) {
				this.call(eventArgs.data.event, ...eventArgs.data.args);
			}
		});

		this.worker.postMessage({
			url: url
		});
	}

	/**
	 * Triggers user fetch in the worker
	 */
	public static selectUser(userId: number): Promise<void> {
		if (!this.worker) return Promise.resolve();
		this.worker.postMessage({
			userId: userId
		});

		return new Promise(resolve => {
			if (!this.worker) {
				resolve();
				return;
			}

			this.worker.addEventListener(
				"message",
				(eventArgs: MessageEvent) => {
					if (eventArgs.data.loaded) {
						resolve();
					}
				}
			);
		});
	}
}

export interface ISessionMap {
	[userId: string]: { [hour: string]: number };
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
