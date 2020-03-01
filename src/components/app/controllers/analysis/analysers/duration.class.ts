import IAnalyzer, { IResult, IToken } from "./analyzer.interface";
import User from "../../../models/user.class";

/**
 * Analyzer of general session durations
 */
export default class DurationAnalyzer implements IAnalyzer {
	public readonly description = "Session Duration";

	public async analyze(user: User, token: IToken): Promise<IResult | null> {
		const result: IResult = {};

		const sessions: number[] = [];
		user.getDays().forEach(day =>
			sessions.push(...day.sessions.map(session => session.length))
		);
		if (sessions.length <= 0) return [];
		if (token.isCanceled) return null;

		result.min = Math.min(...sessions);
		result.max = Math.max(...sessions);
		result.avg = sessions.reduce((a, b) => a + b) / sessions.length;

		result.format = "time";

		return result;
	}
}
