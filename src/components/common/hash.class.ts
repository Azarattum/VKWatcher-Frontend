/**
 * Class to work with URL hash
 */
export default class Hash {
	/**
	 * Initializes URL Hash object
	 * @param {Object} defaults Default values for hash
	 */
	public static initialize(defaults: { [property: string]: any }): void {
		for (const key in defaults) {
			if (this.exists(key)) {
				continue;
			}
			const value = defaults[key];
			this.set(key, value.toString());
		}
	}

	/**
	 * Returns the value of hash property
	 * @param {String} property Name of property
	 */
	public static get(property: string): string | null {
		this.validateString(property);
		const properties = window.location.hash.slice(1).split(",");
		for (const prop of properties) {
			const key = prop.split(":")[0];
			//Find property with given name
			if (key.toLocaleLowerCase() == property.toLocaleLowerCase()) {
				//Return the value
				return prop.split(":")[1];
			}
		}
		return null;
	}

	/**
	 * Sets the value of hash property
	 * @param {String} propertyName Name of a property
	 */
	public static set(property: string, value: any): void {
		value = value.toString();
		const hash = window.location.hash;
		this.validateString(property);
		this.validateString(value);
		//Add value to hash if it does not exist
		if (!this.exists(property)) {
			if (!hash.trim().endsWith(",") && hash != "" && hash != "#") {
				window.location.hash += ",";
			}
			window.location.hash += property + ":" + value;
		}

		//Replace an existing value
		const regexp = new RegExp(property + ":([^,]*|$)");
		window.location.hash = window.location.hash.replace(
			regexp,
			property + ":" + value
		);
	}

	/**
	 * Checks whethe the property exists or not
	 * @param {String} property Property name
	 */
	public static exists(property: string): boolean {
		const hash = window.location.hash;
		return hash.toLowerCase().indexOf(property.toLowerCase() + ":") != -1;
	}

	/**
	 * Raises an exception if the strings contains illegal characters
	 * @param {String} string String to check
	 */
	private static validateString(string: string): void {
		if (
			string.toString().indexOf(",") != -1 ||
			string.toString().indexOf(":") != -1
		) {
			throw new Error("Illegal characters in property!");
		}
	}
}
