import Day from "../day.class";
import Session from "../session.class";

/**
 * Interface for sessions and days filters
 */
export default interface IFilter {
    /**Filter id for searching in the array */
    id: string | number;
    /**Is filter using or disabled */
    enabled: boolean;

    /**
     * Checks whether or not a day satisfies the filter
     * @param {Day} day Day for checking
     */
    passDay(day: Day): boolean;

    /**
     * Checks whether or not a session satisfies the filter
     * @param {Session} session Session for checking
     */
    passSession(session: Session): boolean;

    /**
     * Toggle the state of the filter.
     * @param {Boolean} value Enable or disable the filter.
     */
    toggle(value?: boolean): void;
}