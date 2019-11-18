import Filter from "./filter.abstract.js";
import IFilter from "./filter.interface.js";
import DateUtils from "../../../common/date.class.js";
import Day from "../day.class.js";
import Session from "../session.class.js";

/**
 * Filters days by period
 */
export default class PeriodFilter extends Filter implements IFilter {
    public from: number;
    public to: number;

    constructor(id: string | number, from: number = -Infinity, to: number = Infinity) {
        super(id);
        this.from = from;
        this.to = Math.max(to, from);
    }

    passDay(day: Day): boolean {
        //Filter the day by period
        let globalDay = DateUtils.getGlobalDay(day.date);
        return globalDay >= this.from && globalDay <= this.to;
    }

    passSession(session: Session): boolean {
        //This filter does not filter any sessions.
        return true;
    }
}