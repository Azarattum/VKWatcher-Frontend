/**
 * Abstract class for session and day filters
 */
export default class Filter {
    constructor(id) {
        this.enabled = true;
        this.id = id;
    }
    /**
     * Toggle the state of the filter.
     * @param {Boolean} value Enable or disable the filter.
     */
    toggle(value) {
        if (value == undefined) {
            this.enabled = !this.enabled;
        }
        else {
            this.enabled = value;
        }
    }
}
//# sourceMappingURL=filter.abstract.js.map