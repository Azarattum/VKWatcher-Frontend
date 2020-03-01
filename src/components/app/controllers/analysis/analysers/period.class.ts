import IAnalyzer, { IResult, IToken } from "./analyzer.interface";
import User from "../../../models/user.class";
import Session from "../../../models/session.class";

/**
 * Analyzer of online/offline trend periods
 */
export default class PeriodAnalyzer implements IAnalyzer {
	public description: string;
	private isOnline: boolean;

	public constructor(isOnline: boolean = true) {
		this.description =
			"Prefered " + (isOnline ? "Online" : "Offline") + " Periods";

		this.isOnline = isOnline;
	}

	public async analyze(user: User, token: IToken): Promise<IResult | null> {
		const result: IResult = [];
		const periods: number[] = Array(...Array(24 * 2)).map(x => 0);

		const sessions: Session[] = [];
		user.getDays().forEach(day => sessions.push(...day.sessions));

		//Calculation all day periods
		for (const session of sessions) {
			let index =
				session.from.getHours() * 2 +
				(session.from.getMinutes() >= 30 ? 1 : 0);

			let left = session.length;
			let capacity =
				((index % 2 ? 60 : 30) - session.from.getMinutes()) * 60 -
				session.from.getSeconds();

			while (left > capacity) {
				periods[index] += capacity;
				left -= capacity;
				capacity = 60 * 30;
				index++;
			}

			periods[index] += left;
			if (token.isCanceled) return null;
		}

		//Search for needed periods
		let results = [];
		for (let j = 0; j < 3; j++) {
			const top = [];

			let critical = this.isOnline
				? Math.max(...periods)
				: Math.min(...periods);
			const pivot = periods.indexOf(critical);

			//Analyze forward
			for (let i = pivot; i < periods.length * 2; i++) {
				const difference = periods[i % periods.length] / critical;
				if (critical <= 0 || (difference > 0.7 && difference < 1.3)) {
					top.push(i % periods.length);
					if (critical <= 0) {
						critical = periods[i % periods.length];
					}
				} else {
					break;
				}
			}

			critical = this.isOnline
				? Math.max(...periods)
				: Math.min(...periods);
			//Analyze backwards
			for (let i = pivot - 1; i >= 0; i--) {
				const difference = periods[i % periods.length] / critical;
				if (critical == 0 || (difference > 0.7 && difference < 1.3)) {
					top.unshift(i % periods.length);
					if (critical <= 0) {
						critical = periods[i % periods.length];
					}
				} else {
					break;
				}
			}

			results.push(...top);

			for (const i of top) {
				periods[i] = Infinity * (this.isOnline ? -1 : 1);
			}
			if (token.isCanceled) return null;
		}

		results = results.filter((value, index, self) => {
			return self.indexOf(value) === index;
		});
		if (token.isCanceled) return null;
		if (!this.isOnline) {
			results.sort((a, b) => (a > b ? 1 : -1));
		}
		if (token.isCanceled) return null;
		//Split the results
		let j = 0;
		for (let i = 0; i < results.length; i++) {
			if (
				i > 0 &&
				Math.abs(results[i] - results[i - 1]) != 1 &&
				Math.abs(results[i] - results[i - 1]) != 47
			) {
				j++;
			}

			if (!result[j]) (result[j] as any) = [];

			(result[j] as any).push(results[i]);
		}

		if (token.isCanceled) return null;
		//Normalize
		for (const i in result) {
			result[i] = result[i][0] + " " + result[i][result[i].length - 1];
		}

		result.format = "period";

		return result;
	}
}
