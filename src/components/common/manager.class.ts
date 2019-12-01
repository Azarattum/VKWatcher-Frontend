import Utils, { LogType } from "./utils.class";
import View from "./view.abstract";

/**
 * Component manager for IInitializables
 */
export default class Manager {
	/**Whether to log out initialization status */
	public logging: boolean = true;
	/**Managed components */
	public readonly components: IComponent[];
	/**Managed views */
	public readonly views: View[];

	/**
	 * Creates a component manager
	 * @param components Components to manage
	 */
	public constructor(components: IComponent[], views: View[] = []) {
		this.components = components;
		this.views = views;
	}

	/**
	 * Initializes all components
	 */
	public async initialize(
		componentArgs: any[][] | { [component: string]: any[] } = [],
		viewArgs: {}[] | { [view: string]: {} } = []
	): Promise<void> {
		let exceptions = 0;
		if (this.logging) Utils.log("Initializtion started...");
		//Render all views
		if (this.logging) Utils.log("Views", LogType.DIVIDER);
		for (const i in this.views) {
			const view = this.views[i];
			try {
				const args = Array.isArray(viewArgs)
					? viewArgs[i]
					: viewArgs[view.name];

				if (args) {
					await view.render(null, args);
				} else {
					await view.render();
				}
				if (this.logging) {
					Utils.log(`${view.name} rendered!`, LogType.OK);
				}
			} catch (exception) {
				if (this.logging) {
					Utils.log(
						`${view.name} render exception:\n\t` +
							`${exception.stack.replace(/\n/g, "\n\t")}`,
						LogType.ERROR
					);
				}
				exceptions++;
			}
		}

		//Initialize all components
		if (this.logging) Utils.log("Components", LogType.DIVIDER);
		for (const i in this.components) {
			const component = this.components[i];
			try {
				const args = Array.isArray(componentArgs)
					? componentArgs[i]
					: componentArgs[component.name];

				if (args) {
					await component.initialize(...args);
				} else {
					await component.initialize();
				}
				if (this.logging) {
					Utils.log(`${component.name} initialized!`, LogType.OK);
				}
			} catch (exception) {
				if (this.logging) {
					Utils.log(
						`${component.name} initialization exception:\n\t` +
							`${exception.stack.replace(/\n/g, "\n\t")}`,
						LogType.ERROR
					);
				}
				exceptions++;
			}
		}

		//Log result
		if (!this.logging) return;
		Utils.log("", LogType.DIVIDER);
		if (exceptions) {
			Utils.log(
				`Initialization completed with ${exceptions} exceptions!`,
				LogType.WARNING
			);
		} else {
			Utils.log("Successfyly initialized!", LogType.OK);
		}
	}

	/**
	 * Returs a managed component by its name
	 * @param name Component's name
	 */
	public getComponent(name: string): IComponent | null {
		return (
			this.components.find(
				component => component.name.toLowerCase() == name.toLowerCase()
			) || null
		);
	}

	/**
	 * Returs a managed component by its name
	 * @param name Component's name
	 */
	public getView(name: string): View | null {
		return (
			this.views.find(
				view => view.name.toLowerCase() == name.toLowerCase()
			) || null
		);
	}
}

/**
 * Interface of an initializable class
 */
export interface IComponent {
	/**Initializable name */
	name: string;

	/**Initializable entry */
	initialize(...args: any[]): void;
}
