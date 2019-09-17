import Loader from "./components/common/loader.class.js";

const URLS = [
    "sessions.json",
    // "libs/charts/shaders/bar.fsh",
    // "libs/charts/shaders/bar.vsh",
    // "libs/charts/shaders/layout.fsh",
    // "libs/charts/shaders/layout.vsh"
];

window.addEventListener("load", async () => {
    const loader = new Loader(URLS);
    const data = await loader.load();

    console.log(data);
});