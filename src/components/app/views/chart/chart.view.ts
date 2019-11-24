/**
 * View renderer
 */
((): void => {
	const viewName = "chart";
	require(`./${viewName}.scss`);
	const template = require(`./${viewName}.pug`);

	window.addEventListener("load", () => {
		const container = document.querySelector(`[view=${viewName}]`);
		if (container) {
			container.innerHTML = template();
		}
	});
})();
