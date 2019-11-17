import Filter from "./filter.abstract.js";
import DateUtils from "../../../common/utils.class.js";
/**
 * Filters days by period
 */
export default class PeriodFilter extends Filter {
    constructor(id, from = -Infinity, to = Infinity) {
        super(id);
        this.from = from;
        this.to = Math.max(to, from);
    }
    passDay(day) {
        //Filter the day by period
        let globalDay = DateUtils.getGlobalDay(day.date);
        return globalDay >= this.from && globalDay <= this.to;
    }
    passSession(session) {
        //This filter does not filter any sessions.
        return true;
    }
}
//# sourceMappingURL=period.class.js.map