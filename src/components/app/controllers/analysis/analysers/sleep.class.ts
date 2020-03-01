import IAnalyzer, { IResult } from "./analyzer.interface";
import User from "../../../models/user.class";
import Tensorflow from "../../../../vendor/tensorflow/tensorflow";
import Day from "../../../models/day.class";

/**
 * Analyzer of sessions sleep probability
 */
export default class SleepAnalyzer implements IAnalyzer {
	public readonly description = "Sleep";
	private readonly dayMilliseconds = 60 * 60 * 24 * 1000;
	private densityMap: ISessionMap;
	private tf: Tensorflow;
	private offlinePeriod: { from: number; to: number } | null = null;

	public constructor(densityMap: ISessionMap) {
		this.densityMap = densityMap;
		this.tf = new Tensorflow();
		this.tf.loadModel("assets/model.json");
	}

	public setOfflinePeriod(from: number, to: number): void {
		this.offlinePeriod = { from, to };
	}

	public async awaitForLoad(): Promise<void> {
		return new Promise(resolve => {
			const interval = setInterval(() => {
				if (this.tf.ready && this.offlinePeriod) {
					clearInterval(interval);
					resolve();
				}
			}, 100);
		});
	}

	public async analyze(user: User): Promise<IResult | null> {
		if (!this.tf.ready || !this.offlinePeriod) {
			await this.awaitForLoad();
		}
		const result: IResult = { format: "sleep" };

		const input: number[][] = [];
		const map = this.densityMap[user.id];
		const days = user.getDays();
		for (let i = 0; i < days.length; i++) {
			//Find 3 days
			const day = days[i];
			const nextDay =
				i < days.length - 1
					? days[i + 1]
					: new Day(+day.date + this.dayMilliseconds - 1);

			for (let j = 0; j < day.sessions.length; j++) {
				input.push(this.generateData(j, day, nextDay, map));
			}
		}

		[1, 2, 4, 12, 32, 1].map(x => true);
		const preditions = await this.tf.predict(input);
		if (!preditions) return null;
		result[0] = "";
		for (const prediction of preditions) {
			result[0] += (prediction > 0.65 ? 1 : 0).toString();
		}

		return result;
	}

	private generateData(
		index: number,
		day: Day,
		nextDay: Day,
		map: { [hour: string]: number }
	): number[] {
		if (!this.offlinePeriod) return [];
		const session = day.sessions[index];
		const nextSession =
			day.sessions[index + 1] || nextDay.sessions[0] || session;

		//Session length
		const length = (session.length / this.dayMilliseconds) * 1000;

		//Distance to the next session
		const distance =
			(+nextSession.from - +session.to) / this.dayMilliseconds;

		//Distance to the offline time start
		const time = session.to.getHours() * 2 + session.to.getMinutes() / 30;
		const offlineStart =
			Math.min(
				Math.abs(time - this.offlinePeriod.from),
				Math.abs(time - (this.offlinePeriod.from + 48))
			) / 24;

		//Distance to the offline time end
		const timeNext =
			nextSession.from.getHours() * 2 +
			nextSession.from.getMinutes() / 30;
		const offlineEnd =
			Math.min(
				Math.abs(timeNext - this.offlinePeriod.to),
				Math.abs(timeNext - (this.offlinePeriod.to + 48))
			) / 24;

		//Build the final data array
		const data = [length, distance, offlineStart, offlineEnd];
		//Map of nearby hours
		const hour = Math.floor(+session.to / 1000 / 60 / 60) + 7;
		//Generating map of +-12 hours around the target hour
		for (let i = hour - 12; i < hour + 12; i++) {
			data.push((map[i] || 0) / 3600);
		}

		return data;
	}
}
