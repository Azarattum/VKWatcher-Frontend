import Slider from "../../vendor/slider/index.class.js";
import DateUtils from "../../common/utils.class.js";
export default class Interface {
    static initialize(users) {
        const sender = this;
        const usersContainer = document.getElementById("users");
        if (usersContainer) {
            for (const i in users) {
                const user = users[i];
                usersContainer.innerHTML +=
                    `<div class="button user" onclick="changeUser(${i})">${user}</div>`;
            }
        }
        //Period selector
        this.periodSlider = new Slider(document.getElementById("period-slider"), {
            type: "double",
            drag_interval: true,
            grid: true,
            prettify: (value) => {
                let date = DateUtils.getDateFromGlobalDay(value).toString();
                date = date.split(' ')[1] + " " + date.split(' ')[2];
                return date;
            }
        });
        //Zoom selector
        this.zoomSlider = new Slider(document.getElementById("zoom-slider"), {
            min: 0.75,
            max: 16,
            step: 0.25,
            from: 1,
            onFinish: function (state) {
                sender.call("zoomed", state.from);
                document.getElementsByClassName("page")[0]
                    .style.setProperty("--vertical-zoom", state.from.toString());
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
            const newWindow = window.open("https://vk.com/id" + id, '_blank');
            if (newWindow)
                newWindow.focus();
        };
    }
    static refresh(days, { from, to }) {
        const sender = this;
        this.periodSlider.update({
            min: days[0],
            max: days[days.length - 1],
            from: from,
            to: to,
            onChange: function (data) {
                from = data.from - days[0] + 1;
                to = data.to - days[0] + 1;
                sender.call("periodchanged", from, to, days[0]);
            }
        });
        from = from - days[0] + 1;
        to = to - days[0] + 1;
        this.call("periodchanged", from, to, days[0]);
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