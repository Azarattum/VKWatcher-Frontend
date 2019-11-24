import Drawer from "./drawer.class";
// let drawer: Drawer;
/**
 * Web Worker for overview service
 */
self.onmessage = (eventArgs: MessageEvent): void => {
	switch (eventArgs.data.message) {
		case "initialize": {
			const canvas = eventArgs.data.canvas as OffscreenCanvas;
			initialize(canvas);
			break;
		}

		default:
			break;
	}

	/*const viewport = eventArgs.data.viewport as {
		width: number;
		height: number;
	};*/
};

function initialize(canvas: OffscreenCanvas): void {
	const drawer = new Drawer(canvas);
	console.log("Inited", drawer);
}
