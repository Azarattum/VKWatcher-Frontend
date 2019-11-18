import Slider from "../../vendor/slider/index.class.js";
import DateUtils from "../../common/date.class.js";

export default class Interface {
	private static callbacks: { [type: string]: Function[] } = {};

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
				usersContainer.innerHTML += `<div class="button user" onclick="changeUser(${i})">${user}</div>`;
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

		//Interface functions
		(window as any).changeUser = (id: number, relative: boolean): void => {
			this.call("userchanged", id, relative);
		};

		(window as any).changeEmpty = (event: MouseEvent): void => {
			this.call(
				"emptychanged",
				(event.target as HTMLInputElement).checked
			);
		};

		(window as any).changeDevice = (id: number): void => {
			this.call("devicechanged", id);
		};

		(window as any).openProfile = (event: MouseEvent): void => {
			const id = (event.target as HTMLElement).textContent;
			const newWindow = window.open("https://vk.com/id" + id, "_blank");
			if (newWindow) newWindow.focus();
		};
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
				this.call("periodchanged", from, to, days[0]);
			}
		});

		from = from - days[0] + 1;
		to = to - days[0] + 1;

		//Call filter updates
		this.call("periodchanged", from, to, days[0]);
		this.call("devicechanged", platform);
		this.call("emptychanged", empty);
		if (zoom) {
			this.call("zoomed", zoom);
		}
	}

	public static addEventListener(
		type:
			| "zoomed"
			| "userchanged"
			| "periodchanged"
			| "emptychanged"
			| "devicechanged",
		callback: Function
	): void {
		if (!(type in this.callbacks)) this.callbacks[type] = [];
		this.callbacks[type].push(callback);
	}

	public static call(
		type:
			| "zoomed"
			| "userchanged"
			| "periodchanged"
			| "emptychanged"
			| "devicechanged",
		...args: any[]
	): void {
		if (this.callbacks[type]) {
			this.callbacks[type].map(x => x.call(x, ...args));
		}
	}
}
