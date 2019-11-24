import Filter from "./filter.abstract";
import IFilter from "./filter.interface";
import DateUtils from "../../../common/date.class";
import Day from "../day.class";
import Session from "../session.class";

/**
 * Filters days by period
 */
export default class PeriodFilter extends Filter implements IFilter {
	public type: string = "period";
	public from: number;
	public to: number;

	public constructor(
		id: string | number,
		from: number = -Infinity,
		to: number = Infinity
	) {
		super(id);
		this.from = from;
		this.to = Math.max(to, from);
	}

	public passDay(day: Day): boolean {
		//Filter the day by period
		const globalDay = DateUtils.getGlobalDay(day.date);
		return globalDay >= this.from && globalDay <= this.to;
	}

	public passSession(session: Session): boolean {
		//This filter does not filter any sessions.
		return true;
	}
}
