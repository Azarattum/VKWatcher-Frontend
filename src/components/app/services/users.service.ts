import User from "../models/user.class";
import Service from "../../common/service.abstract";
import { IUserSessions, IUserName } from "./fetcher.service";
import Session from "../models/session.class";
import EmptyFilter from "../models/filters/empty.class";
import DeviceFilter from "../models/filters/device.class";
import PeriodFilter from "../models/filters/period.class";
import DateUtils from "../../common/date.class";

/**
 * Service for managing users
 */
export default class Users extends Service<"dataupdated" | "userchanged">() {
	private static data: User[] = [];
	private static id: number = -1;

	public static get selectedId(): number {
		return this.id;
	}

	public static get selected(): User {
		return this.data[this.id];
	}

	public static get count(): number {
		return this.data.length;
	}

	/**
	 * Returns whether the user is selected
	 * @param id User full id
	 */
	public static isSelected(id: string): boolean {
		return this.selectedId == this.data.findIndex(x => x.id == id);
	}

	/**
	 * Sets users' names
	 * @param names Users' names
	 */
	public static setNames(names: IUserName[]): void {
		for (const name of names) {
			this.addUser(name.id);

			const user = this.data.find(x => x.id == name.id);
			if (user) {
				user.name = name.name;
			}
		}
	}

	/**
	 * Adds user's sessions
	 * @param sessions User's sessions object
	 */
	public static async addSessions(sessions: IUserSessions): Promise<void> {
		this.addUser(sessions.id);

		const user = this.data.find(x => x.id == sessions.id);
		if (user) {
			//Adjust the period filter on the first sessions
			const firstSessions = !user.firstDay;
			if (firstSessions && sessions.sessions.length > 0) {
				const period = user.getFilter("period") as PeriodFilter;
				if (
					!Number.isFinite(period.from) ||
					!Number.isFinite(period.to)
				) {
					period.to = DateUtils.getGlobalDay(
						sessions.sessions[sessions.sessions.length - 1].to *
							1000
					);
					period.from = Math.min(
						DateUtils.getGlobalDay(
							sessions.sessions[0].from * 1000
						),
						period.to
					);
					if (period.to - period.from > 28) {
						period.from = period.to - 28;
					}
				}
			}

			if (this.selected == user) {
				for (const session of sessions.sessions) {
					user.addSession(
						new Session(session.from, session.to, session.platform)
					);
				}
			} else {
				await this.processSessions(user, sessions.sessions);
			}

			this.call("dataupdated", user == this.selected);
		}
	}

	public static addUser(id: string): void {
		if (this.data.some(x => x.id == id)) return;

		const user = new User(id);
		this.data.push(user);

		//Add filters
		const empty = new EmptyFilter("empty");
		const device = new DeviceFilter("device");
		const period = new PeriodFilter("period");

		//Setup filters
		empty.toggle(false);

		//Register filters
		user.addFilter(empty);
		user.addFilter(device);
		user.addFilter(period);
	}

	public static select(id: number, relative: boolean = false): void {
		if (relative) id += this.id;

		if (this.data[id]) {
			this.id = id;
			this.call("userchanged", this.selected);
		}
	}

	public static updateFilter(id: number | string, params: any): void {
		const filter = this.selected.getFilter(id);
		if (!filter) return;

		for (const param of Object.entries(params)) {
			(filter as any)[param[0]] = param[1];
		}

		this.call("dataupdated", true, false);
	}

	/**
	 * Adds sessions to the user asyncronously
	 * @param user User to process
	 * @param sessions Sessions to add
	 */
	private static async processSessions(
		user: User,
		sessions: IUserSessions["sessions"]
	): Promise<void> {
		return new Promise(resolve => {
			let index = 0;

			function now(): number {
				return new Date().getTime();
			}

			function doChunk(): void {
				const startTime = now();
				do {
					if (index >= sessions.length) break;

					const session = sessions[index];
					user.addSession(
						new Session(session.from, session.to, session.platform)
					);
					index++;
				} while (now() - startTime <= 2);

				if (index < sessions.length) {
					setTimeout(doChunk, 1);
				} else {
					resolve();
				}
			}
			doChunk();
		});
	}
}

export interface IUsersData {
	[id: string]: IUserData;
}

interface IUserData {
	name: string;
	sessions: ISessionData[];
}

interface ISessionData {
	from: number;
	to: number;
	platform: number;
}
