/**
 * View renderer
 */
import "./filters.scss";
import Template from "./filters.pug";

window.addEventListener("load", () => {
	const container = document.querySelector("[view=filters]");
	if (container) {
		container.innerHTML = Template();
	}
});
