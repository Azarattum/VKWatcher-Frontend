import Service from "../../common/service.abstract";
import Hash from "../../common/hash.service";
import Users from "./users.service";
import Interface from "./interface.service";
import Overview from "../controllers/overview/overview.controller";
import Tabs from "../../common/tabs.service";
import Chart from "../controllers/chart/chart.controller";
import Analysis from "../controllers/analysis/analysis.controller";
import User from "../models/user.class";
import Fetcher, {
	IUserName,
	IUserSessions,
	ISessionMap
} from "./fetcher.service";

/**
 * One service to rule them all!
 * Registers and manages event-driven communication
 * among all services
 */
export default class Envets extends Service<"registered">() {
	public static async initialize(): Promise<void> {
		//Register service events
		this.registerFetcher();
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
		let userChanging = false;
		//Changed Event
		Users.addEventListener("userchanged", async (user: User) => {
			//Get user's data
			userChanging = true;
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

			//Update data
			Overview.updateUser(user);

			//Update interface
			setTimeout(() => {
				Chart.updateUser(user);
				Analysis.updateUser(user);
				Interface.setEmpty(!empty.enabled);
				Interface.setPlatform(device.platform || -1);
				Interface.setRange({ from: user.firstDay, to: user.lastDay });
				if (period) {
					Interface.setPeriod(period);
				}
				userChanging = false;
			}, 100);
		});

		//Updated Event
		Users.addEventListener(
			"dataupdated",
			(isSelected: boolean, full: boolean = true) => {
				if (isSelected && !userChanging) {
					Overview.updateUser();
					if (full) {
						Chart.updateUser(Users.selected);
						Analysis.updateUser(Users.selected);
					}
				}
			}
		);
	}

	/**
	 * Register Interface service events
	 */
	private static registerInterface(): void {
		//User Changed Event
		Interface.addEventListener(
			"userchanged",
			async (id: number, relative?: boolean) => {
				const userId = relative ? id + Users.selectedId : id;
				if (userId >= 0 && userId < Users.count) {
					Analysis.clear();
					Hash.set("user", userId);
					await Fetcher.selectUser(userId);
					Users.select(userId);
				}
			}
		);

		//Period Changed Event
		Interface.addEventListener(
			"periodchanged",
			(from: number, to: number) => {
				Hash.set("period", from + "-" + to);
				Users.updateFilter("period", {
					from: from,
					to: to
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
		Interface.addEventListener("devicechanged", (id: number) => {
			Hash.set("device", id);
			Users.updateFilter("device", {
				platform: id
			});
		});

		//Empty Toggled Event
		Interface.addEventListener("emptychanged", (value: boolean) => {
			Hash.set("empty", value);
			Users.updateFilter("empty", {
				enabled: !value
			});
		});
	}

	/**
	 * Register Hash service events
	 */
	private static registerHash(): void {
		//Loaded Event
		Hash.addEventListener(
			"loaded",
			(properties: { [name: string]: string }) => {
				Tabs.change(properties["tab"]);
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

	/**
	 * Register Fetcher service events
	 */
	private static registerFetcher(): void {
		let initialCall = true;
		Fetcher.addEventListener("gotnames", async (names: IUserName[]) => {
			//Init all
			const userId = +(Hash.get("user") || 0);
			const zoom = +(Hash.get("zoom") || 1);
			const device = +(Hash.get("device") || -1);
			const empty = Hash.get("empty") == "true";
			const period = Hash.get("period")?.split("-");

			Users.setNames(names);
			Analysis.setNames(names);

			//No need for auto select, if user is alredy selected
			if (!initialCall) {
				Interface.setNames(names.map(x => x.name));
				return;
			}
			initialCall = false;
			await Fetcher.selectUser(userId);
			Hash.freeze(true);
			Users.select(userId);
			Hash.freeze(false);

			Interface.setNames(names.map(x => x.name));
			Interface.setZoom(zoom);
			Interface.setPlatform(device);
			Interface.setEmpty(empty);
			if (period) {
				Interface.setPeriod({
					from: +period[0],
					to: +period[1]
				});
			}

			//Reveal element
			setTimeout(() => {
				document
					.getElementById("overview-render")
					?.style.setProperty("opacity", "1");
				setTimeout(() => {
					document
						.getElementById("overview-render")
						?.style.setProperty("transition", "none");
				}, 300);
			}, 200);
		});

		Fetcher.addEventListener(
			"gotsessions",
			async (sessions: IUserSessions) => {
				if (!sessions.sessions) return;

				Users.addSessions(sessions);
				if (Users.isSelected(sessions.id)) {
					//Update range because of new sessions
					Interface.setRange({
						from: Users.selected.firstDay,
						to: Users.selected.lastDay
					});
				}
			}
		);

		Fetcher.addEventListener("gotmap", (map: ISessionMap) => {
			Analysis.setMap(map);
			Analysis.updateUser(Users.selected);
		});
	}
}
