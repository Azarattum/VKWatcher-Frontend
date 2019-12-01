import Worker from "worker-loader!./analysis.worker";
import User from "../../models/user.class";
import { IResult } from "./analysers/analyzer.interface";

export default class Analysis {
	private static container: HTMLElement | null = null;
	private static worker: Worker | null = null;
	private static user: User | null;

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
		console.log(description + ":\n\t", result, done);
	}
}
