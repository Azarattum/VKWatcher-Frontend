import {Point, Color} from "../core/utils.js";
import Graph from "../data/graph.js";

/**
 * This class represents a chart.
 */
export default class Chart {
    /**
     * Creates a chart object.
     * @param {Object} source Source JSON string, object or filename to create a chart.
     */
    constructor(source) {
        //#region Properties
        /**Returns the contained graph objects.*/
        this.graphs = [];
        //#endregion

        //#region Parse source
        //Check the source type
        if (typeof source === "string") {
            //Try to parse from json string
            try {
                source = JSON.parse(source);
            } catch {
                throw new Error("Source is not a valid JSON object!");
            }
        }

        if (Array.isArray(source)) {
            throw new Error("Array is not allowed! Use \"Chart.array\" instead.");
        }

        if (!(
                typeof source === "object" &&
                typeof source.colors === "object" &&
                typeof source.columns === "object" &&
                typeof source.names === "object" &&
                typeof source.types === "object"
            )) {
            throw new Error("Wrong source format!");
        }
        //#endregion

        //#region Create graphs
        this.stacked = !!source.stacked;
        this.percentage = !!source.percentage;
        this.scaled = !!source.y_scaled;
        const shift = typeof source.columns[0][0] == "string";
        this.xAxis = source.columns[0];
        if (shift) this.xAxis.shift();

        this.size = new Point(-Number.MAX_SAFE_INTEGER, -Number.MAX_SAFE_INTEGER);
        this.offsets = new Point(Number.MAX_SAFE_INTEGER, Number.MAX_SAFE_INTEGER);
        for (let i = 1; i < source.columns.length; i++) {
            let yAxis = source.columns[i];
            if (shift) yAxis.shift();
            const id = Object.keys(source.names)[i - 1];
            const color = new Color(source.colors[id]);
            const name = source.names[id];
            const type = source.types[id];

            const graph = new Graph(this.xAxis, yAxis, color, name, type, this.percentage);
            if (graph.size.x > this.size.x) {
                this.size.x = graph.size.x;
            }
            if (graph.size.y > this.size.y) {
                this.size.y = graph.size.y;
            }
            if (graph.minX < this.offsets.x) {
                this.offsets.x = graph.minX;
            }
            if (graph.minY < this.offsets.y) {
                this.offsets.y = graph.minY;
            }
            this.graphs.push(graph);
        }
        if (this.percentage) {
            this.size.y = 100;
            this.offsets.y = 0;
        }

        this.graphs = this.graphs.sort(function (a, b) {
            return b.maxY - a.maxY
        });

        this.type = this.graphs[0].type;

        if (this.type == "bar") this.stacked = true;

        //Calculate graph vertices according to the biggest size
        if (!this.scaled) {
            this.graphs.forEach(x => x.calculateVertices(this.size, this.offsets));
        } else {
            this.graphs.forEach(x => x.calculateVertices(x.size, new Point(x.minX, x.minY)));
        }
        //#endregion

        console.debug("Chart created", this);
    }

    /**
     * Returns an array of chart objects.
     * @param {Array} source Source JSON string, array or filename to create charts.
     * @returns {Chart[]} An array of chart objects.
     */
    static array(source) {
        //#region Parse source
        //Check the source type
        if (typeof source === "string") {
            //Try to parse from json string
            try {
                source = JSON.parse(source);
            } catch {
                throw new Error("Source is not a valid JSON object!");
            }
        }

        if (!Array.isArray(source)) {
            throw new Error("Source is not an array! Use \"new Chart\" if it is a chart source.");
        }
        //#endregion

        let charts = [];
        for (const chart of source) {
            charts.push(new Chart(chart));
        }
        console.debug("Charts array parsed", charts);
        return charts;
    }
}