import User from "../../models/user.class";
import Day from "../../models/day.class";

/**
 * Responsible for drawing the date
 */
export default class Drawer {
	public user: User | null;
	public drawSleep: boolean;
	private canvas: HTMLCanvasElement | OffscreenCanvas;
	private context:
		| OffscreenCanvasRenderingContext2D
		| CanvasRenderingContext2D;
	private styles: IDrawerStyle;
	private stylesCache: CSSStyleDeclaration;

	/**
	 * Creates a new drawer object
	 * @param {Element} canvas HTML Canvas element
	 * @param {User} user User object
	 */
	public constructor(
		canvas: HTMLCanvasElement | OffscreenCanvas,
		user: User | null = null
	) {
		const ctx = canvas.getContext("2d");

		if (!ctx) {
			throw new Error("Unable to get canvas context!");
		}

		this.drawSleep = false;
		this.canvas = canvas;
		this.context = ctx;
		this.user = user;
		this.stylesCache = {} as CSSStyleDeclaration;
		this.styles = { zoom: 1 } as IDrawerStyle;
		this.updateStyles();
	}

	//#region Public methods
	/**
	 * Renders everything
	 */
	public render(): void {
		if (this.user == null) return;

		this.context.clearRect(0, 0, this.viewport.width, this.viewport.height);
		this.drawTime(this.context);
		const days = this.user.getDays();
		if (Object.keys(days).length > 0) {
			this.drawData(this.context, days);
		}
	}

	/**
	 * Updates drawing styles
	 */
	public updateStyles(cssStyles: CSSStyleDeclaration | null = null): void {
		if (!cssStyles) {
			cssStyles = this.stylesCache;
		} else {
			this.stylesCache = cssStyles;
		}

		this.styles.column = {
			margin: 4
		};

		this.styles.date = {
			height: 48,
			font: cssStyles.fontFamily || "Arial",
			color: cssStyles.color || "black"
		};

		this.styles.time = {
			margin: this.viewport.height / this.styles.zoom / 96,
			left: 8,
			fontSize: (this.viewport.height / this.styles.zoom - 48) / 24,
			size: (this.viewport.height - this.styles.date.height) / 24,
			font: cssStyles.fontFamily || "Arial",
			color: cssStyles.color || "black"
		};
	}
	//#endregion

	//#region Properties
	/**
	 * Recalculates style according to a new zoom factor
	 * @param factor New vertical zooming factor
	 */
	public set zoom(factor: number) {
		this.styles.zoom = factor;
		this.updateStyles();
	}

	/**
	 * Updates device colors
	 * @param colors New color set
	 */
	public set colors(colors: string[]) {
		this.styles.colors = colors;
	}

	/**
	 * True viewport of canvas
	 */
	private get viewport(): { width: number; height: number } {
		return {
			width: this.canvas.width,
			height: this.canvas.height
		};
	}
	//#endregion

	//#region Private methods
	private drawData(
		ctx: CanvasRenderingContext2D | OffscreenCanvasRenderingContext2D,
		days: Day[]
	): void {
		//Define constants
		const left = this.styles.time.fontSize * 3;
		const margin = this.styles.column.margin;
		const width = (this.viewport.width - left) / days.length;
		const height = this.styles.date.height;
		const color = this.styles.date.color;
		const font = this.styles.date.font;
		const size = Math.min(
			height / 2.3,
			(this.viewport.width - left) / (days.length * 3.5)
		);
		const hour = (this.viewport.height - height) / 24;

		//Presetup canvas
		ctx.font = size + "px " + font;
		ctx.strokeStyle = "black";
		ctx.textAlign = "center";

		let inSleep = null;
		for (let i = 0; i < days.length; i++) {
			const day = days[i];
			//#region Date drawing
			//Format date
			const dateFull = day.date.toString().split(" ");
			const weekDay = dateFull[0];
			const date = dateFull[1] + " " + dateFull[2];

			//Render date
			if (days.length < this.viewport.width / 32) {
				ctx.fillStyle = color;
				ctx.fillText(
					weekDay,
					left + width * i + width / 2,
					this.viewport.height - size
				);
				ctx.fillText(
					date,
					left + width * i + width / 2,
					this.viewport.height
				);
			}
			//#endregion

			//#region Columns drawing
			const x = width * i + left + margin / 2;
			for (const session of day.sessions) {
				//Caculate coordinates
				const y =
					hour * session.from.getHours() +
					(hour / 60) * session.from.getMinutes() +
					(hour / 60 / 60) * session.from.getSeconds();

				let length =
					hour * ((+session.to - +session.from) / 1000 / 60 / 60);

				if (length < 1) length = 1;

				//Set styles and draw
				ctx.fillStyle = this.styles.colors[session.platform];
				ctx.fillRect(x, y, width - margin, length);
				//Shade sleep time if provided
				if (inSleep != null) {
					ctx.globalAlpha = 0.3;
					this.shadeRect(
						ctx,
						x,
						inSleep,
						width - margin,
						y - inSleep,
						0.15
					);
					ctx.globalAlpha = 1;
					inSleep = null;
				}

				if (this.drawSleep && session.inSleep) {
					inSleep = y + length;
				}
			}
			//#endregion

			if (inSleep != null) {
				ctx.globalAlpha = 0.3;
				this.shadeRect(
					ctx,
					x,
					inSleep,
					width - margin,
					this.viewport.height - height - inSleep,
					0.15
				);
				ctx.globalAlpha = 1;
				inSleep = 0;
			}
		}
	}

	private drawTime(
		ctx: CanvasRenderingContext2D | OffscreenCanvasRenderingContext2D
	): void {
		const margin = this.styles.time.margin;
		const fontSize = this.styles.time.fontSize;
		const size = this.styles.time.size;
		const color = this.styles.time.color;
		const font = this.styles.time.font;

		ctx.font = fontSize + "px " + font;
		ctx.fillStyle = color;
		ctx.textAlign = "left";
		for (let i = 0; i < 24; i++) {
			const time = (i.toString().length == 1 ? "0" : "") + i + ":00";
			ctx.fillText(time, margin, size * i + fontSize / 2.5 + size / 2);
			ctx.globalAlpha = 0.15;
			ctx.fillRect(0, size * i + size, this.viewport.width, 1);
			ctx.globalAlpha = 1.0;
		}
	}

	private shadeRect(
		ctx: CanvasRenderingContext2D | OffscreenCanvasRenderingContext2D,
		x = 0,
		y = 0,
		width = 0,
		height = 0,
		density = 0.1
	): void {
		const side = Math.max(width, height);
		const margin = 1 / density;
		const count = Math.ceil(side / margin) * 2;

		let [xMargin, yMargin] = [0, 0];
		let [xOffset, yOffset] = [0, 0];

		for (let i = 0; i < count; i++) {
			ctx.beginPath();
			ctx.moveTo(x + xOffset, y + yMargin);
			ctx.lineTo(x + xMargin, y + yOffset);
			ctx.stroke();

			xMargin += margin;
			yMargin += margin;
			if (xMargin > width) {
				yOffset += xMargin - width;
				if (yOffset > height) yOffset = height;
				xMargin = width;
			}
			if (yMargin > height) {
				xOffset += yMargin - height;
				if (xOffset > width) xOffset = width;
				yMargin = height;
			}
		}
	}
	//#endregion
}

interface IDrawerStyle {
	zoom: number;
	column: { margin: number };
	date: { height: number; font: string; color: string };
	time: {
		margin: number;
		left: number;
		fontSize: number;
		size: number;
		font: string;
		color: string;
	};
	colors: string[];
}
