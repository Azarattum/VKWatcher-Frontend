import Loader from "../common/loader.class";
import Users, { IUsersData } from "./services/users.service";
import Overview from "./controllers/overview/overview.controller";
import Hash from "../common/hash.class";
import Interface from "./services/interface.service";
import PeriodFilter from "./models/filters/period.class";
import Utils, { LogType } from "../common/utils.class";
import DeviceFilter from "./models/filters/device.class";
import EmptyFilter from "./models/filters/empty.class";

export default class App {
	public async initialize(): Promise<void> {
		Utils.log("Initializtion started...");
		let exceptions = 0;

		///TODO Make initialization in a loop by generalizing services
		//Init data
		try {
			await this.initializeData();
			Utils.log("Data initialized!", LogType.OK);
		} catch (exception) {
			Utils.log(
				`Data initialization exception:\n\t` +
					`${exception.stack.replace(/\n/g, "\n\t")}`,
				LogType.ERROR
			);
			exceptions++;
		}

		//Init interface
		try {
			await this.initializeInterface();
			Utils.log("Interface initialized!", LogType.OK);
		} catch (exception) {
			Utils.log(
				`Interface initialization exception:\n\t$` +
					`${exception.stack.replace(/\n/g, "\n\t")}`,
				LogType.ERROR
			);
			exceptions++;
		}

		//Init hash
		try {
			await this.initializeHash();
			Utils.log("Hash initialized!", LogType.OK);
		} catch (exception) {
			Utils.log(
				`Hash initialization exception:\n\t` +
					`${exception.stack.replace(/\n/g, "\n\t")}`,
				LogType.ERROR
			);
			exceptions++;
		}

		//Init overview
		try {
			await this.initializeOverview();
			Utils.log("Overview initialized!", LogType.OK);
		} catch (exception) {
			Utils.log(
				`Overview initialization exception:\n\t` +
					`${exception.stack.replace(/\n/g, "\n\t")}`,
				LogType.ERROR
			);
			exceptions++;
		}

		//Log result
		Utils.log("", LogType.DIVIDER);
		if (exceptions) {
			Utils.log(
				`Initialization completed with ${exceptions} exceptions!`,
				LogType.WARNING
			);
		} else {
			Utils.log("Successfyly initialized!", LogType.OK);
		}
	}

	private async initializeData(): Promise<void> {
		const loader = new Loader(["/assets/sessions.json"]);
		const data = await loader.load();

		Users.initialize(data[0] as IUsersData);
		Users.addEventListener("userchanged", () => {
			const days = Object.keys(Users.selected.days).map(x => +x);
			const period = Users.selected.getFilter("period") as PeriodFilter;
			const device = Users.selected.getFilter("device") as DeviceFilter;
			const empty = Users.selected.getFilter("empty") as EmptyFilter;

			Interface.refresh(
				days,
				period,
				device.platform || -1,
				!empty.enabled
			);
			Overview.updateUser(Users.selected);
		});
	}

	private async initializeHash(): Promise<void> {
		const defaults = {
			user: 0,
			zoom: 1,
			period: "1-" + Object.values(Users.selected.days).length,
			device: -1,
			empty: true,
			tab: "overview"
		};
		Hash.initialize(defaults);

		//Load hash values
		const days = Object.keys(Users.selected.days).map(x => +x);
		const period = {
			from: +(Hash.get("period") || "1-1").split("-")[0] + days[0] - 1,
			to: +(Hash.get("period") || "1-1").split("-")[1] + days[0] - 1
		};
		const device = +(Hash.get("device") || -1);
		const empty = Hash.get("empty") == "true";
		const zoom = +(Hash.get("zoom") || 1);

		Users.select(+(Hash.get("user") || 0));
		Interface.refresh(days, period, device, empty, zoom);
	}

	private async initializeInterface(): Promise<void> {
		Interface.initialize(Users.data.map(x => x.name));
		Interface.addEventListener(
			"userchanged",
			(id: number, relative?: boolean) => {
				Users.select(id, relative);
				Hash.set("user", Users.selectedId);
			}
		);
		Interface.addEventListener(
			"periodchanged",
			(from: number, to: number, offset: number) => {
				Hash.set("period", from + "-" + to);
				//Update filter
				const filter = Users.selected.getFilter(
					"period"
				) as PeriodFilter;
				filter.from = from + offset - 1;
				filter.to = to + offset - 1;
				Overview.updateUser();
			}
		);
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
		Interface.addEventListener("devicechanged", (id: number) => {
			Hash.set("device", id);
			//Update filter
			const filter = Users.selected.getFilter("device") as DeviceFilter;
			filter.platform = id;
			Overview.updateUser();
		});
		Interface.addEventListener("emptychanged", (value: boolean) => {
			Hash.set("empty", value);
			//Update filter
			const filter = Users.selected.getFilter("empty") as EmptyFilter;
			filter.toggle(!value);
			Overview.updateUser();
		});
	}

	private async initializeOverview(): Promise<void> {
		Overview.initialize();
	}
}
