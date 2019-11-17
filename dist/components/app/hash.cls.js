/**
 * Class to work with URL hash
 */
export default class Hash {
    /**
     * Creates URL Hash object
     * @param {Object} defaults Default values for hash
     */
    constructor(defaults) {
        let hash = window.location.hash;
        for (const key in defaults) {
            if (this.exists(key)) {
                continue;
            }
            const value = defaults[key];
            this.set(key, value);
        }
    }
    /**
     * Returns the value of hash property
     * @param {String} propertyName Name of a property
     */
    get(propertyName) {
        this._validateString(propertyName);
        const properties = window.location.hash.slice(1).split(',');
        for (const property of properties) {
            const key = property.split(':')[0];
            //Find property with given name
            if (key.toLocaleLowerCase() == propertyName.toLocaleLowerCase()) {
                //Return the value
                return property.split(':')[1];
            }
        }
        return null;
    }
    /**
     * Sets the value of hash property
     * @param {String} propertyName Name of a property
     */
    set(propertyName, propertyValue) {
        let hash = window.location.hash;
        this._validateString(propertyName);
        this._validateString(propertyValue);
        //Add value to hash if it does not exist
        if (!this.exists(propertyName)) {
            if (!hash.trim().endsWith(",") && hash != "" && hash != "#") {
                window.location.hash += ",";
            }
            window.location.hash += propertyName + ":" + propertyValue;
        }
        //Replace an existing value
        let regexp = new RegExp(propertyName + ":([^,]*|$)");
        window.location.hash = window.location.hash.replace(regexp, propertyName + ":" + propertyValue);
    }
    /**
     * Checks whethe the property exists or not
     * @param {String} string Property name
     */
    exists(propertyName) {
        const hash = window.location.hash;
        return (hash.toLowerCase().indexOf(propertyName.toLowerCase() + ":") != -1);
    }
    /**
     * Raises an exception if the strings contains illegal characters
     * @param {String} string String to check
     */
    _validateString(string) {
        if (string.toString().indexOf(',') != -1 ||
            string.toString().indexOf(':') != -1) {
            throw new Error("Illegal characters in property!");
        }
    }
}
//# sourceMappingURL=hash.cls.js.map