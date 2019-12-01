import Worker from "worker-loader!./analysis.worker";
import User from "../../models/user.class";
import { IResult } from "./analysers/analyzer.interface";
import { IUsersData } from "../../services/users.service";
import DateUtils from "../../../common/date.class";

export default class Analysis {
	private static container: HTMLElement | null = null;
	private static worker: Worker | null = null;
	private static user: User | null;
	private static names: { [id: string]: string } = {};

	/**
	 * Initializes analysis controller
	 */
	public static initialize(users: IUsersData): void {
		const container = document.getElementById("analysis-render");
		if (!container) {
			throw new Error("Container for analysis render not found!");
		}
		this.container = container;

		this.worker = new Worker();
		this.worker.postMessage({
			users: users
		});
		this.worker.addEventListener("message", (eventArgs: MessageEvent) => {
			this.renderResult(
				eventArgs.data.result,
				eventArgs.data.description,
				eventArgs.data.done
			);
		});

		for (const id in users) {
			this.names[id] = users[id].name;
		}

		this.updateUser();
	}

	/**
	 *
	 * @param user New user to analyse
	 */
	public static updateUser(user: User | null = null): void {
		if (user) this.user = user;
		if (!this.user) return;

		if (this.worker) {
			this.worker.postMessage({ user: this.user.toObject() });
		}
	}

	private static renderResult(
		result: IResult,
		description: string,
		done: boolean
	): void {
		if (!this.container) return;

		///Append to html in the future
		console.log(description + ":\n\t", this.formatResult(result), done);
	}

	private static formatResult(result: IResult): string[] {
		const formatted: string[] = [];
		for (const key of Object.keys(result)) {
			if (key == "format") continue;
			const value = result[key as any];
			let format = Number.isInteger(+key)
				? ""
				: key.replace(/.{1}/, key.charAt(0).toUpperCase()) + ": ";

			switch (result.format) {
				case "time":
					format += DateUtils.getReadableDuration(+value);
					break;
				case "user":
					format += this.names[value];
					break;
				case "period": {
					const parts = value.split(" ");
					format += Math.floor(+parts[0] / 2) + ":";
					format += (+parts[0] % 2 ? "30" : "00") + " - ";
					format += Math.ceil(+parts[1] / 2) + ":";
					format += +parts[1] % 2 ? "00" : "30";
					break;
				}
				default:
					if (Number.isFinite(+value)) {
						format += Math.round(+value);
					} else {
						format += value.replace(
							/.{1}/,
							value.charAt(0).toUpperCase()
						);
					}
					break;
			}

			formatted.push(format);
		}

		return formatted;
	}
}
