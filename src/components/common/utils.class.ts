/**
 * Some useful utilities
 */
export default class Utils {
	/**
	 * Logs formatted text to the developer console
	 * @param text Text to log out
	 * @param type Custom type of the message
	 */
	public static log(text: string, type: LogType = LogType.INFO): void {
		const date = new Date().toTimeString().split(" ")[0];
		const prefix = `[${date}]: `;

		switch (type) {
			case LogType.INFO: {
				console.log(prefix + "%ci " + text, "font-weight:bold;");
				break;
			}

			case LogType.OK: {
				console.log(
					prefix + "%c\u2714 " + text,
					"color:green;font-weight:bold;"
				);
				break;
			}

			case LogType.ERROR: {
				console.error(
					prefix + "%c\u2718 " + text,
					"color:red;font-weight:bold;"
				);
				break;
			}

			case LogType.WARNING: {
				console.log(
					prefix + "%c! " + text,
					"color:goldenrod;font-weight:bold;"
				);
				break;
			}

			case LogType.DIVIDER: {
				const divider = "=".repeat(30 - text.length / 2);
				console.log(
					divider + text + divider + (text.length % 2 ? "=" : "")
				);
				break;
			}

			default:
				throw new TypeError("Unknown log type!");
		}
	}
}

/**
 * Logging message type
 */
export enum LogType {
	INFO,
	OK,
	WARNING,
	ERROR,
	DIVIDER
}
