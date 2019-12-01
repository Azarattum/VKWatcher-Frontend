import IAnalyzer, { IResult } from "./analyzer.interface";
import User from "../../../models/user.class";
import EmptyFilter from "../../../models/filters/empty.class";

/**
 * Analyzer of the count of session per day
 */
export default class PickupsAnalyzer implements IAnalyzer {
	public readonly description = "Sessions Per Day";

	public async analyze(user: User): Promise<IResult> {
		const result: IResult = {};

		const pickups: number[] = [];
		user.addFilter(new EmptyFilter(0));
		user.getDays().forEach(day => pickups.push(day.sessions.length));
		if (pickups.length <= 0) return [];

		result.min = Math.min(...pickups);
		result.max = Math.max(...pickups);
		result.avg = pickups.reduce((a, b) => a + b) / pickups.length;

		return result;
	}
}
