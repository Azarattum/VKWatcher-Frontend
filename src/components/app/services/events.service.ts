import Service from "../../common/service.abstract";
import Hash from "../../common/hash.service";
import Users from "./users.service";
import Interface from "./interface.service";
import Overview from "../controllers/overview/overview.controller";

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

		this.call("registered");
	}

	/**
	 * Register Users service events
	 */
	private static registerUsers(): void {
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
				Hash.freeze(false);
			}
		);
	}
}
