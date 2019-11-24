/**
 * View renderer
 */
((): void => {
	const viewName = "filters";
	require(`./${viewName}.scss`);
	const template = require(`./${viewName}.pug`);

	window.addEventListener("load", () => {
		const container = document.querySelector(`[view=${viewName}]`);
		if (container) {
			container.innerHTML = template();
		}
	});
})();
