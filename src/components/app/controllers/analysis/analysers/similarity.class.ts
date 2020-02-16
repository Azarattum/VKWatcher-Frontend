import IAnalyzer, { IResult } from "./analyzer.interface";
import User from "../../../models/user.class";

/**
 * Analyzer of similarity relative to other users
 */
export default class SimilarityAnalyzer implements IAnalyzer {
	public description: string;
	private isSimilar: boolean;
	private densityMap: ISessionMap;

	public constructor(densityMap: ISessionMap, isSimilar: boolean = true) {
		this.description = (isSimilar ? "Most" : "Least") + " Similar Users";

		this.isSimilar = isSimilar;
		this.densityMap = densityMap;
	}

	public async analyze(user: User): Promise<IResult> {
		const scores: { [id: string]: number } = {};
		const map = this.densityMap[user.id];
		if (Object.keys(map).length <= 0) return [];

		for (const id in this.densityMap) {
			const otherMap = this.densityMap[id];
			scores[id] = 0;
			//Ignore self and null users
			if (user.id == id || Object.keys(otherMap).length <= 0) {
				scores[id] = this.isSimilar ? Infinity : -Infinity;
				continue;
			}

			//Count score difference
			for (const i in map) {
				if (map[i] && otherMap[i]) {
					scores[id] += Math.pow(map[i] - otherMap[i], 2);
				}
			}
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

export interface ISessionMap {
	[userId: string]: { [hour: string]: number };
}
