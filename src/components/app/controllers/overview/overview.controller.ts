import User from "../../models/user.class";
import Session, { Platforms } from "../../models/session.class";
import Selector from "./selector.class";
import Drawer from "./drawer.class";

export default class Overview {
	public static canvas: HTMLCanvasElement | null = null;
	private static selector: Selector | null = null;
	private static drawer: Drawer | null = null;
	private static user: User | null = null;
	private static zoom: number | null = null;

	public static initialize(): void {
		const canvas = document.getElementById("overview-render");
		if (!canvas) {
			throw new Error("Container for overview render not found!");
		}
		this.canvas = canvas as HTMLCanvasElement;

		this.drawer = new Drawer(this.canvas);
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
	 * Gets current selected session
	 */
	public static getSession(): Session | null {
		if (!this.selector) return null;

		return this.selector.session;
	}

	/**
	 * Updates user in drawer worker
	 * @param user New user
	 */
	public static updateUser(user: User | null = null): void {
		if (user) this.user = user;
		if (!this.user) return;

		if (this.drawer) {
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

		if (this.drawer) {
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

		if (this.drawer) {
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
		if (!styles) {
			styles = window.getComputedStyle(
				document.getElementsByClassName("page")[0]
			);
		}

		const cloned = {
			fontFamily: styles.fontFamily,
			color: styles.color
		};

		if (this.drawer) {
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
		if (!this.drawer) return;
		if (!this.canvas) {
			throw new Error("Overview canvas container not found!");
		}

		if (!width) {
			width = this.canvas.clientWidth * devicePixelRatio;
		}
		if (!height) {
			height = this.canvas.clientHeight * devicePixelRatio;
		}
		if (this.drawer) {
			this.canvas.width = width;
			this.canvas.height = height;
			this.drawer.updateStyles();
			this.drawer.render();
		}
	}
}
