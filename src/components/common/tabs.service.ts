import Service from "./service.abstract";
import View from "./view.abstract";

/**
 * Service for controlling application views as tabs
 */
export default class Tabs extends Service<"tabchanged">() {
	private static tabs: View[];

	/**
	 * Initializes tabs service
	 * @param tabs Tabs views to control
	 */
	public static initialize(tabs: View[]): void {
		this.tabs = tabs;

		this.expose("change");
	}

	/**
	 * Changes current opened tab
	 * @param tabName The open of tab to open
	 */
	public static change(tabName: string): void {
		const selected = this.tabs.find(
			tab => tab.name.toLowerCase() == tabName.toLowerCase()
		);
		if (!selected) {
			throw new Error(`Tab ${tabName} does not exist!`);
		}

		this.tabs.forEach(tab => tab.toggle(false));
		selected.toggle(true);

		this.call("tabchanged", selected.name);
	}
}
