import IAnalyzer, { IResult } from "./analyzer.interface";
import User from "../../../models/user.class";
import Tensorflow from "../../../../vendor/tensorflow/tensorflow";

/**
 * Analyzer of sessions sleep probability
 */
export default class SleepAnalyzer implements IAnalyzer {
	public readonly description = "Sleep";
	private tf: Tensorflow;

	public constructor() {
		this.tf = new Tensorflow();
		this.tf.loadModel("assets/model.json");
	}

	public async analyze(user: User): Promise<IResult | null> {
		if (!this.tf.ready) return null;
		const result: IResult = {};
		// await this.tf.predict();

		return result;
	}
}
