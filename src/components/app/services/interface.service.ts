import Slider from "../../vendor/slider/slider";
import DateUtils from "../../common/date.class";
import Service from "../../common/service.abstract";

export default class Interface extends Service<
	| "zoomed"
	| "userchanged"
	| "periodchanged"
	| "emptychanged"
	| "devicechanged"
>() {
	private static periodSlider: Slider;
	private static zoomSlider: Slider;
	private static emptyButton: HTMLInputElement;
	private static deviceSelector: HTMLSelectElement;

	public static initialize(): void {
		this.emptyButton = document.getElementById("empty") as HTMLInputElement;
		this.deviceSelector = document.getElementById(
			"device"
		) as HTMLSelectElement;

		//Period selector
		this.periodSlider = new Slider(
			document.getElementById("period-slider"),
			{
				type: "double",
				dragInterval: true,
				grid: true,
				prettify: (value: number): string => {
					let date = DateUtils.getDateFromGlobalDay(value).toString();
					date = date.split(" ")[1] + " " + date.split(" ")[2];
					return date;
				},
				onChange: (data): void => {
					this.call("periodchanged", data.from, data.to);
				}
			}
		);

		//Zoom selector
		this.zoomSlider = new Slider(document.getElementById("zoom-slider"), {
			min: 0.75,
			max: 16,
			step: 0.25,
			from: 1,
			onFinish: (state): void => {
				this.call("zoomed", state.from);
			}
		});

		//Interface global functions
		this.expose("changeUser", (id: number, relative: boolean): void => {
			this.call("userchanged", id, relative, true);
		});

		this.expose("changeEmpty", (event: MouseEvent): void => {
			this.call(
				"emptychanged",
				(event.target as HTMLInputElement).checked,
				true
			);
		});

		this.expose("changeDevice", (id: number): void => {
			this.call("devicechanged", id, true);
		});

		this.expose("openProfile", (event: MouseEvent): void => {
			const id = (event.target as HTMLElement).textContent;
			const newWindow = window.open("https://vk.com/id" + id, "_blank");
			if (newWindow) newWindow.focus();
		});
	}

	public static setNames(names: string[]): void {
		//Users list
		const usersContainer = document.getElementById("users");
		if (usersContainer) {
			for (const i in names) {
				usersContainer.innerHTML += `<div class="button user" onclick="Interface.changeUser(${i})">${names[i]}</div>`;
			}
		}
	}

	/**
	 * Sets new zoom value
	 * @param zoom New zoom value
	 */
	public static setZoom(zoom: number): void {
		this.zoomSlider.update({
			from: zoom
		});
		this.call("zoomed", zoom);
	}

	/**
	 * Sets the state of empty filter checkbox
	 * @param checked Is checkbox checked
	 */
	public static setEmpty(checked: boolean): void {
		this.emptyButton.checked = checked;
		this.call("emptychanged", checked);
	}

	/**
	 * Sets new platform filter selected
	 * @param platform New plaform filter id
	 */
	public static setPlatform(platform: number): void {
		this.deviceSelector.value = platform.toString();
		this.call("devicechanged", platform);
	}

	/**
	 * Sets parameters for the period slider
	 * @param selected Range of the selected period
	 */
	public static setPeriod(selected: { from: number; to: number }): void {
		const min = Math.min(
			this.periodSlider.element.options.min,
			selected.from
		);
		const max = Math.max(
			this.periodSlider.element.options.max,
			selected.to
		);
		this.periodSlider.update({
			min: min,
			max: max,
			from: selected.from,
			to: selected.to
		});

		this.call("periodchanged", selected.from, selected.to);
	}

	/**
	 * Sets the range of the period slider
	 * @param selected Range of the selected period
	 */
	public static setRange(range: { from: number; to: number }): void {
		this.periodSlider.update({
			min: range.from,
			max: range.to
		});
	}
}
