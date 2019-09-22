import EmptyFilter from "../data/filters/empty.class.js";
import DeviceFilter from "../data/filters/device.class.js";
import PeriodFilter from "../data/filters/period.class.js";
import User from "../data/user.class.js";
import Session from "../data/session.class.js";
export default class Users {
    static get selectedId() { return this._selectedId; }
    static get selected() { return this.data[this._selectedId]; }
    static initialize(data) {
        //Iterate through all users in data
        for (const id in data) {
            const userData = data[id];
            //Create user object
            let user = new User(userData.name, +id);
            //Add sessions
            for (const session of userData.sessions) {
                if (session.from !== undefined) {
                    user.addSession(new Session(session.from, session.to, session.platform));
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
    static select(id, relative = false) {
        if (relative)
            id += this._selectedId;
        if (this.data[id] && this._selectedId != id) {
            this._selectedId = id;
            this.call("userchanged");
        }
    }
    static addEventListener(type, callback) {
        if (!(type in this.callbacks))
            this.callbacks[type] = [];
        this.callbacks[type].push(callback);
    }
    static call(type, ...args) {
        if (this.callbacks[type]) {
            this.callbacks[type].map(x => x.call(x, ...args));
        }
    }
}
Users.data = [];
Users._selectedId = 0;
Users.callbacks = {};
//# sourceMappingURL=users.service.js.map