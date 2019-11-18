/**
 * Utilities to work with dates
 */
export default class DateUtils {
	/**
	 * Counts days between two dates.
	 * For expample it return 1 for Jan 4 & Jan 5, 0 for Jan 4 & Jan 4.
	 * @param {Date} date1 First date
	 * @param {Date} date2 Second date
	 */
	public static getDaysBetween(
		date1: Date | number,
		date2: Date | number
	): number {
		//Create new dates
		date1 = new Date(date1);
		date2 = new Date(date2);
		//Normalize values
		date1 = this.normalizeDateUp(date1);
		date2 = this.normalizeDateUp(date2);
		//Count difference
		const dateDifference = Math.abs(+date1 - +date2);
		//Count days
		const oneDay = 24 * 60 * 60 * 1000;
		return Math.round(dateDifference / oneDay);
	}

	/**
	 * Sests the time to 0:0:0 (start of the day)
	 * @param {Date} date Input date
	 */
	public static normalizeDateUp(date: Date | number): Date {
		date = new Date(+date);
		date.setHours(0);
		date.setMinutes(0);
		date.setSeconds(0);
		date.setMilliseconds(0);
		return date;
	}

	/**
	 * Sests the time to 23:59:59 (end of the day)
	 * @param {Date} date Input date
	 */
	public static normalizeDateDown(date: Date | number): Date {
		date = new Date(+date);
		date.setHours(23);
		date.setMinutes(59);
		date.setSeconds(59);
		date.setMilliseconds(499);
		return date;
	}

	/**
	 * Returns the day from the begging of time (Jan 01 1970)
	 * @param {Date} date Input date
	 */
	public static getGlobalDay(date: Date | number): number {
		return this.getDaysBetween(new Date(0), +date);
	}

	/**
	 * Converts global day back to date object.
	 * The time will be 00:00:00
	 * @param {Number} day Global day
	 */
	public static getDateFromGlobalDay(day: number): Date {
		const oneDay = 24 * 60 * 60 * 1000;
		return this.normalizeDateUp(new Date(oneDay * day));
	}

	/**
	 * Combines the date from one date and the time from another
	 * @param {Date} dateDate A date for the date
	 * @param {Date} dateTime A date for the time
	 */
	public static combineDate(dateDate: Date, dateTime: Date): Date {
		const date = new Date(+dateDate);
		date.setHours(dateTime.getHours());
		date.setMinutes(dateTime.getMinutes());
		date.setSeconds(dateTime.getSeconds());
		date.setMilliseconds(dateTime.getMilliseconds());
		return date;
	}

	/**
	 * Formats duration to human readable text
	 * @param {Number} duration Duration in seconds
	 */
	public static getReadableDuration(duration: number): string {
		const hours = Math.floor(duration / 60 / 60);
		const minutes = Math.floor((duration - 60 * 60 * hours) / 60);
		const seconds = Math.floor(duration - 60 * 60 * hours - 60 * minutes);

		const format =
			(hours > 0 ? hours + " h, " : "") +
			(minutes > 0 ? minutes + " min, " : "") +
			seconds +
			" sec";

		return format;
	}
}
