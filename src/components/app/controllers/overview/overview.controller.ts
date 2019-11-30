import User from "../../models/user.class";
import Worker from "worker-loader!./overview.worker";
import { Platforms } from "../../models/session.class";
import Selector from "./selector.class";
import Drawer from "./drawer.class";
import Utils, { LogType } from "../../../common/utils.class";

export default class Overview {
	private static selector: Selector | null = null;
	private static worker: Worker | null = null;
	private static drawer: Drawer | null = null;
	private static user: User | null = null;
	private static zoom: number | null = null;
	private static canvas: HTMLCanvasElement | null = null;

	public static initialize(): void {
		const canvas = document.getElementById("overview-render");
		if (!canvas) {
			throw new Error("Container for overview render not found!");
		}
		this.canvas = canvas as HTMLCanvasElement;

		if (typeof OffscreenCanvas !== "undefined") {
			this.worker = new Worker();
			const offscreenCanvas = this.canvas.transferControlToOffscreen();

			this.worker.postMessage(
				{
					message: "initialize",
					canvas: offscreenCanvas
				},
				[(offscreenCanvas as any) as Transferable]
			);
		} else {
			//Fallback when offscreen canvas is not available
			Utils.log(
				"OffscreenCanvas is not available. Using fallback!",
				LogType.INFO
			);
			this.drawer = new Drawer(this.canvas);
		}

		this.selector = new Selector(this.canvas, this.user);

		window.addEventListener("resize", () => {
			this.updateViewport();
		});

		this.updateZoom();
		this.updateColors();
		this.updateStyles();
		this.updateUser();
	}

	/**
	 * Updates user in drawer worker
	 * @param user New user
	 */
	public static updateUser(user: User | null = null): void {
		if (user) this.user = user;
		if (!this.user) return;

		if (this.worker) {
			this.worker.postMessage({
				message: "updateUser",
				user: this.user.toObject()
			});
		} else if (this.drawer) {
			this.drawer.user = this.user;
			this.drawer.render();
		}

		if (this.selector) {
			this.selector.user = this.user;
		}
	}

	/**
	 * Updates zoom factor in drawer worker
	 * @param factor Zoom factor
	 */
	public static updateZoom(factor: number | null = null): void {
		if (factor) this.zoom = factor;
		if (!this.zoom) return;

		if (this.worker) {
			this.worker.postMessage({
				message: "updateZoom",
				factor: this.zoom
			});
		} else if (this.drawer) {
			this.drawer.zoom = this.zoom;
		}

		this.updateViewport();

		if (this.selector) {
			this.selector.zoom = this.zoom;
		}
	}

	/**
	 * Updates colors in drawer worker
	 * @param colors Devices color array
	 */
	public static updateColors(colors: string[] | null = null): void {
		if (!this.worker && !this.drawer) return;

		if (!colors) {
			colors = [];

			const styles = window.getComputedStyle(
				document.getElementsByClassName("page")[0]
			);
			for (const platform in Object.keys(Platforms)) {
				const color = styles.getPropertyValue(
					"--color-" + Platforms[platform]
				);
				if (color) {
					colors[platform] = color.trim();
				}
			}
		}

		if (this.worker) {
			this.worker.postMessage({
				message: "updateColors",
				colors: colors
			});
		} else if (this.drawer) {
			this.drawer.colors = colors;
			this.drawer.render();
		}
	}

	/**
	 * Updates styles like text/background colors and fonts in drawer worker
	 * @param styles General styles
	 */
	public static updateStyles(
		styles: CSSStyleDeclaration | null = null
	): void {
		if (!this.worker && !this.drawer) return;

		if (!styles) {
			styles = window.getComputedStyle(
				document.getElementsByClassName("page")[0]
			);
		}

		const cloned = {
			fontFamily: styles.fontFamily,
			color: styles.color
		};

		if (this.worker) {
			this.worker.postMessage({
				message: "updateStyles",
				styles: cloned
			});
		} else if (this.drawer) {
			this.drawer.updateStyles(cloned as CSSStyleDeclaration);
			this.drawer.render();
		}
	}

	/**
	 * Updates rendered viewport size in drawer worker
	 * @param width Width of new viewport
	 * @param height Height of new viewport
	 */
	private static updateViewport(width?: number, height?: number): void {
		if (!this.worker && !this.drawer) return;
		if (!this.canvas) {
			throw new Error("Overview canvas container not found!");
		}

		if (!width) {
			width = this.canvas.clientWidth * devicePixelRatio;
		}
		if (!height) {
			height = this.canvas.clientHeight * devicePixelRatio;
		}
		if (this.worker) {
			this.worker.postMessage({
				message: "updateViewport",
				width: width,
				height: height
			});
		} else if (this.drawer) {
			this.canvas.width = width;
			this.canvas.height = height;
			this.drawer.updateStyles();
			this.drawer.render();
		}
	}
}
