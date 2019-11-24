import Filter from "./filter.abstract";
import IFilter from "./filter.interface";
import Day from "../day.class";
import Session from "../session.class";

/**
 * Filters empty days
 */
export default class EmptyFilter extends Filter implements IFilter {
	public type: string = "empty";

	public passDay(day: Day): boolean {
		//If there are any session at the day, it passes the filter
		if (day.sessions.length == 0) return false;
		else return true;
	}

	public passSession(session: Session): boolean {
		//This filter does not filter any sessions.
		return true;
	}
}
