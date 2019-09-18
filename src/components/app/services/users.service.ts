import EmptyFilter from "../data/filters/empty.class.js";
import DeviceFilter from "../data/filters/device.class.js";
import PeriodFilter from "../data/filters/period.class.js";
import User from "../data/user.class.js";
import Session from "../data/session.class.js";

export default class Users {
    public static data: User[] = [];

    private static _current: number = 0;
    private static callbacks: { [type: string]: Function[]; } = {};

    public static get current(): number { return this._current; }
    public static set current(value: number) {
        this._current = value;
        if (this.callbacks["userchanged"]) {
            this.callbacks["userchanged"].map(x => x());
        }
    }

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
            if (this.callbacks["dataupdate"]) {
                this.callbacks["dataupdate"].map(x => x());
            }
        }
    }

    public static addEventListener(type: "dataupdate" | "userchanged", callback: () => {}): void {
        if (!(type in this.callbacks)) this.callbacks[type] = [];
        this.callbacks[type].push(callback);
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