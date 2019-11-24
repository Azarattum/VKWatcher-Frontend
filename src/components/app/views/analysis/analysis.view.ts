/**
 * View renderer
 */
import "./analysis.scss";
import Template from "./analysis.pug";

window.addEventListener("load", () => {
	const container = document.querySelector("[view=analysis]");
	if (container) {
		container.innerHTML = Template();
	}
});
