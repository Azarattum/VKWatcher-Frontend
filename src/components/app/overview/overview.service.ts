import Drawer from "./drawer.class.js";
import User from "../data/user.class.js";
import { Platforms } from "../data/session.class.js";

export default class Overview {
	private static callbacks: { [type: string]: Function[] } = {};

	private static drawer: Drawer | null = null;
	private static user: User | null = null;
	private static zoom: number | null = null;

	public static initialize(): void {
		this.drawer = new Drawer(
			document.getElementById("overview-render") as HTMLCanvasElement,
			this.user
		);

		const styles = window.getComputedStyle(
			document.getElementsByClassName("page")[0]
		);

		const colors: string[] = [];
		for (const platform in Platforms) {
			colors[platform] = styles.getPropertyValue(
				"--color-" + Platforms[platform]
			);
		}

		this.drawer.colors = colors;
		if (this.zoom) {
			this.drawer.zoom = this.zoom;
		}
	}

	public static setUser(user: User): void {
		if (!this.drawer) {
			this.user = user;
			return;
		}

		this.drawer.user = user;
		this.drawer.render();
		console.log(this.drawer);
	}

	public static setZoom(factor: number): void {
		if (!this.drawer) {
			this.zoom = factor;
			return;
		}

		this.drawer.zoom = factor;
	}

	public static addEventListener(type: "", callback: Function): void {
		if (!(type in this.callbacks)) this.callbacks[type] = [];
		this.callbacks[type].push(callback);
	}

	public static call(type: "", ...args: any[]): void {
		if (this.callbacks[type]) {
			this.callbacks[type].map(x => x.call(x, ...args));
		}
	}
}
