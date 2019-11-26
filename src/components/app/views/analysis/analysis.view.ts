import "./analysis.scss";
import Template from "./analysis.pug";
import View from "../../../common/view.abstract";

/**
 * Analysis view
 */
export default class Analysis extends View {
	public constructor() {
		super("Analysis");

		this.template = Template;
	}
}
