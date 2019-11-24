/**Page Styles */
import "./index.scss";
/**Main Script */
import App from "./components/app/app";
/**Views */
import "./components/app/views/filters/filters.view";
import "./components/app/views/overview/overview.view";
import "./components/app/views/chart/chart.view";
import "./components/app/views/analysis/analysis.view";

const app = new App();
window.addEventListener("load", async () => {
	await app.initialize();
});
