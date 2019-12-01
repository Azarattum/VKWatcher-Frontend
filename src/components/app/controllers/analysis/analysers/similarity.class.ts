import IAnalyzer, { IResult } from "./analyzer.interface";
import User from "../../../models/user.class";
import Session from "../../../models/session.class";

/**
 * Analyzer of similarity relative to other users
 */
export default class SimilarityAnalyzer implements IAnalyzer {
	public description: string;
	private isSimilar: boolean;
	private densityMap: IDensityMap;

	public constructor(densityMap: IDensityMap, isSimilar: boolean = true) {
		this.description = (isSimilar ? "Most" : "Least") + " Similar Users";

		this.isSimilar = isSimilar;
		this.densityMap = densityMap;
	}

	public static generateDensityMap(users: User[]): IDensityMap {
		const map: IDensityMap = {};
		for (const user of users) {
			map[user.id] = {};

			for (const dayId in user.days) {
				const periods: number[] = Array(...Array(24)).map(x => 0);
				const day = user.days[dayId];
				const sessions: Session[] = day.sessions;

				//Calculation all day periods
				for (const session of sessions) {
					let index = session.from.getHours();

					let left = session.length;
					let capacity =
						(60 - session.from.getMinutes()) * 60 -
						session.from.getSeconds();

					while (left > capacity) {
						periods[index] += capacity;
						left -= capacity;
						capacity = 60 * 60;
						index++;
					}

					periods[index] += left;
				}

				map[user.id][dayId] = periods;
			}
		}

		return map;
	}

	public async analyze(user: User): Promise<IResult> {
		const scores: { [id: number]: number } = {};
		const map = this.densityMap[user.id];
		if (Object.keys(map).length <= 0) return [];

		for (const id in this.densityMap) {
			const otherMap = this.densityMap[id];
			scores[id] = 0;
			if (user.id == +id || Object.keys(otherMap).length <= 0) {
				scores[id] = this.isSimilar ? Infinity : -Infinity;
				continue;
			}

			let scannedDays = 0;
			for (const dayId in map) {
				if (!otherMap[dayId]) continue;
				if (user.days[dayId].sessions.length <= 0) continue;
				scannedDays++;

				const day = map[dayId];
				const otherDay = otherMap[dayId];

				let daySum = 0;
				for (const i in day) {
					daySum += Math.pow(day[i] - otherDay[i], 2);
				}
				scores[id] = Math.sqrt(daySum);
			}
			scores[id] /= scannedDays;
		}

		const min = Object.values(scores)
			.sort((a, b) =>
				a > b ? (this.isSimilar ? 1 : -1) : this.isSimilar ? -1 : 1
			)
			.slice(0, 3);
		const result: IResult = min.map(x =>
			Object.keys(scores).find(y => scores[+y] == x)
		) as IResult;

		result.format = "user";

		return result;
	}
}

export interface IDensityMap {
	[id: number]: { [day: number]: number[] };
}
