import Slider from "../../vendor/slider/index.class.js";
import DateUtils from "../../common/date.class.js";
export default class Interface {
    static initialize(users) {
        this.emptyButton = document.getElementById("empty");
        this.deviceSelector = document.getElementById("device");
        //Users list
        const usersContainer = document.getElementById("users");
        if (usersContainer) {
            for (const i in users) {
                const user = users[i];
                usersContainer.innerHTML += `<div class="button user" onclick="changeUser(${i})">${user}</div>`;
            }
        }
        //Period selector
        this.periodSlider = new Slider(document.getElementById("period-slider"), {
            type: "double",
            dragInterval: true,
            grid: true,
            prettify: (value) => {
                let date = DateUtils.getDateFromGlobalDay(value).toString();
                date = date.split(" ")[1] + " " + date.split(" ")[2];
                return date;
            }
        });
        //Zoom selector
        this.zoomSlider = new Slider(document.getElementById("zoom-slider"), {
            min: 0.75,
            max: 16,
            step: 0.25,
            from: 1,
            onFinish: (state) => {
                this.call("zoomed", state.from);
            }
        });
        //Interface functions
        window.changeUser = (id, relative) => {
            this.call("userchanged", id, relative);
        };
        window.changeEmpty = (event) => {
            this.call("emptychanged", event.target.checked);
        };
        window.changeDevice = (id) => {
            this.call("devicechanged", id);
        };
        window.openProfile = (event) => {
            const id = event.target.textContent;
            const newWindow = window.open("https://vk.com/id" + id, "_blank");
            if (newWindow)
                newWindow.focus();
        };
    }
    static refresh(days, { from, to }, platform, empty, zoom = null) {
        //Update controls
        if (zoom) {
            this.zoomSlider.update({
                from: zoom
            });
        }
        this.emptyButton.checked = empty;
        this.deviceSelector.value = platform.toString();
        this.periodSlider.update({
            min: days[0],
            max: days[days.length - 1],
            from: from,
            to: to,
            onChange: data => {
                from = data.from - days[0] + 1;
                to = data.to - days[0] + 1;
                this.call("periodchanged", from, to, days[0]);
            }
        });
        from = from - days[0] + 1;
        to = to - days[0] + 1;
        //Call filter updates
        this.call("periodchanged", from, to, days[0]);
        this.call("devicechanged", platform);
        this.call("emptychanged", empty);
        if (zoom) {
            this.call("zoomed", zoom);
        }
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
Interface.callbacks = {};
//# sourceMappingURL=interface.service.js.map