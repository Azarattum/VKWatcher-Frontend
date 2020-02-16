import Worker from "worker-loader!./analysis.worker";
import User from "../../models/user.class";
import { IResult } from "./analysers/analyzer.interface";
import DateUtils from "../../../common/date.class";
import { ISessionMap, IUserName } from "../../services/fetcher.service";

export default class Analysis {
	private static container: HTMLElement | null = null;
	private static worker: Worker | null = null;
	private static user: User | null;
	private static names: IUserName[];

	/**
	 * Initializes analysis controller
	 */
	public static initialize(): void {
		const container = document.getElementById("analysis-render");
		if (!container) {
			throw new Error("Container for analysis render not found!");
		}
		this.container = container;

		this.worker = new Worker();
		this.worker.addEventListener("message", (eventArgs: MessageEvent) => {
			this.renderResult(
				eventArgs.data.result,
				eventArgs.data.description,
				eventArgs.data.done
			);
		});

		this.updateUser();
	}

	/**
	 * Clears analysis DOM
	 */
	public static clear(): void {
		if (!this.container) return;

		this.container.innerHTML = "";
		this.container.appendChild(this.createBox());
	}

	/**
	 * Sets users' names to enable propper formating
	 * @param names Users' names
	 */
	public static setNames(names: IUserName[]): void {
		this.names = names;
	}

	/**
	 * Sets density map to activate dependent analyzers
	 * @param map Users' sessions density map
	 */
	public static setMap(map: ISessionMap): void {
		if (!this.worker) return;
		//Send map to the worker, then it enables similarity heruistics
		this.worker.postMessage({
			map: map
		});
	}

	/**
	 * Starts analyse of a given user
	 * @param user New user to analyse
	 */
	public static updateUser(user: User | null = null): void {
		if (user) this.user = user;
		if (!this.user) return;

		if (this.worker) {
			this.worker.postMessage({ user: this.user.toObject() });

			if (this.container) {
				const boxes = document.querySelectorAll("[box-type]");
				if (boxes.length == 0) {
					this.container.appendChild(this.createBox());
				}
			}
		}
	}

	private static createBox(type: string = "Loading"): HTMLElement {
		const box = document.createElement("div");
		box.classList.add("analysis-box");
		box.setAttribute("box-type", type);
		const title = document.createElement("div");
		title.classList.add("title");
		title.innerText = "Analyzing...";

		box.appendChild(title);

		return box;
	}

	private static renderResult(
		result: IResult,
		description: string,
		done: boolean
	): void {
		if (!this.container) return;
		let box = document.querySelector(`[box-type='${description}']`);
		if (!box) {
			box = document.querySelector(`[box-type='Loading']`);
			if (box) {
				box.setAttribute("box-type", description);
			}
		}
		if (!box) {
			box = this.createBox(description);
			this.container.appendChild(box);
		}

		//Set the box title
		const title = box.firstChild as HTMLElement;
		title.innerText = description;
		const formattedResult = this.formatResult(result);

		//Clear previous results
		const items = box.getElementsByClassName("content");
		const length = items.length;
		for (let i = 0; i < length; i++) {
			const item = items.item(0);
			if (item) item.remove();
		}
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
				const userNumber = this.names.findIndex(x => x.id == result[i]);
				div.style.cursor = "pointer";
				div.style.textDecoration = "underline";
				div.onclick = (): void => {
					(window as any).Interface.changeUser(userNumber, false);
				};
			}
			box.appendChild(div);
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
					format += this.names.find(x => x.id == value)?.name;
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
