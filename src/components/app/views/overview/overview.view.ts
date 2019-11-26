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
}
