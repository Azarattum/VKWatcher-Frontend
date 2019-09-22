/**
 * Responsible for drawing the date
 */
export default class Drawer {
    /**
     * Creates a new drawer object
     * @param {Element} canvas HTML Canvas element
     * @param {User} user User object
     */
    constructor(canvas, user) {
        //#region Fields
        this.canvas = canvas;
        this.context = canvas.getContext("2d");
        this.user = user;
        //#endregion
        this.update();
    }
    //#region Public methods
    /**
     * Updates viewing params, such as viewport size
     */
    update() {
        this.viewport = {
            width: this.canvas.clientWidth * window.devicePixelRatio,
            height: this.canvas.clientHeight * window.devicePixelRatio
        };
        this.date = this._initDate();
        this.time = this._initTime();
        this.column = this._initColumn();
        this.canvas.width = this.viewport.width;
        this.canvas.height = this.viewport.height;
    }
    /**
     * Renders everything
     */
    render() {
        const ctx = this.context;
        ctx.clearRect(0, 0, this.viewport.width, this.viewport.height);
        this._drawTimes(ctx);
        if (Object.keys(this.user.days).length > 0) {
            this._drawData(ctx);
        }
    }
    //#endregion
    //#region Private methods
    //Initializaion
    _initColumn() {
        return {
            margin: 4
        };
    }
    _initDate() {
        const canvasStyle = window.getComputedStyle(this.canvas);
        return {
            height: 48,
            font: canvasStyle.fontFamily,
            color: canvasStyle.color
        };
    }
    _initTime() {
        const pageStyle = window.getComputedStyle(document.getElementsByClassName("page")[0]);
        const canvasStyle = window.getComputedStyle(this.canvas);
        return {
            margin: this.viewport.height / pageStyle.getPropertyValue("--vertical-zoom") / 96,
            left: 8,
            fontSize: (this.viewport.height / pageStyle.getPropertyValue("--vertical-zoom") - this.date.height) / 24,
            size: (this.viewport.height - this.date.height) / 24,
            font: canvasStyle.fontFamily,
            color: canvasStyle.color
        };
    }
    //Drawing
    _drawData(ctx) {
        //Define constants
        const days = this.user.getDays();
        const left = this.time.fontSize * 3;
        const margin = this.column.margin;
        const width = (this.viewport.width - left) / days.length;
        const height = this.date.height;
        const color = this.date.color;
        const font = this.date.font;
        const size = Math.min(height / 2.3, (this.viewport.width - left) / (days.length * 3));
        const hour = ((this.viewport.height - height) / 24);
        const styles = window.getComputedStyle(document.getElementsByClassName("page")[0]);
        //Presetup canvas
        ctx.font = size + "px " + font;
        ctx.textAlign = "center";
        let inSleep = null;
        for (let i = 0; i < days.length; i++) {
            const day = days[i];
            //#region Date drawing
            //Format text
            let date = day.date.toString().split(" ");
            let weekDay = date[0];
            date = date[1] + " " + date[2];
            //Render date
            ctx.fillStyle = color;
            ctx.fillText(weekDay, left + width * i + width / 2, this.viewport.height - size);
            ctx.fillText(date, left + width * i + width / 2, this.viewport.height);
            //#endregion
            //#region Columns drawing
            const x = (width * i) + left + (margin / 2);
            for (const session of day.sessions) {
                //Caculate coordinates
                const y = hour * session.from.getHours() +
                    hour / 60 * session.from.getMinutes() +
                    (hour / 60 / 60) * session.from.getSeconds();
                let length = hour *
                    ((session.to - session.from) / 1000 / 60 / 60);
                if (length < 1)
                    length = 1;
                ctx.fillStyle = styles.getPropertyValue("--color-" + session.device);
                ctx.fillRect(x, y, width - margin, length);
                if (inSleep != null) {
                    ctx.globalAlpha = 0.3;
                    this._shadeRect(ctx, x, inSleep, width - margin, y - inSleep, 0.15);
                    ctx.globalAlpha = 1;
                    inSleep = null;
                }
                if (session.inSleep) {
                    inSleep = y + length;
                    if (session.inSleep === 1) {
                        ctx.strokeStyle = "black";
                    }
                    else if (session.inSleep === 2) {
                        ctx.strokeStyle = "green";
                    }
                    else if (session.inSleep === 3) {
                        ctx.strokeStyle = "red";
                    }
                }
            }
            //#endregion
            if (inSleep != null) {
                ctx.globalAlpha = 0.3;
                this._shadeRect(ctx, x, inSleep, width - margin, (this.viewport.height - height) - inSleep, 0.15);
                ctx.globalAlpha = 1;
                inSleep = 0;
            }
        }
    }
    _drawTimes(ctx) {
        const margin = this.time.margin;
        const fontSize = this.time.fontSize;
        const size = this.time.size;
        const color = this.time.color;
        const font = this.time.font;
        ctx.font = fontSize + "px " + font;
        ctx.fillStyle = color;
        ctx.textAlign = "left";
        for (let i = 0; i < 24; i++) {
            const time = (i.toString().length == 1 ? "0" : "") + i + ":00";
            ctx.fillText(time, margin, size * i + fontSize / 2.5 + size / 2);
            ctx.globalAlpha = 0.15;
            ctx.fillRect(0, size * i + size, this.viewport.width, 1);
            ctx.globalAlpha = 1.0;
        }
    }
    _shadeRect(ctx, x, y, width, height, density = 0.1) {
        const side = Math.max(width, height);
        const margin = 1 / density;
        const count = Math.ceil(side / margin) * 2;
        let [xMargin, yMargin] = [0, 0];
        let [xOffset, yOffset] = [0, 0];
        for (let i = 0; i < count; i++) {
            ctx.beginPath();
            ctx.moveTo(x + xOffset, y + yMargin);
            ctx.lineTo(x + xMargin, y + yOffset);
            ctx.stroke();
            xMargin += margin;
            yMargin += margin;
            if (xMargin > width) {
                yOffset += xMargin - width;
                if (yOffset > height)
                    yOffset = height;
                xMargin = width;
            }
            if (yMargin > height) {
                xOffset += yMargin - height;
                if (xOffset > width)
                    xOffset = width;
                yMargin = height;
            }
        }
    }
}
//# sourceMappingURL=drawer.cls.js.map