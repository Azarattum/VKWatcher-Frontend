/**
 * Abstract class for session and day filters
 */
export default abstract class Filter {
	public enabled: boolean = true;
	public id: string | number;

	public constructor(id: string | number) {
		this.id = id;
	}

	/**
	 * Toggle the state of the filter.
	 * @param {Boolean} value Enable or disable the filter.
	 */
	public toggle(value?: boolean): void {
		if (value == undefined) {
			this.enabled = !this.enabled;
		} else {
			this.enabled = value;
		}
	}
}
