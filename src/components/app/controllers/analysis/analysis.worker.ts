import AnalyzersManager from "./manager.class";
import { IResult } from "./analysers/analyzer.interface";
import DurationAnalyzer from "./analysers/duration.class";
import User from "../../models/user.class";
import ActivityAnalyzer from "./analysers/activity.class";
import PickupsAnalyzer from "./analysers/pickups.class";
import PlatformAnalyzer from "./analysers/platform.class";
import PeriodAnalyzer from "./analysers/period.class";

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
	const user = User.fromObject(eventArgs.data.user);
	manager.analyze(user);
}

function onAnalyzed(result: IResult, description: string, done: boolean): void {
	ctx.postMessage({
		result: result,
		description: description,
		done: done
	});
}
