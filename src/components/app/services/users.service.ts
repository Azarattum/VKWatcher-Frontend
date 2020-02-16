import User from "../models/user.class";
import Service from "../../common/service.abstract";
import { IUserSessions, IUserName } from "./fetcher.service";
import Session from "../models/session.class";
import EmptyFilter from "../models/filters/empty.class";
import DeviceFilter from "../models/filters/device.class";
import PeriodFilter from "../models/filters/period.class";

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
	public static addSessions(sessions: IUserSessions): void {
		this.addUser(sessions.id);

		const user = this.data.find(x => x.id == sessions.id);
		if (user) {
			const firstSessions = !user.firstDay;
			for (const session of sessions.sessions) {
				user.addSession(
					new Session(session.from, session.to, session.platform)
				);
			}

			if (firstSessions) {
				const period = new PeriodFilter("period");
				period.from = user.firstDay + 1;
				period.to = user.lastDay;
				user.addFilter(period);
			} else if (sessions.sessions.length == 0) {
				const filter = user.getFilter("period") as PeriodFilter;
				if (filter.from == user.firstDay + 1) {
					filter.from = user.firstDay;
				}
			}
		}

		this.call("dataupdated", user == this.selected);
	}

	public static addUser(id: string): void {
		if (this.data.some(x => x.id == id)) return;

		const user = new User(id);
		this.data.push(user);

		//Add filters
		const empty = new EmptyFilter("empty");
		const device = new DeviceFilter("device");

		//Setup filters
		empty.toggle(false);

		//Register filters
		user.addFilter(empty);
		user.addFilter(device);
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

		for (const param of Object.entries(params)) {
			(filter as any)[param[0]] = param[1];
		}

		this.call("dataupdated", true, false);
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
