import {Color} from "../core/utils.js";
import Chart from "../data/chart.js";
import ChartDrawer from "../drawing/chart.js";
import ChartController from "../element/controller.js";

export const ANIMATION_PERIOD = 200;

export default class ChartElement {
    constructor(container, shadersPack) {
        this.elements = {};
        this.styles = {};
        this.shaders = shadersPack;
        this.elements.container = container;
        this._initializeComponent();
        this._windowWidth = window.innerWidth;

        //Default styles
        this.styles.text = "#000";
        this.styles.background = "#FFF";
        this.styles.font = "inherit";
        this.styles.margin = "8px";
        this.styles.dates = "24px";
        this.styles.preview = "48px";
        this.styles.lowlight = "0.1";
        this.styles.border = "1px";
        this.styles.select = "48px";
        this._initializeStyle();
    }

    //#region Properties
    set chart(chart) {
        if (chart instanceof Chart) {
            this.chartData = chart;
        } else {
            this.chartData = new Chart(chart);
        }

        this.drawer = new ChartDrawer(
            this.chartData,
            this.elements.chart,
            this.shaders,
            this.elements.layout,
        );

        this.previewer = new ChartDrawer(
            this.chartData,
            this.elements.preview,
            this.shaders
        );

        this.controller = new ChartController(
            this.elements.select,
            this.elements.draggerLeft,
            this.elements.draggerRight,
            this.elements.layout
        );

        const monthNames = ["January", "February", "March", "April", "May", "June",
            "July", "August", "September", "October", "November", "December"
        ];
        this.controller.onupdate = (start, end) => {
            this.elements.coverLeft.style.width = start * 100 + "%";
            this.elements.coverRight.style.width = (1 - end) * 100 + "%";
            this.drawer.start = start;
            this.drawer.end = end;

            const maxX = this.drawer.chart.size.x;
            const minX = this.drawer.chart.xAxis[0];
            const startDate = new Date(Math.round(start * maxX + minX));
            const endDate = new Date(Math.round(end * maxX + minX));
            const text = document.createTextNode(
                startDate.getDate() + " " +
                monthNames[startDate.getMonth()] + " " +
                startDate.getFullYear() + " - " +
                endDate.getDate() + " " +
                monthNames[endDate.getMonth()] + " " +
                endDate.getFullYear()
            );

            const child = this.elements.range.firstChild;
            if (child)
                this.elements.range.removeChild(child);
            this.elements.range.appendChild(text);
        };

        this.controller.onselect = (x, value, visible) => {
            if (visible) {
                this.elements.tooltip.style.opacity = 1;
                this.drawer.select = value;
            } else {
                this.elements.tooltip.style.opacity = 0;
                this.drawer.select = null;
            }

            if (value < 0.5) {
                this.elements.tooltip.style.left =
                    x + parseInt(this.styles.margin) * 2 + "px";
            } else {
                this.elements.tooltip.style.left =
                    (x - this.elements.tooltip.clientWidth - parseInt(this.styles.margin) * 2) + "px";
            }
        }

        this.drawer.onrecalculated = () => {
            if (this.drawer.selection.value == null) return;

            //Update the date
            const index = this.drawer.selection.index;
            let date = new Date(
                this.drawer.chart.xAxis[index]
            ).toString().split(" ");
            date = date[0] + ", " + date[2] + " " + date[1] + " " + date[3];

            this.elements.date.innerHTML = date;

            //Update values
            let values = this.elements.values.children;
            for (let i = 0; i < values.length; i++) {
                if (this.chartData.stacked && i == values.length - 1) {
                    let sum = this.drawer.graphDrawers.reduce((a, b) => {
                        if (!b.visible) return a;
                        return a + b.graph.points[index].y;
                    }, 0);

                    values[i].style.display = 
                        this.drawer.graphDrawers.filter(x => x.visible).length <= 1 ?
                        "none" : "list-item";
                    values[i].children[values[i].children.length - 1].innerHTML = sum;
                    continue;
                }

                if (this.chartData.percentage) {
                    let sum = this.drawer.graphDrawers.reduce((a, b) => {
                        if (!b.visible) return a;
                        return a + b.graph.points[index].y;
                    }, 0);

                    values[i].children[0].innerHTML = Math.round(
                        this.drawer.chart.graphs[i].points[index].y / sum * 100
                    ) + "%";
                }

                values[i].style.display = this.drawer.graphDrawers[i].visible ? "list-item" : "none";
                values[i].children[values[i].children.length - 1].innerHTML =
                    this.drawer.chart.graphs[i].points[index]
                    .y.toString().replace(/\B(?=(\d{3})+(?!\d))/g, " ");
            }
        }

        this.controller.update();

        this.elements.title.innerHTML = "";

        //Add tooltips
        for (const graphId in this.chartData.graphs) {
            let container = document.createElement("div");
            let percentage = document.createElement("div");
            let name = document.createElement("div");
            let value = document.createElement("div");

            percentage.className = "chart-tooltip-values-percentage";
            container.className = "chart-tooltip-values-value";
            name.className = "chart-tooltip-values-value-value";
            value.className = "chart-tooltip-values-value-name";

            value.style.color = this.chartData.graphs[+graphId].color.toString();
            name.innerHTML = this.chartData.graphs[+graphId].name;

            container.style.fontSize = "0.85em";
            container.float = "left";
            percentage.style.float = "left";
            percentage.style.width = "2.4em";
            name.style.float = "left";
            name.style.fontWeight = "normal";
            value.style.float = "right";

            if (this.chartData.percentage) {
                container.appendChild(percentage);
            }
            container.appendChild(name);
            container.appendChild(value);
            this.elements.values.appendChild(container);
        }
        if (this.chartData.stacked) {
            let container = document.createElement("div");
            let percentage = document.createElement("div");
            let name = document.createElement("div");
            let value = document.createElement("div");

            percentage.className = "chart-tooltip-values-percentage";
            container.className = "chart-tooltip-values-value";
            name.className = "chart-tooltip-values-value-value";
            value.className = "chart-tooltip-values-value-name";

            value.style.color = "inherit";
            name.innerHTML = "Total";

            container.style.fontSize = "0.85em";
            container.float = "left";
            percentage.style.float = "left";
            percentage.style.width = "2.4em";
            name.style.float = "left";
            name.style.fontWeight = "bold";
            value.style.float = "right";

            if (this.chartData.percentage) {
                container.appendChild(percentage);
            }
            container.appendChild(name);
            container.appendChild(value);
            this.elements.values.appendChild(container);
        }

        //Add buttons
        this.elements.buttons = [];
        if (this.chartData.graphs.length <= 1) {
            this.title = this.chartData.graphs[0].name;
            return;
        }
        for (const graphId in this.chartData.graphs) {
            let button = document.createElement("label");
            let checkbox = document.createElement("input");
            let icon = document.createElement("div");
            let cover = document.createElement("div");
            let name = document.createElement("span");

            name.innerHTML = this.chartData.graphs[+graphId].name;
            button.style.backgroundColor = this.chartData.graphs[+graphId].color;
            button.style.borderColor = this.chartData.graphs[+graphId].color;
            name.style.color = this.chartData.graphs[+graphId].color;

            button.className = "chart-graph-button";
            name.className = "chart-graph-button-name";
            cover.className = "chart-graph-button-cover";
            icon.className = "chart-graph-button-icon";

            checkbox.type = "checkbox";
            checkbox.checked = true;
            checkbox.style.position = "fixed";
            checkbox.style.opacity = "0";

            button.appendChild(checkbox);
            button.appendChild(icon);
            button.appendChild(name);
            button.appendChild(cover);
            this.elements.graphs.appendChild(button);

            //Click event
            button.onclick = (e) => {
                let visibleGraphs = this.drawer.graphDrawers.reduce((n, x) => {
                    return n + (x.visible ? 1 : 0);
                }, 0);

                if (this.drawer.graphDrawers[+graphId].visible && visibleGraphs == 1) {
                    return false;
                }

                this.drawer.toggle(+graphId, checkbox.checked);
                this.previewer.toggle(+graphId, checkbox.checked);
            }

            //Holding events
            button.onmousedown = () => {
                this.elements.buttons[+graphId].timeout = setTimeout(() => {
                    toggleAll(this, +graphId)
                }, 1000);
            }
            button.ontouchstart = () => {
                this.elements.buttons[+graphId].timeout = setTimeout(() => {
                    toggleAll(this, +graphId)
                }, 1000);
            }

            button.onmouseup = () => {
                clearTimeout(this.elements.buttons[+graphId].timeout);
            }
            button.ontouchend = () => {
                clearTimeout(this.elements.buttons[+graphId].timeout);
            }

            this.elements.buttons.push(button);
        }

        function toggleAll(sender, except) {
            sender.elements.buttons[except].firstChild.checked = true;
            sender.drawer.toggle(except, true);
            sender.previewer.toggle(except, true);
            for (const id in sender.elements.buttons) {
                if (id != except) {
                    sender.elements.buttons[id].firstChild.checked = false;
                    sender.elements.buttons[id].firstChild.checked = false;
                    sender.drawer.toggle(id, false);
                    sender.previewer.toggle(id, false);
                }
            }
        }
    }

    set style(styles) {
        if (styles.background) {
            this.styles.background = new Color(styles.background).toString() || this.styles.background;
        }
        if (styles.text) {
            this.styles.text = new Color(styles.text).toString() || this.styles.text;
        }
        this.styles.font = styles.font || this.styles.font;
        this.styles.margin = styles.margin || this.styles.margin;
        this.styles.dates = styles.dates || this.styles.dates;
        this.styles.preview = styles.preview || this.styles.preview;
        this.styles.lowlight = styles.lowlight || this.styles.lowlight;
        this.styles.border = styles.border || this.styles.border;
        this.styles.select = styles.select || this.styles.select;
        this._initializeStyle();

        if (this.drawer) {
            this.drawer.update(
                new Color(this.styles.background),
                new Color(this.styles.text),
                styles.font,
                5
            );
        }
        if (this.previewer) {
            this.previewer.update(
                new Color(this.styles.background),
                new Color(this.styles.text),
                styles.font,
                2
            );
        }
    }

    set title(title) {
        this.elements.title.innerHTML = title;
    }

    get title() {
        return this.elements.title.innerHTML;
    }
    //#endregion

    //#region Private methods
    _initializeComponent() {
        //Heade
        this.elements.header = document.createElement("div");
        this.elements.title = document.createElement("span");
        this.elements.range = document.createElement("span");

        this.elements.header.className = "chart-header";
        this.elements.title.className = "chart-title";
        this.elements.range.className = "chart-range";

        this.elements.header.appendChild(this.elements.title);
        this.elements.header.appendChild(this.elements.range);

        //Tooltip
        this.elements.tooltip = document.createElement("div");
        this.elements.date = document.createElement("span");
        this.elements.values = document.createElement("div");

        this.elements.tooltip.className = "chart-tooltip";
        this.elements.date.className = "chart-tooltip-date";
        this.elements.values.className = "chart-tooltip-values";

        this.elements.tooltip.appendChild(this.elements.date);
        this.elements.tooltip.appendChild(this.elements.values);

        //Render
        this.elements.render = document.createElement("div");
        this.elements.chart = document.createElement("canvas");
        this.elements.layout = document.createElement("canvas");

        this.elements.render.className = "chart-render";
        this.elements.chart.className = "chart-render-chart";
        this.elements.layout.className = "chart-render-layout";

        this.elements.render.appendChild(this.elements.chart);
        this.elements.render.appendChild(this.elements.layout);

        //Preview
        this.elements.control = document.createElement("div");
        this.elements.preview = document.createElement("canvas");
        this.elements.select = document.createElement("div");
        this.elements.draggerLeft = document.createElement("div");
        this.elements.draggerRight = document.createElement("div");
        this.elements.coverLeft = document.createElement("div");
        this.elements.coverRight = document.createElement("div");

        this.elements.control.className = "chart-control";
        this.elements.preview.className = "chart-preview";
        this.elements.select.className = "chart-select";
        this.elements.draggerLeft.className = "chart-dragger chart-dragger-left";
        this.elements.draggerRight.className = "chart-dragger chart-dragger-right";
        this.elements.coverLeft.className = "chart-cover chart-cover-left";
        this.elements.coverRight.className = "chart-cover chart-cover-right";

        this.elements.control.appendChild(this.elements.preview);
        this.elements.control.appendChild(this.elements.coverLeft);
        this.elements.control.appendChild(this.elements.select);
        this.elements.select.appendChild(this.elements.draggerLeft);
        this.elements.select.appendChild(this.elements.draggerRight);
        this.elements.control.appendChild(this.elements.coverRight);

        //Graph buttons container
        this.elements.graphs = document.createElement("div");

        this.elements.graphs.className = "chart-graphs";

        //Main container
        this.elements.container.className += " chart-container";

        this.elements.container.appendChild(this.elements.header);
        this.elements.container.appendChild(this.elements.tooltip);
        this.elements.container.appendChild(this.elements.render);
        this.elements.container.appendChild(this.elements.control);
        this.elements.container.appendChild(this.elements.graphs);
    }

    _initializeStyle() {
        this.elements.container.style.font = this.styles.font;

        this.elements.header.style.position = "relative";

        this.elements.title.style.fontWeight = "bold";
        this.elements.title.style.color = this.styles.text;
        this.elements.title.style.marginLeft = parseInt(this.styles.margin) / 2 + "px";
        this.elements.title.style.marginBottom = parseInt(this.styles.margin) + "px";

        this.elements.range.style.float = "right";
        this.elements.range.style.marginBottom = parseInt(this.styles.margin) + "px";
        this.elements.range.style.fontSize = "0.9em";
        this.elements.range.style.color = this.styles.text;
        this.elements.range.style.zIndex = "100";

        this.elements.tooltip.style.position = "absolute";
        this.elements.tooltip.style.minWidth = "192px";
        this.elements.tooltip.style.padding = parseInt(this.styles.margin) + "px";
        this.elements.tooltip.style.fontSize = "14.3px";
        this.elements.tooltip.style.borderRadius = parseInt(this.styles.margin) / 2 + "px";
        this.elements.tooltip.style.boxShadow = "0px 0px 4px rgba(0, 0, 0, 0.4)";
        this.elements.tooltip.style.backgroundColor = this.styles.background;
        this.elements.tooltip.style.color = this.styles.text;
        this.elements.tooltip.style.overflow = "hidden";
        this.elements.tooltip.style.touchAction = "none";
        this.elements.tooltip.style.pointerEvents = "none";
        this.elements.tooltip.style.userAelect = "none";
        this.elements.tooltip.style.zIndex = "100";
        this.elements.tooltip.style.transition = "0.1s";
        this.elements.tooltip.style.transitionProperty = "opacity";
        this.elements.tooltip.style.opacity = "0";
        this.elements.tooltip.style.fontWeight = "bold";

        this.elements.render.style.position = "relative";
        this.elements.render.style.width = "100%";
        this.elements.render.style.height = "50vh";
        this.elements.render.style.marginBottom = parseInt(this.styles.margin) + "px";

        this.elements.chart.style.position = "absolute";
        this.elements.chart.style.height = "calc(100% - " + parseInt(this.styles.dates) + "px)";
        this.elements.chart.style.width = "100%";

        this.elements.layout.style.position = "absolute";
        this.elements.layout.style.height = "100%";
        this.elements.layout.style.width = "100%";

        this.elements.control.style.position = "relative";
        this.elements.control.style.width = "100%";
        this.elements.control.style.height = parseInt(this.styles.preview) + "px";
        this.elements.control.style.touchAction = "none";
        this.elements.control.style.userSelect = "none";
        this.elements.control.style.marginBottom = parseInt(this.styles.margin) + "px";

        this.elements.preview.style.position = "absolute";
        this.elements.preview.style.width = "100%";
        this.elements.preview.style.height = "100%";

        this.elements.coverLeft.style.position = "absolute";
        this.elements.coverLeft.style.left = "0";
        this.elements.coverLeft.style.height = "100%";
        this.elements.coverLeft.style.backgroundColor = this.styles.background;
        this.elements.coverLeft.style.opacity = "0.6";
        this.elements.coverLeft.style.userSelect = "none";
        this.elements.coverLeft.style.filter = "brightness(" + (1 - this.styles.lowlight) + ")";

        this.elements.coverRight.style.position = "absolute";
        this.elements.coverRight.style.right = "0";
        this.elements.coverRight.style.height = "100%";
        this.elements.coverRight.style.backgroundColor = this.styles.background;
        this.elements.coverRight.style.opacity = "0.6";
        this.elements.coverRight.style.filter = "brightness(" + (1 - this.styles.lowlight) + ")";

        this.elements.select.style.position = "absolute";
        this.elements.select.style.height = "calc(100% - " + parseInt(this.styles.border) + "px * 2)";
        this.elements.select.style.minWidth = parseInt(this.styles.select) + "px";
        this.elements.select.style.maxWidth = "calc(100% - " - parseInt(this.styles.select) + "px * 8)";
        this.elements.select.style.opacity = "0.2";
        this.elements.select.style.border = parseInt(this.styles.border) + "px solid " + this.styles.text;
        this.elements.select.style.borderLeftWidth = parseInt(this.styles.border) * 4 + "px";
        this.elements.select.style.borderRightWidth = parseInt(this.styles.border) * 4 + "px";
        this.elements.select.style.cursor = "grab";
        this.elements.select.style.zIndex = "100";

        this.elements.draggerLeft.style.position = "absolute";
        this.elements.draggerLeft.style.left = "-18px";
        this.elements.draggerLeft.style.height = "100%";
        this.elements.draggerLeft.style.width = "24px";
        this.elements.draggerLeft.style.cursor = "ew-resize";
        this.elements.draggerLeft.style.zIndex = "100";

        this.elements.draggerRight.style.position = "absolute";
        this.elements.draggerRight.style.right = "-18px";
        this.elements.draggerRight.style.height = "100%";
        this.elements.draggerRight.style.width = "24px";
        this.elements.draggerRight.style.cursor = "ew-resize";
        this.elements.draggerRight.style.zIndex = "100";
    }
    //#endregion

    //#region Public methods
    update() {
        if (window.innerWidth != this._windowWidth) {
            this.elements.select.style.left = "0px";
            this.elements.select.style.width = "0px";
        }
        this.drawer.update();
        this.previewer.update();
        this.controller.update();
        this._windowWidth = window.innerWidth;
    }

    render() {
        this.drawer.draw();
        this.previewer.draw();
    }
    //#endregion
}