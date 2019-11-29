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

		/**
		 * Exposes function to be used in global window scope.
		 * Either a custom function can be provided or a method
		 * of current service class (the names must match)
		 * @param name Name of the exposed function (in the scope of service)
		 * @param func Exposed function
		 */
		protected static expose(
			name: string,
			func: Function | null = null
		): void {
			if (!(window as any)[this.name]) {
				(window as any)[this.name] = {};
			}

			if (func) {
				(window as any)[this.name][name] = func;
			} else {
				if (typeof (this as any)[name] != "function") {
					throw new Error("The function to expose not found!");
				}
				(window as any)[this.name][name] = (...args: any[]) => {
					((this as any)[name] as Function).call(this, ...args);
				};
			}
		}
	}

	//Return service with specific typings
	return Service;
}
