import Loader from "./components/common/loader.class.js";
import Users from "./components/app/services/users.service.js";
import Hash from "./components/common/hash.class.js";
import Interface from "./components/app/services/interface.service.js";
window.addEventListener("load", async () => {
    const loader = new Loader(["sessions.json"]);
    const data = await loader.load();
    Users.initialize(data[0]);
    Users.addEventListener("userchanged", () => {
        const days = Object.keys(Users.selected.days).map(x => +x);
        const period = Users.selected.getFilter("period");
        Interface.refresh(days, period);
    });
    const defaults = {
        user: 0,
        zoom: 1,
        period: "1-" +
            Object.values(Users.selected.days).length,
        device: -1,
        empty: true,
        tab: "overview"
    };
    Hash.initialize(defaults);
    Interface.initialize(Users.data.map(x => x.name));
    Interface.addEventListener("userchanged", (id, relative) => {
        Users.select(id, relative);
        Hash.set("user", Users.selectedId);
    });
    Interface.addEventListener("periodchanged", (from, to, offset) => {
        Hash.set("period", from + "-" + to);
    });
    Interface.addEventListener("zoomed", (factor) => {
        Hash.set("zoom", factor);
    });
    Interface.addEventListener("devicechanged", (id) => {
        Hash.set("device", id);
    });
    Interface.addEventListener("emptychanged", (value) => {
        Hash.set("empty", value);
    });
    Users.call("userchanged");
});
//# sourceMappingURL=index.include.js.map