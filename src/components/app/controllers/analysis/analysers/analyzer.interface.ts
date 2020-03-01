import User from "../../../models/user.class";

/**
 * General interface for all analyzers
 */
export default interface IAnalyzer {
	description: string;

	analyze(user: User, token?: IToken): Promise<IResult | null>;
}

/**
 * General interface for data results of analyzers
 */
export interface IResult {
	[top: number]: string;
	min?: number;
	max?: number;
	avg?: number;

	format?: "time" | "period" | "user" | "sleep" | "stats";
}

export interface ISessionMap {
	[userId: string]: { [hour: string]: number };
}

export interface IToken {
	isCanceled: boolean;
}
