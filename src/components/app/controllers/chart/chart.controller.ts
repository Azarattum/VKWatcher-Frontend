import ChartLib from "../../../vendor/chart/chart";
import User from "../../models/user.class";

export default class Chart {
	private static chart: ChartLib | null;
	private static user: User | null;

	/**
	 * Initializes chart controller
	 */
	public static initialize(): void {
		const container = document.getElementById("chart-render");
		if (!container) {
			throw new Error("Container for chart render not found!");
		}

		this.chart = new ChartLib(container);
		if (this.user) {
			this.updateUser();
		}
	}

	/**
	 * Updates user in charts lib
	 * @param user New user
	 */
	public static updateUser(user: User | null = null): void {
		if (user) this.user = user;
		if (!this.chart || !this.user || !this.chart.enabled) return;

		this.chart.switch(this.user);
		this.user = null;
	}

	/**
	 * Toggles chart render
	 * @param enabled Whether render is enabled
	 */
	public static toggle(enabled: boolean | null = null): void {
		if (!this.chart) return;

		if (enabled == null) enabled = !this.chart.enabled;

		this.chart.enabled = enabled;
		if (enabled && this.user) {
			this.chart.switch(this.user);
			this.user = null;
		}
	}
}
