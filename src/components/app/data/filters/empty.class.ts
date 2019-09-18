import Filter from "./filter.abstract.js";
import IFilter from "./filter.interface.js";
import Day from "../day.class.js";
import Session from "../session.class.js";

/**
 * Filters empty days
 */
export default class EmptyFilter extends Filter implements IFilter {
    passDay(day: Day): boolean {
        //If there are any session at the day, it passes the filter
        if (day.sessions.length == 0) return false;
        else return true;
    }

    passSession(session: Session): boolean {
        //This filter does not filter any sessions.
        return true;
    }
}