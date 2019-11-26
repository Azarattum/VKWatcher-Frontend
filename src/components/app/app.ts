/**Utils */
import Loader from "../common/loader.class";
import Manager, { IInitializable } from "../common/manager.class";
/**Services */
import Users, { IUsersData } from "./services/users.service";
import Overview from "./controllers/overview/overview.controller";
import Hash from "../common/hash.class";
import Interface from "./services/interface.service";
/**Views */
import OverviewView from "./views/overview/overview.view";
import FiltersView from "./views/filters/filters.view";
import ChartView from "./views/chart/chart.view";
import AnalysisView from "./views/analysis/analysis.view";

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
			new InitData(),
			new InitInterface(),
			new InitOverview(),
			new InitEnvets(),
			new InitHash()
		];

		const views = [
			new FiltersView(),
			new OverviewView(),
			new ChartView(),
			new AnalysisView()
		];

		this.manger = new Manager(components, views);
		await this.manger.initialize();
	}
}

class InitData implements IInitializable {
	public name: string = "Data";

	public async initialize(): Promise<void> {
		const loader = new Loader(["/assets/sessions.json"]);
		const data = await loader.load();

		Users.initialize(data[0] as IUsersData);
	}
}

class InitInterface implements IInitializable {
	public name: string = "Interface";

	public async initialize(): Promise<void> {
		Interface.initialize(Users.data.map(x => x.name));
	}
}

class InitOverview implements IInitializable {
	public name: string = "Overview";

	public async initialize(): Promise<void> {
		Overview.initialize();
	}
}

class InitHash implements IInitializable {
	public name: string = "Hash";

	public async initialize(): Promise<void> {
		const defaults = {
			user: 0,
			zoom: 1,
			period: "1-" + Object.values(Users.selected.days).length,
			device: -1,
			empty: true,
			tab: "overview"
		};
		Hash.initialize(defaults);
	}
}

class InitEnvets implements IInitializable {
	public name: string = "Events";

	public async initialize(): Promise<void> {
		//Register service events
		this.registerUsers();
		this.registerInterface();
		this.registerHash();
	}

	/**
	 * Register Users service events
	 */
	private registerUsers(): void {
		//Changed Event
		Users.addEventListener("userchanged", () => {
			const days = Object.keys(Users.selected.days).map(x => +x);
			const period = (Users.selected.getFilter("period") as unknown) as {
				from: number;
				to: number;
			};
			const device = (Users.selected.getFilter("device") as unknown) as {
				platform: number;
			};
			const empty = Users.selected.getFilter("empty") as {
				enabled: boolean;
			};

			Interface.refresh(
				days,
				period,
				device.platform || -1,
				!empty.enabled
			);
			Overview.updateUser(Users.selected);
		});

		//Updated Event
		Users.addEventListener("dataupdated", () => {
			Overview.updateUser();
		});
	}

	/**
	 * Register Interface service events
	 */
	private registerInterface(): void {
		//User Changed Event
		Interface.addEventListener(
			"userchanged",
			(id: number, relative?: boolean) => {
				Users.select(id, relative);
				Hash.set("user", Users.selectedId);
			}
		);

		//Period Changed Event
		Interface.addEventListener(
			"periodchanged",
			(from: number, to: number, offset: number, update: boolean) => {
				Hash.set("period", from + "-" + to);
				if (!update) return;
				Users.updateFilter("period", {
					from: from + offset - 1,
					to: to + offset - 1
				});
			}
		);

		//Zoomed Event
		Interface.addEventListener("zoomed", (factor: number) => {
			Hash.set("zoom", factor);
			(document.getElementsByClassName(
				"page"
			)[0] as HTMLElement).style.setProperty(
				"--vertical-zoom",
				factor.toString()
			);
			Overview.updateZoom(factor);
		});

		//Device Changed Event
		Interface.addEventListener(
			"devicechanged",
			(id: number, update: boolean) => {
				Hash.set("device", id);
				if (!update) return;
				Users.updateFilter("device", {
					platform: id
				});
			}
		);

		//Empty Toggled Event
		Interface.addEventListener(
			"emptychanged",
			(value: boolean, update: boolean) => {
				Hash.set("empty", value);
				if (!update) return;
				Users.updateFilter("empty", {
					enabled: !value
				});
			}
		);
	}

	/**
	 * Register Hash service events
	 */
	private registerHash(): void {
		//Loaded Event
		Hash.addEventListener(
			"loaded",
			(properties: { [name: string]: string }) => {
				const days = Object.keys(Users.selected.days).map(x => +x);
				const period = {
					from:
						+(properties["period"] || "1-1").split("-")[0] +
						days[0] -
						1,
					to:
						+(properties["period"] || "1-1").split("-")[1] +
						days[0] -
						1
				};
				const device = +(properties["device"] || -1);
				const empty = properties["empty"] == "true";
				const zoom = +(properties["zoom"] || 1);

				Users.select(+(properties["user"] || 0));
				Interface.refresh(days, period, device, empty, zoom);
			}
		);
	}
}
