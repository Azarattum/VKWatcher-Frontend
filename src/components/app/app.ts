/**Utils */
import Loader from "../common/loader.class";
import Manager from "../common/manager.class";
import DateUtils from "../common/date.class";
/**Services */
import Users, { IUsersData } from "./services/users.service";
import Hash from "../common/hash.service";
import Interface from "./services/interface.service";
import Events from "./services/events.service";
import Overview from "./controllers/overview/overview.controller";
import Chart from "./controllers/chart/chart.controller";
import Analysis from "./controllers/analysis/analysis.controller";
import Tabs from "../common/tabs.service";
/**Views */
import OverviewView from "./views/overview/overview.view";
import FiltersView from "./views/filters/filters.view";
import ChartView from "./views/chart/chart.view";
import AnalysisView from "./views/analysis/analysis.view";
import IconsView from "./views/icons/icons.view";
import Fetcher from "./services/fetcher.service";

/**
 * Main application class
 */
export default class App {
	private manger: Manager | null = null;

	/**
	 * Initializes the app.
	 * Note that the page should be already loaded
	 */
	public async initialize(): Promise<void> {
		const components = [
			Fetcher,
			Users,
			Interface,
			Overview,
			Chart,
			Analysis,
			Events,
			Tabs,
			Hash
		];

		const views = [
			new IconsView(),
			new FiltersView(),
			new OverviewView(),
			new ChartView(),
			new AnalysisView()
		];

		this.manger = new Manager(components, views);

		const args = await this.initializeArguments();

		await this.manger.initialize(args);
	}

	/**
	 * Initializes arguments for the manager
	 */
	private async initializeArguments(): Promise<{
		[component: string]: any[];
	}> {
		if (!this.manger) {
			throw new Error("Initialize manager first!");
		}

		const loader = new Loader(["/assets/sessions.json"]);
		const data = (await loader.load())[0] as IUsersData;
		const days = DateUtils.getDaysBetween(
			Math.min.apply(
				null,
				Object.values(data)
					[+(Hash.get("user") || 0)].sessions.map(x => x.from)
					.filter(x => Number.isFinite(x))
			) * 1000,
			Math.max.apply(
				null,
				Object.values(data)
					[+(Hash.get("user") || 0)].sessions.map(x => x.to)
					.filter(x => Number.isFinite(x))
			) * 1000
		);

		return {
			Fetcher: [""],
			Users: [data],
			Analysis: [data],
			Interface: [Object.values(data).map(x => x.name)],
			Tabs: [
				[
					this.manger.getView("Overview"),
					this.manger.getView("Chart"),
					this.manger.getView("Analysis")
				]
			],
			Hash: [
				{
					user: 0,
					zoom: 1,
					period: "1-" + (days + 1),
					device: -1,
					empty: true,
					tab: "overview"
				}
			]
		};
	}
}
