/**
 * Abstract class for session and day filters
 */
export default class Filter {
    constructor(id) {
        this.id = id;
        this.enabled = true;
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