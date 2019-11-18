import Drawer from "./drawer.class.js";
import { Platforms } from "../data/session.class.js";
export default class Overview {
    static initialize() {
        this.drawer = new Drawer(document.getElementById("overview-render"), this.user);
        const styles = window.getComputedStyle(document.getElementsByClassName("page")[0]);
        const colors = [];
        for (const platform in Platforms) {
            colors[platform] = styles.getPropertyValue("--color-" + Platforms[platform]);
        }
        this.drawer.colors = colors;
        if (this.zoom) {
            this.drawer.zoom = this.zoom;
        }
    }
    static setUser(user) {
        if (!this.drawer) {
            this.user = user;
            return;
        }
        this.drawer.user = user;
        this.drawer.render();
        console.log(this.drawer);
    }
    static setZoom(factor) {
        if (!this.drawer) {
            this.zoom = factor;
            return;
        }
        this.drawer.zoom = factor;
    }
    static addEventListener(type, callback) {
        if (!(type in this.callbacks))
            this.callbacks[type] = [];
        this.callbacks[type].push(callback);
    }
    static call(type, ...args) {
        if (this.callbacks[type]) {
            this.callbacks[type].map(x => x.call(x, ...args));
        }
    }
}
Overview.callbacks = {};
Overview.drawer = null;
Overview.user = null;
Overview.zoom = null;
//# sourceMappingURL=overview.service.js.map