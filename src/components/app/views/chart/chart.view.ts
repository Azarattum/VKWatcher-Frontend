import "./chart.scss";
import Template from "./chart.pug";
import View from "../../../common/view.abstract";
import ChartController from "../../controllers/chart/chart.controller";

/**
 * Chart view
 */
export default class Chart extends View {
	public constructor() {
		super("Chart");

		this.template = Template;
	}

	public toggle(visible: boolean | null = null): void {
		super.toggle(visible);

		ChartController.toggle(visible);
	}
}
