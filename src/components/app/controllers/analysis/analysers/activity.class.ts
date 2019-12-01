import IAnalyzer, { IResult } from "./analyzer.interface";
import User from "../../../models/user.class";
import EmptyFilter from "../../../models/filters/empty.class";

/**
 * Analyzer of session durations per day
 */
export default class ActivityAnalyzer implements IAnalyzer {
	public readonly description = "Time Per Day";

	public async analyze(user: User): Promise<IResult> {
		const result: IResult = {};

		const durations: number[] = [];
		user.addFilter(new EmptyFilter(0));
		user.getDays().forEach(day =>
			durations.push(day.sessions.reduce((a, b) => a + b.length, 0))
		);
		if (durations.length <= 0) return [];

		result.min = Math.min(...durations);
		result.max = Math.max(...durations);
		result.avg = durations.reduce((a, b) => a + b) / durations.length;

		result.format = "time";

		return result;
	}
}
