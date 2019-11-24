/**
 * View renderer
 */
((): void => {
	const viewName = "overview";
	require(`./${viewName}.scss`);
	const template = require(`./${viewName}.pug`);

	window.addEventListener("load", () => {
		const container = document.querySelector(`[view=${viewName}]`);
		if (container) {
			container.innerHTML = template();
		}
	});
})();
