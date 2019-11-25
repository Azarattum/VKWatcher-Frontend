import DateUtils from "../../common/date.class";
import IFilter from "./filters/filter.interface";
import Day from "./day.class";
import Session from "./session.class";
import EmptyFilter from "./filters/empty.class";
import DeviceFilter from "./filters/device.class";
import PeriodFilter from "./filters/period.class";

/**
 * Represents user with its data
 */
export default class User {
	/**Username (first + last names).*/
	public name: string;
	/**User id.*/
	public id: number;
	public days: { [day: number]: Day } = {};

	private filters: IFilter[] = [];

	/**
	 * Creates a user object
	 * @param {String} name User's display name
	 * @param {Number} id User's vk id
	 */
	public constructor(name: string, id: number) {
		//#region Fields
		this.id = id;
		this.name = name;
		//#endregion
	}

	/**
	 * Returns an array of days with filter applied (if specified)
	 * @param {Boolean} applyFilters Should filters be applied
	 */
	public getDays(applyFilters: boolean = true): Day[] {
		const days = [];
		const getDay = this.getDaysEnumenator(applyFilters);

		let day = null;
		while ((day = getDay()) != null) {
			days.push(day);
		}
		return days;
	}

	/**
	 * Returns an enumenator of days with filter applied (if specified)
	 * @param {Boolean} applyFilters Should filters be applied
	 */
	public getDaysEnumenator(applyFilters: boolean = true): () => Day | null {
		const days = Object.keys(this.days);
		const maxDay = +days[days.length - 1];
		let currentDay = +days[0];

		return (): Day | null => {
			if (currentDay > maxDay) {
				return null;
			} else {
				//Find the next day using filters
				let day = null;
				while (day == null) {
					day = this.days[currentDay];
					if (day === undefined) return day;

					currentDay++;
					if (applyFilters) {
						//Filter sessions
						for (const filter of this.filters) {
							day = day.applySessionsFilter(filter);
						}
						//Filter day
						for (const filter of this.filters) {
							if (day === null) break;
							day = day.applyFilter(filter);
						}
					}
				}

				//Return the next day
				return day;
			}
		};
	}

	/**
	 * Adds a new session to the day
	 * @param {Session} session New session
	 */
	public addSession(session: Session): void {
		//Recursively split the session
		if (session.isOverNight()) {
			for (const splittedSession of session.splitOverNights()) {
				this.addSession(splittedSession);
			}
			return;
		}

		//Get global day to use as a key
		const day = DateUtils.getGlobalDay(session.from);
		//Create a day if it does not exist
		if (this.days[day] === undefined) {
			//Fill up empty days in between
			const days = Object.keys(this.days);
			if (days.length > 0) {
				const minDay = +days[0];
				const maxDay = +days[days.length - 1];
				for (let i = day + 1; i < minDay; i++) {
					this.days[i] = new Day(DateUtils.getDateFromGlobalDay(i));
				}
				for (let i = day - 1; i > maxDay; i--) {
					this.days[i] = new Day(DateUtils.getDateFromGlobalDay(i));
				}
			}

			//Add the current day
			this.days[day] = new Day(session.from);
		}

		this.days[day].addSession(session);
	}

	/**
	 * Adds filter to user
	 * @param {Filter} filter
	 */
	public addFilter(filter: IFilter): void {
		this.filters.push(filter);
	}

	/**
	 * Finds a filter by its class or id
	 * @param {Key} key Filter's class or filter's id
	 */
	public getFilter(key: string | number): IFilter | undefined {
		return this.filters.find(filter => filter.id == key);
	}

	/**
	 * Clears all filters
	 */
	public clearFilters(): void {
		this.filters = [];
	}

	/**
	 * Converts to an object
	 */
	public toObject(): any {
		const object = Object.assign({}, this);

		//Convert days
		object.days = {};
		for (const i in this.days) {
			object.days[i] = this.days[i].toObject();
		}

		//Convert filters
		object.filters = [];
		for (const i in this.filters) {
			object.filters.push(this.filters[i].toObject());
		}

		return object;
	}

	/**
	 * Creates a user from object
	 * @param object User object
	 */
	public static fromObject(object: any): User {
		//Create user object
		const user = new User(object.name, +object.id);

		//Add sessions
		if (object.sessions) {
			//From sessions
			for (const session of object.sessions) {
				if (session.from !== undefined) {
					user.addSession(
						new Session(session.from, session.to, session.platform)
					);
				}
			}
		} else if (object.days) {
			//From days
			for (const day of Object.values(object.days) as Day[]) {
				if (!day.sessions) continue;
				for (const session of day.sessions) {
					if (session.from !== undefined) {
						user.addSession(
							new Session(
								session.from,
								session.to,
								session.platform
							)
						);
					}
				}
			}
		}

		if (!object.filters) {
			//Add filters
			const empty = new EmptyFilter("empty");
			const device = new DeviceFilter("device");
			const period = new PeriodFilter("period");

			//Setup filters
			const days = Object.keys(user.days);
			empty.toggle(false);
			period.from = +days[0];
			period.to = +days[days.length - 1];

			//Register filters
			user.addFilter(empty);
			user.addFilter(device);
			user.addFilter(period);
		} else {
			const filters = (object as User).filters;
			//Setup preexisting filters
			filters.forEach(filter => {
				filter = Object.assign({}, filter);
				switch (filter.type) {
					case "empty":
						(filter as any).__proto__ = EmptyFilter.prototype;
						break;
					case "device":
						(filter as any).__proto__ = DeviceFilter.prototype;
						break;
					case "period":
						(filter as any).__proto__ = PeriodFilter.prototype;
						break;
				}

				user.addFilter(filter);
			});
		}

		return user;
	}
}
