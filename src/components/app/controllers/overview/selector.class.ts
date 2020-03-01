import User from "../../models/user.class";
import DateUtils from "../../../common/date.class";
import Session, { Platforms } from "../../models/session.class";

/**
 * Responsible for handling all user controlls
 */
export default class Selector {
	public zoom: number;
	public user: User | null;
	public session: Session | null = null;
	private selected: Date | null;
	private canvas: HTMLCanvasElement;
	private styles: {
		dateHeight: number;
		columnMargin: number;
	};

	public constructor(canvas: HTMLCanvasElement, user: User | null = null) {
		this.selected = null;
		this.zoom = 1;
		this.user = user;
		this.canvas = canvas;
		this.styles = {
			dateHeight: 48,
			columnMargin: 4
		};

		//Intialize the controller
		this.registerLineSelection();
		this.registerSessionSelection();
	}

	private registerLineSelection(): void {
		const line = document.getElementById("overview-select");
		if (!line) {
			throw new Error("No #overview-select block found!");
		}
		const label = line.lastChild as HTMLElement;
		if (!label) {
			throw new Error("No container for time in #overview-select found!");
		}
		const oneDay = 24 * 60 * 60;

		const update = (eventArgs: MouseEvent | TouchEvent): void => {
			const y = (eventArgs as any).touches
				? (eventArgs as TouchEvent).touches[0].clientY -
				  this.canvas.getBoundingClientRect().top
				: (eventArgs as MouseEvent).offsetY;

			const time = Math.round(
				(y /
					((this.canvas.clientHeight -
						this.styles.dateHeight / devicePixelRatio) /
						oneDay)) *
					1000
			);

			if (
				time > oneDay * 1000 ||
				time < 0 ||
				eventArgs.type == "mouseleave" ||
				y === undefined
			) {
				line.style.top = "-1000px";
				this.selected = null;
			} else {
				const date = new Date(-25200000);
				date.setMilliseconds(time);
				this.selected = date;

				label.innerText = date.toTimeString().split(" ")[0];
				line.style.top = y + "px";
			}
		};

		//Setup canvas events
		this.canvas.addEventListener("mousemove", update, { passive: true });
		this.canvas.addEventListener("mouseleave", update, { passive: true });
		this.canvas.addEventListener("touchmove", update, { passive: true });
	}

	private registerSessionSelection(): void {
		const block = document.getElementById("overview-session");
		const dateLabel = document.getElementById("overview-session-date");
		const durationLabel = document.getElementById(
			"overview-session-duration"
		);
		const fromLabel = document.getElementById("overview-session-from");
		const toLabel = document.getElementById("overview-session-to");
		const platformLabel = document.getElementById(
			"overview-session-platform"
		);
		if (
			!block ||
			!dateLabel ||
			!durationLabel ||
			!fromLabel ||
			!toLabel ||
			!platformLabel
		) {
			throw new Error("Not every session selection container was found!");
		}
		const oneDay = 24 * 60 * 60;

		let isScrolling: boolean = false;
		let scrollingTimeout: number;
		const update = (eventArgs: MouseEvent | TouchEvent): void => {
			if (!this.user || isScrolling) return;

			//Calculate all values
			const left =
				(((this.canvas.clientHeight * devicePixelRatio) / this.zoom -
					48) /
					24) *
				3;
			const days = this.user.getDays();
			const x = (eventArgs as any).touches
				? (eventArgs as TouchEvent).touches[0].clientX -
				  this.canvas.getBoundingClientRect().left
				: (eventArgs as MouseEvent).offsetX;
			const column =
				(this.canvas.clientWidth - left / devicePixelRatio) /
				days.length;
			const dayIndex = Math.floor((x - left / devicePixelRatio) / column);
			const day = days[dayIndex];

			//Check values
			if (!this.selected || !day || dayIndex < 0 || days.length <= 0) {
				block.style.opacity = "0";
				this.session = null;
				return;
			}

			//Find session
			const date = DateUtils.combineDate(day.date, this.selected);
			const session = day.getSession(date, true);
			this.session = session;
			if (!session) {
				block.style.opacity = "0";
				return;
			}

			//Insert data to labels
			const dateParts = date.toString().split(" ");
			dateLabel.innerText =
				dateParts[0] + ", " + dateParts[1] + " " + dateParts[2];
			durationLabel.innerText = DateUtils.getReadableDuration(
				session.length
			);
			fromLabel.innerText = session.from.toTimeString().split(" ")[0];
			toLabel.innerText = session.to.toTimeString().split(" ")[0];
			platformLabel.innerText = Platforms[session.platform];

			//Calculate block position
			let leftPos =
				this.styles.columnMargin +
				left / devicePixelRatio +
				column * (dayIndex + 1);
			if (dayIndex >= days.length / 2 - 1) {
				leftPos -= block.clientWidth + column;
			}

			let topPos =
				(this.canvas.clientHeight -
					this.styles.dateHeight / devicePixelRatio) /
				oneDay;
			if (
				(session.from.getHours() > 13 &&
					this.canvas.clientWidth >= 600) ||
				(session.from.getHours() <= 13 && this.canvas.clientWidth < 600)
			) {
				topPos *=
					session.to.getSeconds() +
					session.to.getMinutes() * 60 +
					session.to.getHours() * 60 * 60;
				if (this.canvas.clientWidth >= 600) {
					topPos -= block.clientHeight;
				}
			} else {
				topPos *=
					session.from.getSeconds() +
					session.from.getMinutes() * 60 +
					session.from.getHours() * 60 * 60;
				if (this.canvas.clientWidth < 600) {
					topPos -= block.clientHeight;
				}
			}
			topPos += 4;
			//Mobile positioning
			if (this.canvas.clientWidth < 600 || leftPos < 0) {
				leftPos =
					this.canvas.clientWidth / 2 - block.clientWidth / 2 + 16;
			}

			block.style.opacity = this.canvas.clientWidth >= 600 ? "1" : "0.8";
			block.style.left = leftPos + "px";
			block.style.top = topPos + "px";
		};

		//Setup canvas events
		this.canvas.addEventListener("mousemove", update, { passive: true });
		this.canvas.addEventListener("mouseleave", update, { passive: true });
		this.canvas.addEventListener("touchmove", update, { passive: true });
		window.addEventListener("scroll", () => {
			isScrolling = true;
			this.session = null;
			block.style.opacity = "0";

			window.clearTimeout(scrollingTimeout);
			scrollingTimeout = window.setTimeout(() => {
				isScrolling = false;
			}, 200);
		});
	}
}
