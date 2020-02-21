import Service from "../../common/service.abstract";
import Overview from "../controllers/overview/overview.controller";
import Day from "../models/day.class";
import Users from "./users.service";
import Session from "../models/session.class";
import Utils, { LogType } from "../../common/utils.class";
import Analysis from "../controllers/analysis/analysis.controller";
import { IResult } from "../controllers/analysis/analysers/analyzer.interface";

/**
 * Gathering util service.
 * DEPENDS ON: Overview, Users, Analysis
 */
export default class Gathering extends Service<"">() {
	private static sessions: Session[] = [];
	private static offlinePeriod: number[] = [];

	public static async initialize(): Promise<void> {
		Overview.canvas?.addEventListener("click", (): void => {
			const session = Overview.getSession();
			if (!session) return;

			session.inSleep = !session.inSleep;
			Overview.updateUser();

			const index = this.sessions.indexOf(session);
			if (session.inSleep && index == -1) {
				this.sessions.push(session);
			} else if (index != -1) {
				this.sessions.splice(index, 1);
			} else {
				this.sessions.push(session);
			}
		});

		Analysis.addEventListener(
			"gotresult",
			(result: IResult, description: string) => {
				if (description == "Prefered Offline Periods") {
					const period = result[0].split(" ");
					this.offlinePeriod[0] = +period[0];
					this.offlinePeriod[1] = +period[1];
				}
			}
		);

		//Display service warning
		Utils.log(
			"Gathering is a development service," +
				" it must\n not be used in production!",
			LogType.WARNING
		);

		//Expose dev functions
		this.expose("generateXs");
		this.expose("generateYs");
		this.expose("loadYs");
		this.expose("generate");
		this.expose("download");
	}

	public static generate(all: boolean = false): void {
		this.generateXs(all);
		this.generateYs(all);
	}

	public static loadYs(threshold = 0.5): void {
		const input = document.createElement("input");
		if (!input) return;
		input.setAttribute("type", "file");
		input.click();

		input.addEventListener("change", () => {
			const reader = new FileReader();
			reader.onload = (e): void => {
				if (!e || !e.target || !e.target.result) return;
				const ys = JSON.parse(e.target.result.toString());

				const sessions: Session[] = [];
				Object.values(Users.selected.days).forEach(x =>
					sessions.push(...x.sessions)
				);

				for (const i in ys) {
					sessions[+i].inSleep = ys[i] > threshold ? true : false;
				}
				Overview.updateUser();
			};
			if (!input.files) return;
			reader.readAsText(input.files[0]);
		});
	}

	/**
	 * Generates input xs from selected sessions
	 */
	public static generateXs(all: boolean = false): void {
		Utils.log("Generating Xs", LogType.DIVIDER);

		const allData = [];
		let sessions: Session[] = [];
		if (all) {
			Object.values(Users.selected.days).forEach(x =>
				sessions.push(...x.sessions)
			);
		} else {
			sessions = this.sessions;
		}

		for (const i in sessions) {
			//Declarations
			const days = this.findDays(sessions[i]);
			if (!days) continue;
			const day = days[1];

			if (all) {
				const index = day.sessions.indexOf(sessions[i]);
				const data = this.createData(index, days);
				if (data) allData.push(data);
			} else {
				//Push data from all session from the day
				for (const index in day.sessions) {
					const data = this.createData(+index, days);
					if (data) allData.push(data);
				}
			}

			Utils.log(
				`[${(((+i + 1) / sessions.length) * 100).toFixed(
					0
				)}%] Generating...`
			);
		}

		Utils.log("Successfuly generated!", LogType.OK);
		Utils.log("Data is exposed as: window.xs");
		Utils.log("To save it use: Gathering.download()");
		(window as any).xs = allData;
	}

	/**
	 * Generates input xs from selected sessions
	 */
	public static generateYs(all: boolean = false): void {
		Utils.log("Generating Ys", LogType.DIVIDER);

		const allData = [];
		let sessions: Session[] = [];
		if (all) {
			Object.values(Users.selected.days).forEach(x =>
				sessions.push(...x.sessions)
			);
		} else {
			sessions = this.sessions;
		}

		for (const i in sessions) {
			//Declarations
			const days = this.findDays(sessions[i]);
			if (!days) continue;
			const day = days[1];

			if (all) {
				allData.push([sessions[i].inSleep ? 1 : 0]);
			} else {
				//Push data from all session from the day
				for (const session of day.sessions) {
					allData.push([session.inSleep ? 1 : 0]);
				}
			}

			Utils.log(
				`[${(((+i + 1) / sessions.length) * 100).toFixed(
					0
				)}%] Generating...`
			);
		}

		Utils.log("Successfuly generated!", LogType.OK);
		Utils.log("Data is exposed as: window.ys");
		Utils.log("To save it use: Gathering.download()");
		(window as any).ys = allData;
	}

	/**
	 * Creates a download for previously generated data
	 */
	public static download(): void {
		if (!(window as any).xs && !(window as any).ys) {
			Utils.log("Generate data first!", LogType.ERROR);
			return;
		}

		if ((window as any).xs) {
			const blob = new Blob([JSON.stringify((window as any).xs)], {
				type: "application/json"
			});
			const a = document.createElement("a");
			a.setAttribute("href", URL.createObjectURL(blob));
			a.setAttribute("download", Users.selected.id + "_xs.json");
			a.click();
		}
		if ((window as any).ys) {
			const blob = new Blob([JSON.stringify((window as any).ys)], {
				type: "application/json"
			});
			const a = document.createElement("a");
			a.setAttribute("href", URL.createObjectURL(blob));
			a.setAttribute("download", Users.selected.id + "_ys.json");
			a.click();
		}
	}

	/**
	 * Creates number data array from session parameters
	 * @param index Session index in the day
	 * @param days Days around
	 */
	private static createData(index: number, days: Day[]): number[] | null {
		if (this.offlinePeriod.length == 0) {
			Utils.log(
				"We do not have data from analyzers just yet",
				LogType.ERROR
			);
			return null;
		}

		//Declarations
		const dayMilliseconds = 60 * 60 * 24 * 1000;
		const session = days[1].sessions[index];
		const nextSession =
			days[1].sessions[index + 1] || days[2].sessions[0] || session;

		//Session length
		const length = (session.length / dayMilliseconds) * 1000;

		//Distance to the next session
		const distance = (+nextSession.from - +session.to) / dayMilliseconds;

		//Distance to the offline time start
		const time = session.to.getHours() * 2 + session.to.getMinutes() / 30;
		const offlineStart =
			Math.min(
				Math.abs(time - this.offlinePeriod[0]),
				Math.abs(time - (this.offlinePeriod[0] + 48))
			) / 24;

		//Distance to the offline time end
		const timeNext =
			nextSession.from.getHours() * 2 +
			nextSession.from.getMinutes() / 30;
		const offlineEnd =
			Math.min(
				Math.abs(timeNext - this.offlinePeriod[1]),
				Math.abs(timeNext - (this.offlinePeriod[1] + 48))
			) / 24;

		//Map of nearby hours
		const hour = Math.floor(+session.to / 1000 / 60 / 60) + 7;
		const map = this.generateMap(hour);

		//Saving data array
		return [length, distance, offlineStart, offlineEnd, ...map];
	}

	/**
	 * Generates map of +-12 hours around the target hour
	 * @param hour Target hour
	 */
	private static generateMap(hour: number): number[] {
		if (Analysis.map == null) {
			Utils.log(
				"We do not have map from analyzers just yet",
				LogType.ERROR
			);
			return [];
		}

		const map = Analysis.map[Users.selected.id];
		const result = [];
		for (let i = hour - 12; i < hour + 12; i++) {
			result.push((map[i] || 0) / 3600);
		}
		return result;
	}

	/**
	 * Finds previous, current and next days of the session
	 * @param session Session from the days
	 */
	private static findDays(session: Session): Day[] | null {
		const days = Object.values(Users.selected.days);
		const day = days.find(x => x.getSession(session.from, false));
		if (!day) return null;

		const found = [];
		const index = days.indexOf(day);
		const dayMilliseconds = 60 * 60 * 24 * 1000;
		//Push 3 found days
		if (index <= 0) {
			found.push(new Day(+session.from - dayMilliseconds));
		} else {
			found.push(days[index - 1]);
		}
		found.push(day);
		if (index >= days.length - 1) {
			found.push(new Day(+session.from - dayMilliseconds));
		} else {
			found.push(days[index + 1]);
		}

		return found;
	}
}
