import User from "../../models/user.class";
import IAnalyzer, { IResult, IToken } from "./analysers/analyzer.interface";

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
	private tokens: IToken[] = [];

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
		const token = { isCanceled: false };
		this.tokens.forEach(x => (x.isCanceled = true));
		if (this.tokens.length > 10) {
			this.tokens = [];
		}
		this.tokens.push(token);

		let analyzed = 0;
		const length = this.analyzers.length;
		for (let i = 0; i < length; i++) {
			const analyzer = this.analyzers[i];
			setTimeout(async () => {
				const result = await analyzer.analyze(user, token);
				analyzed++;
				if (result != null && !token.isCanceled) {
					this.callback(
						result,
						analyzer.description,
						analyzed >= length || token.isCanceled
					);
				}
			}, 50);
		}
	}
}
