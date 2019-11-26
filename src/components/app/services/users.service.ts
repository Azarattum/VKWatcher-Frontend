import User from "../models/user.class";

/**
 * Service for managing users
 */
export default class Users {
	public static data: User[] = [];

	private static _selectedId: number = 0;
	private static callbacks: { [type: string]: Function[] } = {};

	public static get selectedId(): number {
		return this._selectedId;
	}

	public static get selected(): User {
		return this.data[this._selectedId];
	}

	public static initialize(data: IUsersData): void {
		//Iterate through all users in data
		for (const id in data) {
			const userData = data[id];
			(userData as any).id = id;

			const user = User.fromObject(userData);

			//Save user to an array
			this.data.push(user);
			this.call("dataupdated");
		}
	}

	public static select(id: number, relative: boolean = false): void {
		if (relative) id += this._selectedId;

		if (this.data[id]) {
			this._selectedId = id;
			this.call("userchanged");
		}
	}

	public static updateFilter(id: number | string, params: any): void {
		const filter = this.selected.getFilter(id);

		for (const param of Object.entries(params)) {
			(filter as any)[param[0]] = param[1];
		}

		this.call("dataupdated");
	}

	public static addEventListener(
		type: "dataupdated" | "userchanged",
		callback: Function
	): void {
		if (!(type in this.callbacks)) this.callbacks[type] = [];
		this.callbacks[type].push(callback);
	}

	public static call(
		type: "dataupdated" | "userchanged",
		...args: any[]
	): void {
		if (this.callbacks[type]) {
			this.callbacks[type].map(x => x.call(x, ...args));
		}
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
