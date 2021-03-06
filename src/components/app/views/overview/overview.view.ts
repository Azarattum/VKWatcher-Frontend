import "./overview.scss";
import Template from "./overview.pug";
import View from "../../../common/view.abstract";

/**
 * Overview view
 */
export default class Overview extends View {
	public constructor() {
		super("Overview");

		this.template = Template;
	}

	public toggle(visible: boolean | null = null): void {
		super.toggle(visible);

		if (visible) {
			window.dispatchEvent(new Event("resize"));
		}

		const filters = document.querySelector(
			".button.filters"
		) as HTMLElement;
		if (filters) filters.style.display = visible ? "block" : "none";
	}
}
