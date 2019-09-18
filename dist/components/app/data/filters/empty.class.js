import Filter from "./filter.abstract.js";
/**
 * Filters empty days
 */
export default class EmptyFilter extends Filter {
    passDay(day) {
        //If there are any session at the day, it passes the filter
        if (day.sessions.length == 0)
            return false;
        else
            return true;
    }
    passSession(session) {
        //This filter does not filter any sessions.
        return true;
    }
}
//# sourceMappingURL=empty.class.js.map