/* eslint @typescript-eslint/explicit-function-return-type: 0 */

/**
 * Event-driven service generic type builder
 */
export default function Service<T extends string>() {
	/**
	 * Abstract of the service class
	 */
	abstract class Service {
		/**Callbacks storage */
		private static callbacks: { [type: string]: Function[] } = {};

		/**
		 * Listens to a specified event in the service
		 * @param type Event type
		 * @param callback Callback function
		 */
		public static addEventListener(type: T, callback: Function): void {
			if (!(type in this.callbacks)) this.callbacks[type] = [];
			this.callbacks[type].push(callback);
		}

		/**
		 * Calls all the registered event listeners in the service
		 * @param type Event type
		 * @param args Arguments to pass to callbacks
		 */
		protected static call(type: T, ...args: any[]): void {
			if (this.callbacks[type]) {
				this.callbacks[type].map(x => x.call(x, ...args));
			}
		}
	}

	//Return service with specific typings
	return Service;
}
