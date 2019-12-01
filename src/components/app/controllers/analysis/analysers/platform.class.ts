import IAnalyzer, { IResult } from "./analyzer.interface";
import User from "../../../models/user.class";
import EmptyFilter from "../../../models/filters/empty.class";
import { Platforms } from "../../../models/session.class";

/**
 * Analyzer of the most used platforms
 */
export default class PlatformAnalyzer implements IAnalyzer {
	public readonly description = "Prefered Platforms";

	public async analyze(user: User): Promise<IResult> {
		const platforms: number[] = Array(
			...Array(Object.keys(Platforms).length)
		).map(x => 0);

		user.addFilter(new EmptyFilter(0));
		user.getDays().forEach(day =>
			day.sessions.forEach(session => {
				platforms[session.platform] += +session.length;
			})
		);

		const result = platforms
			.slice()
			.sort((a, b) => (a > b ? -1 : 1))
			.filter(x => x > 0)
			.map(x => Platforms[platforms.indexOf(x)])
			.slice(0, 3);

		return result as IResult;
	}
}
