import User from "../../../models/user.class";

/**
 * General interface for all analyzers
 */
export default interface IAnalyzer {
	description: string;

	analyze(user: User): Promise<IResult>;
}

/**
 * General interface for data results of analyzers
 */
export interface IResult {
	[top: number]: string;
	min?: number;
	max?: number;
	avg?: number;

	format?: "time" | "period" | "user";
}
