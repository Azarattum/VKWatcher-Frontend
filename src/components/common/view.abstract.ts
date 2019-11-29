/**
 * Represents a view component
 */
export default abstract class View {
	public readonly name: string;
	protected template: Function | null;
	private windowLoaded: boolean;

	/**
	 * Creates new view component
	 * @param name The name of view
	 */
	public constructor(name: string, template: Function | null = null) {
		this.name = name;
		this.windowLoaded = document.readyState === "complete";
		this.template = template;

		if (this.windowLoaded) return;
		window.addEventListener("load", () => {
			this.windowLoaded = true;
			if (this.template) {
				this.render(this.template);
			}
		});
	}

	/**
	 * Renders the content to the view's container
	 * @param content View content
	 */
	public render(template: Function | null = null, args: {} = {}): void {
		if (!this.windowLoaded) {
			this.template = template;
			return;
		}
		if (!template) {
			template = this.template;
		}
		if (!args) {
			args = {};
		}
		if (!template) return;

		this.container.innerHTML = template(args);
		this.template = null;
	}

	public toggle(visible: boolean | null = null): void {
		if (visible == null) {
			if (this.container.style.display == "none") {
				visible = true;
			} else {
				visible = false;
			}
		}

		if (visible) {
			this.container.style.display = "block";
		} else {
			this.container.style.display = "none";
		}
	}

	private get container(): HTMLElement {
		const container = document.querySelector(
			`[view=${this.name.toLowerCase()}]`
		);

		if (!container) {
			throw new Error(`Container ${this.name} not found!`);
		}

		return container as HTMLElement;
	}
}
