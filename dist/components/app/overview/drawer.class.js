/**
 * Responsible for drawing the date
 */
export default class Drawer {
    /**
     * Creates a new drawer object
     * @param {Element} canvas HTML Canvas element
     * @param {User} user User object
     */
    constructor(canvas, user = null) {
        const ctx = canvas.getContext("2d");
        if (!ctx) {
            throw new Error("Unable to get canvas context!");
        }
        this.canvas = canvas;
        this.context = ctx;
        this.user = user;
        this.updateRequested = true;
        this._styles = { zoom: 1 };
        window.addEventListener("resize", () => {
            this.canvas.width = this.viewport.width;
            this.canvas.height = this.viewport.height;
        });
    }
    //#region Public methods
    /**
     * Renders everything
     */
    render() {
        if (this.user == null)
            return;
        this.context.clearRect(0, 0, this.viewport.width, this.viewport.height);
        this.drawTime(this.context);
        const days = this.user.getDays();
        if (Object.keys(days).length > 0) {
            this.drawData(this.context, days);
        }
    }
    //#endregion
    //#region Properties
    /**
     * Recalculates style according to a new zoom factor
     * @param factor New vertical zooming factor
     */
    set zoom(factor) {
        this._styles.zoom = factor;
        this.updateRequested = true;
    }
    /**
     * Updates device colors
     * @param colors New color set
     */
    set colors(colors) {
        this.styles.colors = colors;
    }
    /**
     * True viewport of canvas
     */
    get viewport() {
        return {
            width: this.canvas.clientWidth * window.devicePixelRatio,
            height: this.canvas.clientHeight * window.devicePixelRatio
        };
    }
    /**
     * Drawing styles
     */
    get styles() {
        if (!this.updateRequested) {
            return this._styles;
        }
        const canvasStyle = window.getComputedStyle(this.canvas);
        this._styles.column = {
            margin: 4
        };
        this._styles.date = {
            height: 48,
            font: canvasStyle.fontFamily,
            color: canvasStyle.color || "black"
        };
        this._styles.time = {
            margin: this.viewport.height / this._styles.zoom / 96,
            left: 8,
            fontSize: (this.viewport.height / this._styles.zoom - 48) / 24,
            size: (this.viewport.height - this._styles.date.height) / 24,
            font: canvasStyle.fontFamily,
            color: canvasStyle.color || "black"
        };
        return this._styles;
    }
    //#endregion
    //#region Private methods
    drawData(ctx, days) {
        //Define constants
        const left = this.styles.time.fontSize * 3;
        const margin = this.styles.column.margin;
        const width = (this.viewport.width - left) / days.length;
        const height = this.styles.date.height;
        const color = this.styles.date.color;
        const font = this.styles.date.font;
        const size = Math.min(height / 2.3, (this.viewport.width - left) / (days.length * 3));
        const hour = (this.viewport.height - height) / 24;
        //Presetup canvas
        ctx.font = size + "px " + font;
        ctx.textAlign = "center";
        let inSleep = null;
        for (let i = 0; i < days.length; i++) {
            const day = days[i];
            //#region Date drawing
            //Format date
            const dateFull = day.date.toString().split(" ");
            const weekDay = dateFull[0];
            const date = dateFull[1] + " " + dateFull[2];
            //Render date
            ctx.fillStyle = color;
            ctx.fillText(weekDay, left + width * i + width / 2, this.viewport.height - size);
            ctx.fillText(date, left + width * i + width / 2, this.viewport.height);
            //#endregion
            //#region Columns drawing
            const x = width * i + left + margin / 2;
            for (const session of day.sessions) {
                //Caculate coordinates
                const y = hour * session.from.getHours() +
                    (hour / 60) * session.from.getMinutes() +
                    (hour / 60 / 60) * session.from.getSeconds();
                let length = hour * ((+session.to - +session.from) / 1000 / 60 / 60);
                if (length < 1)
                    length = 1;
                //Set styles and draw
                ctx.fillStyle = this.styles.colors[session.platform];
                ctx.fillRect(x, y, width - margin, length);
                //Shade sleep time if provided
                if (inSleep != null) {
                    ctx.globalAlpha = 0.3;
                    this.shadeRect(ctx, x, inSleep, width - margin, y - inSleep, 0.15);
                    ctx.globalAlpha = 1;
                    inSleep = null;
                }
                ///TEMP! Just for NN testing!
                if (session.inSleep) {
                    inSleep = y + length;
                    if (session.inSleep == 1) {
                        ctx.strokeStyle = "black";
                    }
                    else if (session.inSleep == 2) {
                        ctx.strokeStyle = "green";
                    }
                    else if (session.inSleep == 3) {
                        ctx.strokeStyle = "red";
                    }
                }
            }
            //#endregion
            if (inSleep != null) {
                ctx.globalAlpha = 0.3;
                this.shadeRect(ctx, x, inSleep, width - margin, this.viewport.height - height - inSleep, 0.15);
                ctx.globalAlpha = 1;
                inSleep = 0;
            }
        }
    }
    drawTime(ctx) {
        const margin = this.styles.time.margin;
        const fontSize = this.styles.time.fontSize;
        const size = this.styles.time.size;
        const color = this.styles.time.color;
        const font = this.styles.time.font;
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
    shadeRect(ctx, x = 0, y = 0, width = 0, height = 0, density = 0.1) {
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
//# sourceMappingURL=drawer.class.js.map