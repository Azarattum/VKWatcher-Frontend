import Service from "../../common/service.abstract";
import Hash from "../../common/hash.service";
import Users from "./users.service";
import Interface from "./interface.service";
import Overview from "../controllers/overview/overview.controller";
import Tabs from "../../common/tabs.service";
import Chart from "../controllers/chart/chart.controller";
import Analysis from "../controllers/analysis/analysis.controller";
import User from "../models/user.class";

/**
 * One service to rule them all!
 * Registers and manages event-driven communication
 * among all services
 */
export default class Envets extends Service<"registered">() {
	public static async initialize(): Promise<void> {
		//Register service events
		this.registerUsers();
		this.registerInterface();
		this.registerHash();
		this.registerTabs();

		this.call("registered");
	}

	/**
	 * Register Users service events
	 */
	private static registerUsers(): void {
		//Changed Event
		Users.addEventListener("userchanged", (user: User) => {
			//Get user's data
			const days = Object.keys(user.days).map(x => +x);
			const period = (user.getFilter("period") as unknown) as {
				from: number;
				to: number;
			};
			const device = (user.getFilter("device") as unknown) as {
				platform: number;
			};
			const empty = user.getFilter("empty") as {
				enabled: boolean;
			};
			const name = document.querySelector(".user-info>.name");
			const id = document.querySelector(".user-info>.id");

			//Update DOM
			if (name) name.textContent = user.name;
			if (id) id.textContent = user.id.toString();

			//Update services
			Interface.refresh(
				days,
				period,
				device.platform || -1,
				!empty.enabled
			);

			Overview.updateUser(user);
			Chart.updateUser(user);
			Analysis.updateUser(user);
		});

		//Updated Event
		Users.addEventListener("dataupdated", () => {
			Overview.updateUser();
		});
	}

	/**
	 * Register Interface service events
	 */
	private static registerInterface(): void {
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
	private static registerHash(): void {
		//Loaded Event
		Hash.addEventListener(
			"loaded",
			(properties: { [name: string]: string }) => {
				Hash.freeze();
				Users.select(+(properties["user"] || 0));

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

				Interface.refresh(days, period, device, empty, zoom);
				Tabs.change(properties["tab"]);
				Hash.freeze(false);
			}
		);
	}

	/**
	 * Register Tabs service events
	 */
	private static registerTabs(): void {
		Tabs.addEventListener("tabchanged", (name: string) => {
			//Setup icon
			const icons = document.getElementsByClassName("icon");
			for (const icon of icons) {
				icon.classList.remove("filled");
			}
			const icon = document.querySelector(".icon." + name.toLowerCase());
			if (icon) icon.classList.add("filled");

			//Save to hash
			Hash.set("tab", name.toLowerCase());
		});
	}
}
