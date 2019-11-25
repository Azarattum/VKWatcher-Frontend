import User from "../../models/user.class";
import Worker from "worker-loader!./overview.worker";
import { Platforms } from "../../models/session.class";

export default class Overview {
	private static worker: Worker;
	private static user: User | null = null;
	private static zoom: number | null = null;

	public static initialize(): void {
		this.worker = new Worker();

		const canvas = document.getElementById(
			"overview-render"
		) as HTMLCanvasElement;
		const offscreenCanvas = canvas.transferControlToOffscreen();

		this.worker.postMessage(
			{
				message: "initialize",
				canvas: offscreenCanvas
			},
			[(offscreenCanvas as any) as Transferable]
		);

		window.addEventListener("resize", () => {
			this.updateViewport(
				canvas.clientWidth * devicePixelRatio,
				canvas.clientHeight * devicePixelRatio
			);
		});
		this.updateViewport(
			canvas.clientWidth * devicePixelRatio,
			canvas.clientHeight * devicePixelRatio
		);

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
		if (!this.worker || !this.user) return;

		this.worker.postMessage({
			message: "updateUser",
			user: this.user.toObject()
		});
	}

	/**
	 * Updates zoom factor in drawer worker
	 * @param factor Zoom factor
	 */
	public static updateZoom(factor: number | null = null): void {
		if (factor) this.zoom = factor;
		if (!this.worker || !this.zoom) return;

		this.worker.postMessage({
			message: "updateZoom",
			factor: this.zoom
		});
	}

	/**
	 * Updates colors in drawer worker
	 * @param colors Devices color array
	 */
	public static updateColors(colors: string[] | null = null): void {
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

		this.worker.postMessage({
			message: "updateColors",
			colors: colors
		});
	}

	/**
	 * Updates styles like text/background colors and fonts in drawer worker
	 * @param styles General styles
	 */
	public static updateStyles(
		styles: CSSStyleDeclaration | null = null
	): void {
		if (!styles) {
			styles = window.getComputedStyle(
				document.getElementsByClassName("page")[0]
			);
		}

		const cloned = {
			fontFamily: styles.fontFamily,
			color: styles.color
		};

		this.worker.postMessage({
			message: "updateStyles",
			styles: cloned
		});
	}

	/**
	 * Updates rendered viewport size in drawer worker
	 * @param width Width of new viewport
	 * @param height Height of new viewport
	 */
	private static updateViewport(width: number, height: number): void {
		this.worker.postMessage({
			message: "updateViewport",
			width: width,
			height: height
		});
	}
}
