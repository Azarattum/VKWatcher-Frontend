import Slider from "../../vendor/slider/index.class.js";
import DateUtils from "../../common/utils.class.js";

export default class Interface {
    private static callbacks: { [type: string]: Function[]; } = {};

    private static periodSlider: Slider;
    private static zoomSlider: Slider;

    public static initialize(users: string[]): void {
        const sender = this;
        const usersContainer = document.getElementById("users");
        if (usersContainer) {
            for (const i in users) {
                const user: string = users[i];
                usersContainer.innerHTML +=
                    `<div class="button user" onclick="changeUser(${i})">${user}</div>`;
            }
        }

        //Period selector
        this.periodSlider = new Slider(
            document.getElementById("period-slider"),
            {
                type: "double",
                drag_interval: true,
                grid: true,
                prettify: (value: number) => {
                    let date = DateUtils.getDateFromGlobalDay(value).toString();
                    date = date.split(' ')[1] + " " + date.split(' ')[2];
                    return date;
                }
            }
        );

        //Zoom selector
        this.zoomSlider = new Slider(
            document.getElementById("zoom-slider"),
            {
                min: 0.75,
                max: 16,
                step: 0.25,
                from: 1,
                onFinish: function (state) {
                    sender.call("zoomed", state.from);
                    (document.getElementsByClassName("page")[0] as HTMLElement)
                        .style.setProperty("--vertical-zoom", state.from.toString());
                }
            }
        );

        //Interface functions
        (<any>window).changeUser = (id: number, relative: boolean) => {
            this.call("userchanged", id, relative);
        }

        (<any>window).changeEmpty = (event: MouseEvent) => {
            this.call("emptychanged", (event.target as HTMLInputElement).checked);
        }

        (<any>window).changeDevice = (id: number) => {
            this.call("devicechanged", id);
        }
    }

    public static refresh(days: number[], { from, to }: { from: number, to: number }): void {
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

    public static addEventListener(type: "zoomed" | "userchanged" | "periodchanged" | "emptychanged" | "devicechanged", callback: Function): void {
        if (!(type in this.callbacks)) this.callbacks[type] = [];
        this.callbacks[type].push(callback);
    }

    public static call(type: "zoomed" | "userchanged" | "periodchanged" | "emptychanged" | "devicechanged", ...args: any[]) {
        if (this.callbacks[type]) {
            this.callbacks[type].map(x => x.call(x, ...args));
        }
    }
}