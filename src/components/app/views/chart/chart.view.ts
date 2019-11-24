/**
 * View renderer
 */
import "./chart.scss";
import Template from "./chart.pug";

window.addEventListener("load", () => {
	const container = document.querySelector("[view=chart]");
	if (container) {
		container.innerHTML = Template();
	}
});
