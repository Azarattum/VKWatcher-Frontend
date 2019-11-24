/**
 * View renderer
 */
import "./overview.scss";
import Template from "./overview.pug";

window.addEventListener("load", () => {
	const container = document.querySelector("[view=overview]");
	if (container) {
		container.innerHTML = Template();
	}
});
