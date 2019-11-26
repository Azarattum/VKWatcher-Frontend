import "./filters.scss";
import Template from "./filters.pug";
import View from "../../../common/view.abstract";

/**
 * Filters view
 */
export default class Filters extends View {
	public constructor() {
		super("Filters");

		this.template = Template();
	}
}
