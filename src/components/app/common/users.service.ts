import EmptyFilter from "../data/filters/empty.class.js";
import DeviceFilter from "../data/filters/device.class.js";
import PeriodFilter from "../data/filters/period.class.js";
import User from "../data/user.class.js";
import Session from "../data/session.class.js";

export default class Users {
    public static data: User[] = [];

    private static _selectedId: number = 0;
    private static callbacks: { [type: string]: Function[]; } = {};

    public static get selectedId(): number { return this._selectedId; }
    public static get selected(): User { return this.data[this._selectedId] }

    public static initialize(data: IUsersData): void {
        //Iterate through all users in data
        for (const id in data) {
            const userData = data[id];
            //Create user object
            let user = new User(userData.name, +id);

            //Add sessions
            for (const session of userData.sessions) {
                if (session.from !== undefined) {
                    user.addSession(
                        new Session(session.from, session.to, session.platform)
                    );
                }
            }

            //Add filters
            let empty = new EmptyFilter("empty");
            let device = new DeviceFilter("device");
            let period = new PeriodFilter("period");

            //Setup filters
            const days = Object.keys(user.days);
            empty.toggle(false);
            period.from = +days[0];
            period.to = +days[days.length - 1];

            //Register filters
            user.addFilter(empty);
            user.addFilter(device);
            user.addFilter(period);

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

    public static addEventListener(type: "dataupdated" | "userchanged", callback: Function): void {
        if (!(type in this.callbacks)) this.callbacks[type] = [];
        this.callbacks[type].push(callback);
    }

    public static call(type: "dataupdated" | "userchanged", ...args: any[]) {
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