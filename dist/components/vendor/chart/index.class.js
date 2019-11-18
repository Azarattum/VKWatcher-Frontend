import ChartElement from "./scripts/element/element.js";
import DateUtils from "../../common/date.class.js";
import Loader from "../../common/loader.class.js";
export default class Chart {
    constructor(container) {
        this.enabled = false;
        this.chart = null;
        this.data = null;
        this.delayedExecution = [];
        this.container = container;
        const shaderLoader = new Loader([
            "./libs/shaders/bar.vsh",
            "./libs/shaders/bar.fsh",
            "./libs/shaders/layout.vsh",
            "./libs/shaders/layout.fsh"
        ]);
        shaderLoader.load().then(this.initialize);
    }
    //#region Public methods
    /**
     * Changes user whose chart is drawing
     * @param {User} user New user changes user whose chart is drawing
     */
    async switch(user) {
        if (Object.keys(user.days).length == 0) {
            this.container.innerHTML = "";
            return;
        }
        this.data = await this.convertData(user);
        this.refresh();
    }
    /**
     * Refreshes chart data using current user data
     */
    refresh() {
        if (!this.chart) {
            this.delayedExecution.push(this.refresh);
            return;
        }
        if (!this.data || !this.chart.drawer)
            return;
        this.container.innerHTML = "";
        this.chart._initializeComponent();
        this.chart._initializeStyle();
        this.chart.chart = this.data;
        //Custom format style
        const func = this.chart.drawer.onrecalculated;
        this.chart.drawer.onrecalculated = () => {
            func();
            if (!this.chart)
                return;
            const values = this.chart.elements
                .values.children;
            for (const valueElement of values) {
                const lastChild = valueElement.children[valueElement.children.length - 1];
                lastChild.innerHTML = DateUtils.getReadableDuration(+lastChild.innerHTML.replace(/\s*/g, ""));
            }
        };
        if (!this.chart.drawer.layoutDrawer)
            return;
        this.chart.drawer.layoutDrawer._formatValue = (number) => {
            const hours = Math.floor(number / 60 / 60);
            return (hours + "h " + Math.round((number - hours * 60 * 60) / 60) + "m");
        };
        this.update();
    }
    /**
     * Updates element (for example on resize)
     */
    update() {
        if (!this.chart) {
            this.delayedExecution.push(this.update);
            return;
        }
        this.chart.style = {};
        this.chart.update();
        if (this.chart.controller) {
            this.chart.controller.onupdate(0, 0.999999);
            this.chart.controller.selector.style.width =
                "calc(100% - 8px)";
        }
    }
    //#endregion
    //#region Private methods
    /**
     * Intialize the chart
     * @param shadersData Shaders source
     */
    initialize(shadersData) {
        const pageStyle = getComputedStyle(document.body);
        const shaders = {
            bar: [shadersData[0], shadersData[1]],
            layout: [shadersData[2], shadersData[3]]
        };
        this.chart = new ChartElement(this.container, shaders);
        this.chart.style = {
            background: "255, 255, 255",
            text: pageStyle.getPropertyValue("--color-text"),
            font: pageStyle.fontFamily,
            lowlight: 0.05
        };
        this.registerEvents();
    }
    /**
     * Converts user object to chart-library-compatable input object
     * @param {User} user User object to extract data from
     */
    async convertData(user) {
        //Device colors
        const colors = getComputedStyle(document.getElementsByClassName("page")[0]);
        //Template object
        const data = {
            columns: [
                ["x"],
                ["y0"],
                ["y1"],
                ["y2"],
                ["y3"],
                ["y4"],
                ["y5"],
                ["y6"],
                ["y7"]
            ],
            types: {
                y0: "bar",
                y1: "bar",
                y2: "bar",
                y3: "bar",
                y4: "bar",
                y5: "bar",
                y6: "bar",
                y7: "bar",
                x: "x"
            },
            names: {
                y0: "Unknown",
                y1: "Mobile",
                y2: "iPhone",
                y3: "iPad",
                y4: "Android",
                y5: "WPhone",
                y6: "Windows",
                y7: "Web"
            },
            colors: {
                y0: colors.getPropertyValue("--color-unknown"),
                y1: colors.getPropertyValue("--color-mobile"),
                y2: colors.getPropertyValue("--color-iphone"),
                y3: colors.getPropertyValue("--color-ipad"),
                y4: colors.getPropertyValue("--color-android"),
                y5: colors.getPropertyValue("--color-wphone"),
                y6: colors.getPropertyValue("--color-windows"),
                y7: colors.getPropertyValue("--color-web")
            },
            stacked: true
        };
        //Scan days
        const total = [0, 0, 0, 0, 0, 0, 0, 0];
        const days = Object.values(user.days);
        for (let i = 0; i < days.length; i++) {
            const day = days[i];
            data.columns[0][i + 1] = +day.date;
            for (let j = 1; j < 9; j++) {
                const sum = day.sessions.reduce((a, b) => {
                    return a + (b.platform == j - 1 ? b.length : 0);
                }, 0);
                data.columns[j][i + 1] = sum;
                total[j - 1] += sum;
            }
        }
        //Clear empty devices
        let offset = 0;
        for (let i = 0; i < total.length; i++) {
            if (total[i] == 0) {
                data.columns.splice(i + 1 - offset, 1);
                delete data.types["y" + i];
                delete data.names["y" + i];
                delete data.colors["y" + i];
                offset++;
            }
        }
        return data;
    }
    /**
     * Renders the chart
     */
    render() {
        if (this.enabled || !this.chart || !this.chart.chartData) {
            requestAnimationFrame(() => {
                this.render();
            });
            return;
        }
        this.chart.render();
        requestAnimationFrame(() => {
            this.render();
        });
    }
    /**
     * Registers all elements events
     */
    registerEvents() {
        //Save old sizes
        let width = null;
        let height = null;
        window.addEventListener("resize", () => {
            //Check if size has changed
            const newSize = this.container.getClientRects()[0];
            if (!this.chart ||
                !this.chart.chartData ||
                newSize == undefined ||
                (newSize.width == width && newSize.height == height)) {
                width = newSize ? newSize.width : null;
                height = newSize ? newSize.height : null;
                return;
            }
            width = newSize.width;
            height = newSize.height;
            this.update();
        });
        requestAnimationFrame(() => {
            this.render();
        });
    }
}
//# sourceMappingURL=index.class.js.map