import Filter from "./filter.abstract";
import IFilter from "./filter.interface";
import Session, { Platforms } from "../session.class";
import Day from "../day.class";

/**
 * Filters sessions by device
 */
export default class DeviceFilter extends Filter implements IFilter {
	public platform: Platforms | null;
	public type: string = "device";

	public constructor(id: number | string, platform: Platforms | null = null) {
		super(id);
		this.platform = platform;
	}

	public passDay(day: Day): boolean {
		//This filter does not filter any days.
		return true;
	}

	public passSession(
		session: Session,
		platform: Platforms | Platforms[] | string | null = null
	): boolean {
		platform = platform || this.platform;
		if (platform == null || platform == -1) return true;

		//Case when the device value is an array of other values
		if (Array.isArray(platform)) {
			return platform.some(x => {
				return this.passSession(session, x);
			});
		}
		//Case when the device value is the name
		else if (typeof platform == "string") {
			return Platforms[session.platform] == platform.toLowerCase();
		}
		//Case when the device value is platform id
		else if (Number.isFinite(platform)) {
			return session.platform == platform;
		}

		return false;
	}
}
