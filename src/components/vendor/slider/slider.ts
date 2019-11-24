import $ from "./libs/jquery.js";
import "./libs/slider.js";
import "./styles/base.scss";
import "./styles/overwrite.scss";

export default class Slider {
	private element: any;

	public constructor(
		container: HTMLElement | null,
		settings: ISliderSettings
	) {
		if (!container) throw new Error("Invalid container element!");

		(settings as any)["drag_interval"] = settings.dragInterval;
		this.element = ($(
			($(container) as any).ionRangeSlider(settings)
		) as any).data("ionRangeSlider");
	}

	public update(settings: ISliderSettings): void {
		(settings as any)["drag_interval"] = settings.dragInterval;
		this.element.update(settings);
	}
}

export interface ISliderSettings {
	type?: "double" | "single";
	min?: number;
	max?: number;
	step?: number;
	from?: number;
	to?: number;
	dragInterval?: boolean;
	grid?: boolean;
	prettify?: (value: number) => string;
	onFinish?: (state: { from: number; to: number }) => void;
	onChange?: (state: { from: number; to: number }) => void;
}
