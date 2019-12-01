import User from "../../models/user.class";
import IAnalyzer, { IResult } from "./analysers/analyzer.interface";

/**
 * Manager for analyzers
 */
export default class AnalyzersManager {
	private callback: (
		result: IResult,
		descrition: string,
		done: boolean
	) => void;
	private analyzers: IAnalyzer[];

	/**
	 * Creates manager for analyzers
	 * @param callback Callback for analysis results
	 */
	public constructor(
		callback: (result: IResult, descrition: string, done: boolean) => void
	) {
		this.callback = callback;
		this.analyzers = [];
	}

	/**
	 * Adds a new analyzer to manage
	 * @param analyzer New analyzer
	 */
	public addAnalyzer(analyzer: IAnalyzer): void {
		this.analyzers.push(analyzer);
	}

	/**
	 * Start analysis of the user using all provided analyzers
	 * @param user User to analyze
	 */
	public async analyze(user: User): Promise<void> {
		let analyzed = 0;

		for (const analyzer of this.analyzers) {
			analyzer.analyze(user).then((result: IResult) => {
				analyzed++;
				this.callback(
					result,
					analyzer.description,
					analyzed >= this.analyzers.length
				);
			});
		}
	}
}
