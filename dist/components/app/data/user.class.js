import DateUtils from "../../common/date.class.js";
import Day from "./day.class.js";
/**
 * Represents user with its data
 */
export default class User {
    /**
     * Creates a user object
     * @param {String} name User's display name
     * @param {Number} id User's vk id
     */
    constructor(name, id) {
        this.days = {};
        this.filters = [];
        //#region Fields
        this.id = id;
        this.name = name;
        //#endregion
    }
    /**
     * Returns an array of days with filter applied (if specified)
     * @param {Boolean} applyFilters Should filters be applied
     */
    getDays(applyFilters = true) {
        const days = [];
        const getDay = this.getDaysEnumenator(applyFilters);
        let day = null;
        while ((day = getDay()) != null) {
            days.push(day);
        }
        return days;
    }
    /**
     * Returns an enumenator of days with filter applied (if specified)
     * @param {Boolean} applyFilters Should filters be applied
     */
    getDaysEnumenator(applyFilters = true) {
        const days = Object.keys(this.days);
        const maxDay = +days[days.length - 1];
        let currentDay = +days[0];
        return () => {
            if (currentDay > maxDay) {
                return null;
            }
            else {
                //Find the next day using filters
                let day = null;
                while (day == null) {
                    day = this.days[currentDay];
                    if (day === undefined)
                        return day;
                    currentDay++;
                    if (applyFilters) {
                        //Filter sessions
                        for (const filter of this.filters) {
                            day = day.applySessionsFilter(filter);
                        }
                        //Filter day
                        for (const filter of this.filters) {
                            if (day === null)
                                break;
                            day = day.applyFilter(filter);
                        }
                    }
                }
                //Return the next day
                return day;
            }
        };
    }
    /**
     * Adds a new session to the day
     * @param {Session} session New session
     */
    addSession(session) {
        //Recursively split the session
        if (session.isOverNight()) {
            for (const splittedSession of session.splitOverNights()) {
                this.addSession(splittedSession);
            }
            return;
        }
        //Get global day to use as a key
        const day = DateUtils.getGlobalDay(session.from);
        //Create a day if it does not exist
        if (this.days[day] === undefined) {
            //Fill up empty days in between
            const days = Object.keys(this.days);
            if (days.length > 0) {
                const minDay = +days[0];
                const maxDay = +days[days.length - 1];
                for (let i = day + 1; i < minDay; i++) {
                    this.days[i] = new Day(DateUtils.getDateFromGlobalDay(i));
                }
                for (let i = day - 1; i > maxDay; i--) {
                    this.days[i] = new Day(DateUtils.getDateFromGlobalDay(i));
                }
            }
            //Add the current day
            this.days[day] = new Day(session.from);
        }
        this.days[day].addSession(session);
    }
    /**
     * Adds filter to user
     * @param {Filter} filter
     */
    addFilter(filter) {
        this.filters.push(filter);
    }
    /**
     * Finds a filter by its class or id
     * @param {Key} key Filter's class or filter's id
     */
    getFilter(key) {
        return this.filters.find(filter => filter.id == key);
    }
    /**
     * Clears all filters
     */
    clearFilters() {
        this.filters = [];
    }
}
//# sourceMappingURL=user.class.js.map