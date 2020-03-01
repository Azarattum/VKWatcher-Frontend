import IAnalyzer, { IResult, IToken } from "./analyzer.interface";
import User from "../../../models/user.class";

/**
 * Analyzer of sessions sleep probability
 */
export default class SleepStatsAnalyzer implements IAnalyzer {
	public readonly description = "Sleep Analysis";
	private sleepSessions: string | null = null;

	public setSleepSessions(sleepSessions: string | null): void {
		this.sleepSessions = sleepSessions;
	}

	public async awaitForLoad(): Promise<void> {
		return new Promise(resolve => {
			const interval = setInterval(() => {
				if (this.sleepSessions) {
					clearInterval(interval);
					resolve();
				}
			}, 100);
		});
	}

	public async analyze(user: User, token: IToken): Promise<IResult | null> {
		if (!this.sleepSessions) {
			await this.awaitForLoad();
		}
		if (!this.sleepSessions) return null;
		const result: IResult = {};

		const toBedTimes: number[] = [];
		const wakeUpTimes: number[] = [];
		const sleepLengths: number[] = [];

		const days = user.getDays();

		let from = 0;
		let i = 0;
		for (const day of days) {
			for (const session of day.sessions) {
				if (this.sleepSessions[i] == "1") {
					toBedTimes.push(
						session.to.getHours() * 60 + session.to.getMinutes()
					);

					from = +session.to;
				}
				if (this.sleepSessions[i - 1] == "1") {
					wakeUpTimes.push(
						session.from.getHours() * 60 + session.from.getMinutes()
					);
					if (
						toBedTimes[toBedTimes.length - 1] >
						wakeUpTimes[wakeUpTimes.length - 1]
					) {
						toBedTimes[toBedTimes.length - 1] -= 24 * 60;
					}

					const length = +session.from - from;
					sleepLengths.push(length / 1000);
				}
				i++;

				if (token.isCanceled) return null;
			}
		}

		if (!sleepLengths.length || !toBedTimes.length || !wakeUpTimes.length) {
			return null;
		}

		const length =
			sleepLengths.reduce((a, b) => a + b) / sleepLengths.length;
		let toBed = toBedTimes.reduce((a, b) => a + b) / sleepLengths.length;
		let wakeUp = wakeUpTimes.reduce((a, b) => a + b) / sleepLengths.length;

		if (token.isCanceled) return null;

		if (toBed < 0) toBed += 24 * 60;
		if (wakeUp < 0) wakeUp += 24 * 60;

		result[0] = length.toString();
		result[1] = toBed.toString();
		result[2] = wakeUp.toString();

		result.format = "stats";

		this.sleepSessions = null;
		return result;
	}
}
