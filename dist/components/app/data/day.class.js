import DateUtils from "../../common/utils.class.js";
/**
 * Represents a day of sessions
 */
export default class Day {
    /**
     * Creates a day object for storing sessions
     * @param {Date} date The date of the day (will be normalized)
     */
    constructor(date, sessions = []) {
        this.date = DateUtils.normalizeDateUp(date);
        this.sessions = sessions;
    }
    /**
     * Adds a new session to the day
     * @param {Session} session New session
     */
    addSession(session) {
        if (session instanceof Array) {
            //Recursively adds an array
            for (const oneSession of session) {
                this.addSession(oneSession);
            }
        }
        else {
            this.sessions.push(session);
        }
    }
    /**
     * Gets the sesssion by the date
     * @param {Date} date The date to seach
     * @param {Boolean} approximately Search for the closest instead of covered
     */
    getSession(date, approximately = false) {
        let closestSession = null;
        let minTimeSpan = Infinity;
        for (const session of this.sessions) {
            if (session.isCovered(date, false)) {
                return session;
            }
            if (approximately) {
                const timeSpan = Math.min(Math.abs(+session.from - +date), Math.abs(+session.to - +date));
                if (timeSpan < minTimeSpan) {
                    minTimeSpan = timeSpan;
                    closestSession = session;
                }
            }
        }
        return closestSession;
    }
    /**
     * Returns a day with applied filter on sessions
     * @param {IFilter} filter Filter to apply
     */
    applySessionsFilter(filter) {
        //If filter is disable then filter nothing
        if (!filter.enabled)
            return new Day(new Date(+this.date), this.sessions.slice(0));
        //Create a new day on the same date
        let day = new Day(this.date);
        //Filter the sessions
        let sessions = this.sessions.filter(x => {
            return filter.passSession(x);
        });
        //Add filtered session to a new day
        day.addSession(sessions);
        return day;
    }
    /**
     * Returns null if the day did not pass the filter
     * @param {Filter} filter Filter to apply
     */
    applyFilter(filter) {
        let day = new Day(new Date(+this.date), this.sessions.slice(0));
        //If filter is disable then filter nothing
        if (!filter.enabled)
            return day;
        if (filter.passDay(day))
            return day;
        return null;
    }
}
//# sourceMappingURL=day.class.js.map