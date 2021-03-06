import DateUtils from "../../common/date.class";
import Session from "./session.class";
import IFilter from "./filters/filter.interface";

/**
 * Represents a day of sessions
 */
export default class Day {
	public date: Date;
	public sessions: Session[];

	/**
	 * Creates a day object for storing sessions
	 * @param {Date} date The date of the day (will be normalized)
	 */
	public constructor(date: Date | number, sessions: Session[] = []) {
		this.date = DateUtils.normalizeDateUp(date);
		this.sessions = sessions;
	}

	/**
	 * Adds a new session to the day
	 * @param {Session} session New session
	 */
	public async addSession(
		session: Session | Session[],
		check = true
	): Promise<void> {
		if (session instanceof Array) {
			//Recursively adds an array
			for (const oneSession of session) {
				this.addSession(oneSession, check);
			}
		} else {
			//Push only unique sessions in the right order
			let added = false;
			if (check) {
				for (let i = 0; i < this.sessions.length; i++) {
					const from = +this.sessions[i].from;
					if (+session.from < from) {
						this.sessions.splice(i, 0, session);
					}
					if (+session.from <= from) {
						added = true;
						break;
					}
				}
			}
			if (!check || !added) {
				this.sessions.push(session);
			}
		}
	}

	/**
	 * Gets the sesssion by the date
	 * @param {Date} date The date to seach
	 * @param {Boolean} approximately Search for the closest instead of covered
	 */
	public getSession(
		date: Date,
		approximately: boolean = false
	): Session | null {
		let closestSession = null;
		let minTimeSpan = Infinity;

		for (const session of this.sessions) {
			if (session.isCovered(date, false)) {
				return session;
			}

			if (approximately) {
				const timeSpan = Math.min(
					Math.abs(+session.from - +date),
					Math.abs(+session.to - +date)
				);
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
	public applySessionsFilter(filter: IFilter): Day {
		//If filter is disable then filter nothing
		if (!filter.enabled)
			return new Day(new Date(+this.date), this.sessions.slice(0));
		//Create a new day on the same date
		const day = new Day(this.date);
		//Filter the sessions
		const sessions = this.sessions.filter(x => {
			return filter.passSession(x);
		});
		//Add filtered session to a new day
		day.addSession(sessions, false);
		return day;
	}

	/**
	 * Returns null if the day did not pass the filter
	 * @param {Filter} filter Filter to apply
	 */
	public applyFilter(filter: IFilter): Day | null {
		const day = new Day(new Date(+this.date), this.sessions.slice(0));
		//If filter is disable then filter nothing
		if (!filter.enabled) return day;

		if (filter.passDay(day)) return day;
		return null;
	}

	/**
	 * Converts to an object
	 */
	public toObject(): any {
		const object = Object.assign({}, this);

		//Convert sessions
		object.sessions = [];
		for (const i in this.sessions) {
			object.sessions.push(this.sessions[i].toObject());
		}

		return object;
	}
}
