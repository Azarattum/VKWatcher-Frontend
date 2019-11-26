/**
 * Represents a view component
 */
export default abstract class View {
	public readonly name: string;
	protected template: string | null;
	private windowLoaded: boolean;

	/**
	 * Creates new view component
	 * @param name The name of view
	 */
	public constructor(name: string, template: string | null = null) {
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
	public render(content: string | null = null): void {
		if (!this.windowLoaded) {
			this.template = content;
			return;
		}
		if (!content) {
			content = this.template;
		}
		if (!content) return;

		const container = document.querySelector(
			`[view=${this.name.toLowerCase()}]`
		);

		if (container) {
			container.innerHTML = content;
			this.template = null;
		} else {
			throw new Error(
				`Failed to render ${this.name} view. Container not found!`
			);
		}
	}
}
