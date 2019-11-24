declare module "worker-loader!*" {
	class WebpackWorker extends Worker {
		public constructor();
	}

	export default WebpackWorker;
}

declare module "*.pug" {
	const value: (locals?: {}) => string;
	export default value;
}
