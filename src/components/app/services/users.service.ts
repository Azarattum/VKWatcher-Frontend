import User from "../models/user.class";
import Service from "../../common/service.abstract";

/**
 * Service for managing users
 */
export default class Users extends Service<"dataupdated" | "userchanged">() {
	public static data: User[] = [];
	private static id: number = 0;

	public static get selectedId(): number {
		return this.id;
	}

	public static get selected(): User {
		return this.data[this.id];
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

		this.call("dataupdated");
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
