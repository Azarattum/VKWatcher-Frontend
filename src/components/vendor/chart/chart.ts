/**Styles */
import "./styles/base.scss";
/**Classes */
import ChartElement from "./libs/element/element";
import DateUtils from "../../common/date.class";
import User from "../../app/models/user.class";
/**Shaders */
import BarVertex from "./shaders/bar.vsh";
import BarFragment from "./shaders/bar.fsh";
import LayoutVertex from "./shaders/layout.vsh";
import LayoutFragment from "./shaders/layout.fsh";

export default class Chart {
	public enabled: boolean = false;

	private container: HTMLElement;
	private chart: ChartElement;
	private data: IChartData | null = null;
	private backgroundlyResized: boolean = false;

	public constructor(container: HTMLElement) {
		this.container = container;

		const pageStyle = getComputedStyle(document.body);
		const shaders = {
			bar: [BarVertex, BarFragment],
			layout: [LayoutVertex, LayoutFragment]
		};

		this.chart = new ChartElement(this.container, shaders);
		this.chart.style = {
			background: "255, 255, 255",
			text: pageStyle.getPropertyValue("--color-text"),
			font: pageStyle.fontFamily,
			lowlight: 0.05
		};

		this.registerEvents();
	}

	//#region Public methods
	/**
	 * Changes user whose chart is drawing
	 * @param {User} user New user changes user whose chart is drawing
	 */
	public async switch(user: User): Promise<void> {
		if (Object.keys(user.days).length == 0) {
			this.container.innerHTML = "";
			return;
		}
		this.data = await this.convertData(user);

		this.refresh();
	}

	/**
	 * Refreshes chart data using current user data
	 */
	private async refresh(): Promise<void> {
		if (!this.data) return;

		try {
			if (this.chart.drawer) {
				this.chart.drawer.gl.gl
					.getExtension("WEBGL_lose_context")
					.loseContext();
			}
			if (this.chart.previewer) {
				this.chart.previewer.gl.gl
					.getExtension("WEBGL_lose_context")
					.loseContext();
			}
		} catch {
			//Something went wrong...
		}
		this.container.innerHTML = "";
		this.container.className = "";
		this.chart._initializeComponent();
		this.chart._initializeStyle();
		this.chart.chart = this.data;

		if (!this.chart.drawer) return;
		//Custom format style
		const func = this.chart.drawer.onrecalculated;
		this.chart.drawer.onrecalculated = (): void => {
			func();
			if (!this.chart) return;

			const values = (this.chart.elements as { values: HTMLElement })
				.values.children;
			for (const valueElement of values) {
				const lastChild =
					valueElement.children[valueElement.children.length - 1];
				lastChild.innerHTML = DateUtils.getReadableDuration(
					+lastChild.innerHTML.replace(/\s*/g, "")
				);
			}
		};

		if (!this.chart.drawer.layoutDrawer) return;

		this.chart.drawer.layoutDrawer._formatValue = (
			number: number
		): string => {
			const hours = Math.floor(number / 60 / 60);
			return (
				hours + "h " + Math.round((number - hours * 60 * 60) / 60) + "m"
			);
		};

		this.update();
	}

	/**
	 * Updates element (for example on resize)
	 */
	public update(): void {
		if (!this.chart.drawer) return;

		this.chart.style = {};
		this.chart.update();
		if (this.chart.controller) {
			this.chart.controller.onupdate(0, 0.999999);
			(this.chart.controller.selector as HTMLElement).style.width =
				"calc(100% - 8px)";
		}
	}

	//#endregion

	//#region Private methods
	/**
	 * Converts user object to chart-library-compatable input object
	 * @param {User} user User object to extract data from
	 */
	private async convertData(user: User): Promise<IChartData> {
		//Device colors
		const colors = getComputedStyle(
			document.getElementsByClassName("page")[0]
		);
		//Template object
		const data: IChartData = {
			columns: [
				["x"],
				["y0"],
				["y1"],
				["y2"],
				["y3"],
				["y4"],
				["y5"],
				["y6"],
				["y7"]
			],
			types: {
				y0: "bar",
				y1: "bar",
				y2: "bar",
				y3: "bar",
				y4: "bar",
				y5: "bar",
				y6: "bar",
				y7: "bar",
				x: "x"
			},
			names: {
				y0: "Unknown",
				y1: "Mobile",
				y2: "iPhone",
				y3: "iPad",
				y4: "Android",
				y5: "WPhone",
				y6: "Windows",
				y7: "Web"
			},
			colors: {
				y0: colors.getPropertyValue("--color-unknown"),
				y1: colors.getPropertyValue("--color-mobile"),
				y2: colors.getPropertyValue("--color-iphone"),
				y3: colors.getPropertyValue("--color-ipad"),
				y4: colors.getPropertyValue("--color-android"),
				y5: colors.getPropertyValue("--color-wphone"),
				y6: colors.getPropertyValue("--color-windows"),
				y7: colors.getPropertyValue("--color-web")
			},
			stacked: true
		};

		//Scan days
		const total = [0, 0, 0, 0, 0, 0, 0, 0];
		const days = Object.values(user.days);
		for (let i = 0; i < days.length; i++) {
			const day = days[i];
			data.columns[0][i + 1] = +day.date;
			for (let j = 1; j < 9; j++) {
				const sum = day.sessions.reduce((a, b) => {
					return a + (b.platform == j - 1 ? b.length : 0);
				}, 0);

				data.columns[j][i + 1] = sum;
				total[j - 1] += sum;
			}
		}

		//Clear empty devices
		let offset = 0;
		for (let i = 0; i < total.length; i++) {
			if (total[i] == 0) {
				data.columns.splice(i + 1 - offset, 1);
				delete data.types["y" + i];
				delete data.names["y" + i];
				delete data.colors["y" + i];
				offset++;
			}
		}

		return data;
	}

	/**
	 * Renders the chart
	 */
	private render(): void {
		if (this.enabled && this.chart && this.chart.chartData) {
			if (this.backgroundlyResized) {
				this.update();
				this.backgroundlyResized = false;
			}
			this.chart.render();
		}

		requestAnimationFrame(() => {
			this.render();
		});
	}

	/**
	 * Registers all elements events
	 */
	private registerEvents(): void {
		//Save old sizes
		let width: number = window.innerWidth;
		let height: number = window.innerHeight;

		window.addEventListener("resize", () => {
			//Check if size has changed
			if (
				!this.chart ||
				!this.chart.chartData ||
				(window.innerWidth == width && window.innerHeight == height)
			) {
				return;
			}

			width = window.innerWidth;
			height = window.innerHeight;

			const containerSize = this.container.getClientRects()[0];

			if (containerSize) {
				this.update();
			} else if (!this.enabled) {
				this.backgroundlyResized = true;
			}
		});
		requestAnimationFrame(() => {
			this.render();
		});
	}
	//#endregion
}

interface IChartData {
	columns: (string | number)[][];
	types: { [column: string]: string };
	names: { [column: string]: string };
	colors: { [column: string]: string };
	stacked: boolean;
}
