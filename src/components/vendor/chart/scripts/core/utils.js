export class Color {
    constructor(param1, param2, param3, param4) {
        this.color = {
            r: 0,
            g: 0,
            b: 0,
            a: 255
        };

        if (param1 instanceof Color) {
            this.color.r = param1.r;
            this.color.g = param1.g;
            this.color.b = param1.b;
            this.color.a = param1.a;
            return;
        }

        if (param1 === undefined) {
            return;
        }

        if (Number.isFinite(param1) && Number.isFinite(param2) &&
            Number.isFinite(param3)) {
            this.r = param1;
            this.g = param2;
            this.b = param3;
            if (Number.isFinite(param4)) {
                this.a = param4;
            } else {
                this.a = 255;
            }
            return;
        }

        let colors;
        try {
            colors = param1.match(/^#?([0-9a-f]{3}[0-9a-f]?);?$/i)[1];
            if (colors) {
                this.r = parseInt(colors.charAt(0), 16) * 0x11;
                this.g = parseInt(colors.charAt(1), 16) * 0x11;
                this.b = parseInt(colors.charAt(2), 16) * 0x11;
                if (colors.charAt(3)) {
                    this.a = parseInt(colors.charAt(3), 16) * 0x11;
                } else {
                    this.a = 255;
                }
                return;
            }
        } catch {}

        try {
            colors = param1.match(/^#?([0-9a-f]{6}([0-9a-f]{2})?);?$/i)[1];
            if (colors) {
                this.r = parseInt(colors.substr(0, 2), 16);
                this.g = parseInt(colors.substr(2, 2), 16);
                this.b = parseInt(colors.substr(4, 2), 16);
                if (colors.substr(6, 2)) {
                    this.a = parseInt(colors.substr(6, 2), 16);
                } else {
                    this.a = 255;
                }
                return;
            }
        } catch {}

        try {
            colors = param1.match(/^\s*rgba?\s*\(\s*(\d+)\s*,\s*(\d+)\s*,\s*(\d+)\s*(,\s*(\d+)\s*)?\);?$/i);
            if (colors) {
                this.r = colors[1];
                this.g = colors[2];
                this.b = colors[3];
                if (colors[5]) {
                    this.a = colors[5];
                } else {
                    this.a = 255;
                }
                return;
            }
        } catch {}

        try {
            colors = param1.match(/^\s*(\d+)\s*,\s*(\d+)\s*,\s*(\d+)\s*(,\s*(\d+)\s*)?;?$/i);
            if (colors) {
                this.r = colors[1];
                this.g = colors[2];
                this.b = colors[3];
                if (colors[5]) {
                    this.a = colors[5];
                } else {
                    this.a = 255;
                }
                return;
            }
        } catch {}
    }

    get r() {
        return this.color.r;
    }

    set r(value) {
        this.color.r = this.normalize(value);
    }

    get g() {
        return this.color.g;
    }

    set g(value) {
        this.color.g = this.normalize(value);
    }

    get b() {
        return this.color.b;
    }

    set b(value) {
        this.color.b = this.normalize(value);
    }

    get a() {
        return this.color.a;
    }

    set a(value) {
        this.color.a = this.normalize(value);
    }

    red(value) {
        let color = new Color(this);
        color.r = value;
        return color;
    }

    green(value) {
        let color = new Color(this);
        color.g = value;
        return color;
    }

    blue(value) {
        let color = new Color(this);
        color.b = value;
        return color;
    }

    alpha(value) {
        let color = new Color(this);
        color.a = value;
        return color;
    }

    normalize(value) {
        if (+value > 255)
            return 255;
        else if (+value < 0)
            return 0;
        else
            return Math.round(+value);
    }

    toString() {
        return "rgba(" + this.r + "," + this.g + "," + this.b + "," + (this.a / 255) + ")";
    }

    toHex() {
        function toHex(number) {
            const hex = number.toString(16);
            return hex.length == 1 ? "0" + hex : hex;
        }

        return "#" + toHex(this.r) + toHex(this.g) + toHex(this.b) + toHex(this.a);
    }

    toArray(includeAlpha = true) {
        if (!includeAlpha) {
            return new Float32Array([this.r / 255., this.g / 255., this.b / 255.]);
        } else {
            return new Float32Array([this.r / 255., this.g / 255., this.b / 255., this.a / 255.]);
        }
    }
}

export class Point {
    constructor(x = 0, y = 0) {
        this.position = {
            x: x,
            y: y
        };
    }

    get x() {
        return this.position.x;
    }

    set x(value) {
        this.position.x = value;
    }

    get y() {
        return this.position.y;
    }

    set y(value) {
        this.position.y = value;
    }

    normal() {
        return new Point(-this.y, this.x);
    }

    invert() {
        return new Point(-this.x, -this.y);
    }

    normalize() {
        let length = this.length;
        return new Point(this.x / length, this.y / length);
    }

    expand(value) {
        return new Point(this.x * value, this.y * value);
    }

    add(point) {
        return new Point(this.x + point.x, this.y + point.y);
    }

    subtract(point) {
        return new Point(this.x - point.x, this.y - point.y);
    }

    dot(point) {
        return this.x * point.x + this.y * point.y;
    }

    get length() {
        return Math.sqrt(this.x * this.x + this.y * this.y);
    }

    toString() {
        return this.x + "," + this.y;
    }
}

export class AnimationObject {
    /**
     * Creates an object for animating properties.
     * @param {Number} startProperty Property value at the start of the animation.
     * @param {Number} endProperty Property value at the end of the animation.
     * @param {Number} duration How long the animation will be in milliseconds.
     */
    constructor(startProperty, endProperty = startProperty, duration = 0) {
        this.startTime = Date.now();
        this.duration = duration;
        this.startProperty = startProperty;
        this.endProperty = endProperty;
        this.modified = false;
    }

    /**
     * Sets new animation goal from the current state.
     * @param {Number} endProperty New end property value.
     * @param {Number} duration How long the animation will be in milliseconds.
     */
    set(endProperty, duration = this.duration) {
        const currentProperty = this.get();
        if (endProperty.toString() == currentProperty.toString() ||
            endProperty.toString() == this.endProperty.toString()) {
            return;
        }

        this.startProperty = currentProperty;
        this.startTime = Date.now();
        this.duration = duration;
        this.endProperty = endProperty;
        this.modified = true;
    }

    /**
     * Returns the property value based on the past time.
     */
    get() {
        let timePast = Date.now() - this.startTime;
        if (timePast >= this.duration) return this.endProperty;

        if (typeof this.startProperty == "number") {
            return this.interpolate(this.startProperty, this.endProperty, (timePast / this.duration));
        } else if (Array.isArray(this.startProperty)) {
            const progress = (timePast / this.duration);
            let animated = [];
            for (let i = 0; i < this.startProperty.length; i++) {
                animated.push(
                    this.interpolate(this.startProperty[i], this.endProperty[i], progress)
                );
            }
            return animated;
        } else if (this.startProperty instanceof Color) {
            const progress = (timePast / this.duration);
            return new Color(
                this.interpolate(this.startProperty.r, this.endProperty.r, progress),
                this.interpolate(this.startProperty.g, this.endProperty.g, progress),
                this.interpolate(this.startProperty.b, this.endProperty.b, progress),
                this.interpolate(this.startProperty.a, this.endProperty.a, progress)
            );
        } else if (this.startProperty instanceof Point) {
            const progress = (timePast / this.duration);
            return new Point(
                this.interpolate(this.startProperty.x, this.endProperty.x, progress),
                this.interpolate(this.startProperty.y, this.endProperty.y, progress)
            );
        }
    }

    interpolate(min, max, progress) {
        return min + (progress * (max - min));
    }

    /**
     * Returns whether animation is in progress or not.
     */
    get inProgress() {
        if ((Date.now() - this.startTime) > this.duration) return false;
        return true;
    }
}

//Custom debugging output
console.debug = function () {
    if (!console.debugging) return;
    console.log.apply(this, arguments);
};

//Active pseudo-class mobile compatibility
document.addEventListener("touchstart", function () {}, true);