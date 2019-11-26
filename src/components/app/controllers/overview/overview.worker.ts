/**
 * Web Worker for overview service
 */
import Drawer from "./drawer.class";
import User from "../../models/user.class";

const ctx: Worker = self as any;
let drawer: Drawer;
let offscreenCanvas: OffscreenCanvas;
let requestedRender = false;
const render = (): void => {
	drawer.render();
	requestedRender = false;
};

ctx.addEventListener("message", (eventArgs: MessageEvent): void => {
	switch (eventArgs.data.message) {
		case "initialize": {
			const canvas = eventArgs.data.canvas as OffscreenCanvas;
			initialize(canvas);
			break;
		}
		case "updateUser": {
			const user = eventArgs.data.user as User;
			updateUser(user);
			break;
		}
		case "updateZoom": {
			const factor = eventArgs.data.factor as number;
			updateZoom(factor);
			break;
		}
		case "updateColors": {
			const colors = eventArgs.data.colors as string[];
			updateColors(colors);
			break;
		}
		case "updateViewport": {
			const width = eventArgs.data.width as number;
			const height = eventArgs.data.height as number;
			updateViewport(width, height);
			break;
		}
		case "updateStyles": {
			const styles = eventArgs.data.styles as CSSStyleDeclaration;
			updateStyles(styles);
			break;
		}

		default:
			break;
	}
});

function initialize(canvas: OffscreenCanvas): void {
	offscreenCanvas = canvas;
	drawer = new Drawer(canvas);
}

function updateUser(user: User): void {
	user = User.fromObject(user);
	drawer.user = user;
	requestRender();
}

function updateZoom(factor: number): void {
	drawer.zoom = factor;
}

function updateColors(colors: string[]): void {
	drawer.colors = colors;
	requestRender();
}

function updateViewport(width: number, height: number): void {
	offscreenCanvas.width = width;
	offscreenCanvas.height = height;
	drawer.updateStyles();
	requestRender();
}

function updateStyles(styles: CSSStyleDeclaration): void {
	drawer.updateStyles(styles);
	requestRender();
}

function requestRender(): void {
	if (!drawer || requestedRender) return;

	requestAnimationFrame(render);
	requestedRender = true;
}
