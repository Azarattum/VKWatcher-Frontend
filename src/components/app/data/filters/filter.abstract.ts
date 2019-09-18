/**
 * Abstract class for session and day filters
 */
export default abstract class Filter {
    public enabled: boolean = true;

    constructor(public id: string | number) { }

    /**
     * Toggle the state of the filter.
     * @param {Boolean} value Enable or disable the filter.
     */
    toggle(value?: boolean): void {
        if (value == undefined) {
            this.enabled = !this.enabled;
        } else {
            this.enabled = value;
        }
    }
}