import "./chart.scss";
import Template from "./chart.pug";
import View from "../../../common/view.abstract";

/**
 * Chart view
 */
export default class Chart extends View {
	public constructor() {
		super("Chart");

		this.template = Template();
	}
}
