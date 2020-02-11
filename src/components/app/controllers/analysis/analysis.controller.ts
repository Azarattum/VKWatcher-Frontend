import Worker from "worker-loader!./analysis.worker";
import User from "../../models/user.class";
import { IResult } from "./analysers/analyzer.interface";
import { IUsersData } from "../../services/users.service";
import DateUtils from "../../../common/date.class";

export default class Analysis {
	private static container: HTMLElement | null = null;
	private static worker: Worker | null = null;
	private static user: User | null;
	private static box: HTMLElement | null = null;
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

			if (this.container) {
				this.container.innerHTML = "";
				this.container.appendChild(this.createBox());
			}
		}
	}

	private static createBox(): HTMLElement {
		const box = document.createElement("div");
		box.classList.add("analysis-box");
		const title = document.createElement("div");
		title.classList.add("title");
		title.innerText = "Analyzing...";

		box.appendChild(title);
		this.box = box;

		return box;
	}

	private static renderResult(
		result: IResult,
		description: string,
		done: boolean
	): void {
		if (!this.container) return;
		if (!this.box) this.container.appendChild(this.createBox());
		if (!this.box) return;

		//Set the box title
		const title = this.box.firstChild as HTMLElement;
		title.innerText = description;
		const formattedResult = this.formatResult(result);

		//Append all results
		for (const i in formattedResult) {
			const content = formattedResult[i];
			const div = document.createElement("div");
			div.classList.add("content");
			if (+i == 0) {
				div.classList.add("top");
			} else if (+i == formattedResult.length - 1) {
				div.classList.add("bottom");
			}

			div.innerText = content;
			if (result.format == "user") {
				const userNumber = Object.keys(this.names).indexOf(result[i]);
				div.style.cursor = "pointer";
				div.style.textDecoration = "underline";
				div.onclick = (): void => {
					(window as any).Interface.changeUser(userNumber, false);
				};
			}
			this.box.appendChild(div);
		}

		//Create next box if not done
		if (!done) {
			this.container.appendChild(this.createBox());
		}
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
