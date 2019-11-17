import DateUtils from "../data/utils.cls.js";
/**
 * Responsible for handling all user controlls
 */
export default class Controller {
    constructor(drawer) {
        //#region Fields
        this.drawer = drawer;
        this.canvas = drawer.canvas;
        this.user = drawer.user;
        this.time = null;
        //#endregion
        //Intialize the controller
        this._initLineSelection();
        this._initSessionSelection();
    }
    //#region Private methods
    //Initialization
    _initLineSelection() {
        //Setup canvas events
        this.canvas.addEventListener("mousemove", update);
        this.canvas.addEventListener("mouseleave", update);
        this.canvas.addEventListener("touchmove", update);
        const selectionBlock = document.getElementsByClassName("select")[0];
        const selectionTime = document.getElementsByClassName("time")[0];
        const controller = this;
        const drawer = this.drawer;
        const height = this.drawer.date.height;
        const oneDay = 24 * 60 * 60;
        function update(eventArgs) {
            const y = eventArgs.offsetY;
            let time = Math.round(y / ((drawer.viewport.height - height) / window.devicePixelRatio / oneDay) * 1000);
            if (time > (oneDay * 1000) || time < 0 || eventArgs.type == "mouseleave" || y === undefined) {
                selectionBlock.style.top = "-1000px";
                controller.time = null;
            }
            else {
                let date = new Date(-25200000);
                date.setMilliseconds(time);
                controller.time = date;
                selectionTime.innerText = date.toTimeString().split(' ')[0];
                selectionBlock.style.top = y + "px";
            }
        }
    }
    _initSessionSelection() {
        //Setup canvas events
        this.canvas.addEventListener("mousemove", update);
        this.canvas.addEventListener("mouseleave", update);
        this.canvas.addEventListener("touchmove", update);
        const sessionBlock = document.getElementsByClassName("session")[0];
        const sessionDate = document.getElementById("session-date");
        const sessionDuration = document.getElementById("session-duration");
        const sessionFrom = document.getElementById("session-from");
        const sessionTo = document.getElementById("session-to");
        const sessionDevice = document.getElementById("session-device");
        const controller = this;
        const drawer = this.drawer;
        const margin = drawer.column.margin;
        const height = this.drawer.date.height;
        const oneDay = 24 * 60 * 60;
        function update(eventArgs) {
            const left = drawer.time.fontSize * 3;
            const days = drawer.user.getDays();
            const x = eventArgs.offsetX;
            const column = (drawer.viewport.width - left) / days.length / window.devicePixelRatio;
            const dayIndex = Math.floor((x - (left / window.devicePixelRatio)) / column);
            if (controller.time === null || dayIndex < 0 || days.length <= 0) {
                sessionBlock.style.opacity = 0;
                return;
            }
            const day = days[dayIndex];
            if (day === undefined) {
                sessionBlock.style.opacity = 0;
                return;
            }
            const date = DateUtils.combineDate(day.date, controller.time);
            const session = day.getSession(date, true);
            if (session === null) {
                sessionBlock.style.opacity = 0;
                return;
            }
            const dateParts = date.toString().split(' ');
            sessionDate.innerText = dateParts[0] + ", " + dateParts[1] + " " + dateParts[2];
            sessionDuration.innerText = DateUtils.getReadableDuration(session.length);
            sessionFrom.innerText = session.from.toTimeString().split(' ')[0];
            sessionTo.innerText = session.to.toTimeString().split(' ')[0];
            sessionDevice.innerText = session.device;
            let leftPos = (margin + left / window.devicePixelRatio + column * (dayIndex + 1));
            if (dayIndex >= (days.length / 2 - 1)) {
                leftPos -= sessionBlock.clientWidth + column;
            }
            let topPos = ((drawer.viewport.height - height) / oneDay / window.devicePixelRatio);
            if ((session.from.getHours() > 13 && drawer.canvas.clientWidth >= 600) ||
                session.from.getHours() <= 13 && drawer.canvas.clientWidth < 600) {
                topPos *= (session.to.getSeconds() +
                    session.to.getMinutes() * 60 +
                    session.to.getHours() * 60 * 60);
                if (drawer.canvas.clientWidth >= 600) {
                    topPos -= sessionBlock.clientHeight;
                }
            }
            else {
                topPos *= (session.from.getSeconds() +
                    session.from.getMinutes() * 60 +
                    session.from.getHours() * 60 * 60);
                if (drawer.canvas.clientWidth < 600) {
                    topPos -= sessionBlock.clientHeight;
                }
            }
            topPos += 4;
            if (drawer.canvas.clientWidth < 600) {
                leftPos = drawer.canvas.clientWidth / 2 - sessionBlock.clientWidth / 2 + 16;
            }
            sessionBlock.style.opacity = (drawer.canvas.clientWidth >= 600) ? 1 : 0.8;
            sessionBlock.style.left = leftPos + "px";
            sessionBlock.style.top = topPos + "px";
            controller.lastSession = session;
        }
    }
}
//# sourceMappingURL=controller.cls.js.map