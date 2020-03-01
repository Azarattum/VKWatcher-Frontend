import IAnalyzer, { IResult, ISessionMap, IToken } from "./analyzer.interface";
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

	private proximity(item1: number, item2: number): number {
		return 1 - 1 / (1 + Math.exp(-Math.abs(item1 - item2)));
	}

	private pcos(user1: string, user2: string): number {
		const ratings1 = this.densityMap[user1];
		const ratings2 = this.densityMap[user2];

		let product = 0;
		let magnitude1 = 0;
		let magnitude2 = 0;
		let amount1 = 0;
		let amount2 = 0;
		let count1 = 0;
		let count2 = 0;
		for (const item in ratings1) {
			const rate1 = ratings1[item];
			const rate2 = ratings2[item];
			if (Number.isInteger(rate1)) {
				amount1 += rate1;
				count1++;
			}
			if (Number.isInteger(rate2)) {
				amount2 += rate2;
				count2++;
			}
			if (!Number.isInteger(rate1) || !Number.isInteger(rate2)) {
				continue;
			}

			product += rate1 * rate2;
			magnitude1 += rate1 * rate1;
			magnitude2 += rate2 * rate2;
		}

		return (
			(Math.abs(product) /
				(Math.sqrt(magnitude1) * Math.sqrt(magnitude2))) *
			this.proximity(amount1 / count1, amount2 / count2)
		);
	}

	public async analyze(user: User, token: IToken): Promise<IResult | null> {
		const scores: { [id: string]: number } = {};
		if (Object.keys(this.densityMap[user.id]).length <= 0) return [];
		if (token.isCanceled) return null;

		for (const id in this.densityMap) {
			//Ignore self and empty users
			if (user.id == id || Object.keys(this.densityMap[id]).length == 0) {
				scores[id] = this.isSimilar ? -Infinity : Infinity;
				continue;
			}

			//Count score difference
			scores[id] = this.pcos(user.id, id);
			if (token.isCanceled) return null;
		}

		const result: IResult = Object.entries(scores)
			.sort((a, b) =>
				a[1] < b[1]
					? this.isSimilar
						? 1
						: -1
					: this.isSimilar
					? -1
					: 1
			)
			.slice(0, 3)
			.map(x => x[0]);

		result.format = "user";

		return result;
	}
}
