import Loader from "./components/common/loader.class.js";
import Users from "./components/app/services/users.service.js";
const URLS = [
    "sessions.json",
];
window.addEventListener("load", async () => {
    const loader = new Loader(URLS);
    const data = await loader.load();
    Users.initialize(data[0]);
    console.log(Users.data);
});
//# sourceMappingURL=index.include.js.map