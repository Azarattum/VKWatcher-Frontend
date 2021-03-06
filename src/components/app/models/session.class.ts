import DateUtils from "../../common/date.class";

/**
 * Class represents single user's session
 */
export default class Session {
	public from: Date;
	public to: Date;
	public platform: Platforms;
	public inSleep: boolean;

	/**
	 * Creates a new session object
	 * @param {Number} from Session start in unix time
	 * @param {Number} to Session end in unix time
	 * @param {Number} platform Session device id
	 */
	public constructor(
		from: Date | number,
		to: Date | number = from,
		platform: Platforms = Platforms.unknown
	) {
		//Perform the convertions for futher procession
		if (from instanceof Date) from = Math.round(+from / 1000);
		if (to instanceof Date) to = Math.round(+to / 1000);
		if (from >= to) to = from + 5;

		//#region Fields
		this.from = new Date(from * 1000);
		this.to = new Date(Math.max(from, to) * 1000);
		this.platform = platform;
		this.inSleep = false;
		//#endregion
	}

	/**
	 * Length of the session in seconds
	 */
	public get length(): number {
		return Math.round((+this.to - +this.from) / 1000);
	}

	/**
	 * Checks is the date covered by the session
	 * @param {Date} date Date to check coverage
	 * @param {Boolen} dailyPrecision Check only date, but not time
	 */
	public isCovered(
		date: Date | number,
		dailyPrecision: boolean = true
	): boolean {
		const from = dailyPrecision
			? +DateUtils.normalizeDateUp(this.from)
			: +this.from;
		const to = dailyPrecision
			? +DateUtils.normalizeDateDown(this.to)
			: +this.to;

		return +date >= from && +date <= to;
	}

	/**
	 * Checks whether the session covers 00:00
	 */
	public isOverNight(): boolean {
		return (
			this.from.getDate() !== this.to.getDate() ||
			this.from.getMonth() !== this.to.getMonth() ||
			this.from.getFullYear() !== this.to.getFullYear()
		);
	}

	/**
	 * Split the session into an array, so they do not cover 00:00
	 */
	public splitOverNights(): Session[] {
		const sessions = [];
		if (!this.isOverNight()) return [this];

		//Create the first day session
		let from = new Date(+this.from);
		let to = new Date(+this.from);
		to = DateUtils.normalizeDateDown(to);
		let session = new Session(from, to, this.platform);
		if (!session.isOverNight()) {
			sessions.push(session);
		}

		const fullDays = DateUtils.getDaysBetween(this.from, this.to) - 1;
		for (let i = 0; i < fullDays; i++) {
			//Add a day
			from.setDate(from.getDate() + 1);
			to.setDate(to.getDate() + 1);
			//Select a full day
			from = DateUtils.normalizeDateUp(from);
			to = DateUtils.normalizeDateDown(to);
			//Create a full day session
			session = new Session(from, to, this.platform);
			if (!session.isOverNight()) {
				sessions.push(session);
			}
		}

		//Create a last day session
		from = new Date(+this.to);
		to = new Date(+this.to);
		from = DateUtils.normalizeDateUp(from);
		if (+from != +to) {
			session = new Session(from, to, this.platform);
			if (!session.isOverNight()) {
				sessions.push(session);
			}
		}

		return sessions;
	}

	/**
	 * Converts to an object
	 */
	public toObject(): any {
		return Object.assign({}, this);
	}
}

/**
 * All known platform ids
 */
export enum Platforms {
	unknown,
	mobile,
	iphone,
	ipad,
	android,
	wphone,
	windows,
	web
}
