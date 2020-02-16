import AnalyzersManager from "./manager.class";
import { IResult } from "./analysers/analyzer.interface";
import DurationAnalyzer from "./analysers/duration.class";
import User from "../../models/user.class";
import ActivityAnalyzer from "./analysers/activity.class";
import PickupsAnalyzer from "./analysers/pickups.class";
import PlatformAnalyzer from "./analysers/platform.class";
import PeriodAnalyzer from "./analysers/period.class";
import SimilarityAnalyzer from "./analysers/similarity.class";
import Utils, { LogType } from "../../../common/utils.class";

const ctx: Worker = self as any;
const manager = new AnalyzersManager(onAnalyzed);

ctx.addEventListener("message", onMessage);

const durationAnalyzer = new DurationAnalyzer();
const activityAnalyzer = new ActivityAnalyzer();
const platformAnalyzer = new PlatformAnalyzer();
const pickupsAnalyzer = new PickupsAnalyzer();
const onlineAnalyzer = new PeriodAnalyzer(true);
const offlineAnalyzer = new PeriodAnalyzer(false);

manager.addAnalyzer(durationAnalyzer);
manager.addAnalyzer(activityAnalyzer);
manager.addAnalyzer(pickupsAnalyzer);
manager.addAnalyzer(platformAnalyzer);
manager.addAnalyzer(onlineAnalyzer);
manager.addAnalyzer(offlineAnalyzer);

function onMessage(eventArgs: MessageEvent): void {
	if (eventArgs.data.map) {
		//Add global analyzers
		const similarityAnalyzer = new SimilarityAnalyzer(
			eventArgs.data.map,
			true
		);
		const differenceAnalyzer = new SimilarityAnalyzer(
			eventArgs.data.map,
			false
		);

		manager.addAnalyzer(similarityAnalyzer);
		manager.addAnalyzer(differenceAnalyzer);
	} else if (eventArgs.data.user) {
		const user = User.fromObject(eventArgs.data.user);
		user.clearFilters();
		manager.analyze(user);
	} else {
		Utils.log(
			"The message to analysis worker not recognised!",
			LogType.WARNING
		);
	}
}

function onAnalyzed(result: IResult, description: string, done: boolean): void {
	ctx.postMessage({
		result: result,
		description: description,
		done: done
	});
}
