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

	public static initialize(users: string[]): void {
		this.emptyButton = document.getElementById("empty") as HTMLInputElement;
		this.deviceSelector = document.getElementById(
			"device"
		) as HTMLSelectElement;

		//Users list
		const usersContainer = document.getElementById("users");
		if (usersContainer) {
			for (const i in users) {
				const user: string = users[i];
				usersContainer.innerHTML += `<div class="button user" onclick="Interface.changeUser(${i})">${user}</div>`;
			}
		}

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

	public static refresh(
		days: number[],
		{ from, to }: { from: number; to: number },
		platform: number,
		empty: boolean,
		zoom: number | null = null
	): void {
		//Update controls
		if (zoom) {
			this.zoomSlider.update({
				from: zoom
			});
		}

		this.emptyButton.checked = empty;
		this.deviceSelector.value = platform.toString();
		this.periodSlider.update({
			min: days[0],
			max: days[days.length - 1],
			from: from,
			to: to,
			onChange: data => {
				from = data.from - days[0] + 1;
				to = data.to - days[0] + 1;
				this.call("periodchanged", from, to, days[0], true);
			}
		});

		from = from - days[0] + 1;
		to = to - days[0] + 1;

		//Call filter updates
		this.call("periodchanged", from, to, days[0], !!zoom);
		this.call("devicechanged", platform, !!zoom);
		this.call("emptychanged", empty, !!zoom);
		if (zoom) {
			this.call("zoomed", zoom);
		}
	}
}
