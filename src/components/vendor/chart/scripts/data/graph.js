import {Point} from "../core/utils.js";

/**
 * This class represents a graph.
 */
export default class Graph {
    /**
     * Creates a graph object.
     * @param {Object} source Source object to create a graph.
     */
    constructor(xAxis, yAxis, color, name, type) {
        //#region Properties
        /**Graph color.*/
        this.color = color;
        /**Graph name.*/
        this.name = name;
        /**Graph type.*/
        this.type = type;
        /**Top values.*/
        this.maxX = -Number.MAX_SAFE_INTEGER;
        this.minX = Number.MAX_SAFE_INTEGER;
        this.maxY = -Number.MAX_SAFE_INTEGER;
        this.minY = Number.MAX_SAFE_INTEGER;
        /**Graph points.*/
        this.points = [];
        /**Graph normalized points.*/
        this.vertices = [];
        for (let i = 0; i < xAxis.length; i++) {
            const x = xAxis[i];
            const y = yAxis[i];

            if (x > this.maxX) this.maxX = x;
            if (x < this.minX) this.minX = x;
            if (y > this.maxY) this.maxY = y;
            if (y < this.minY) this.minY = y;

            this.points.push(new Point(x, y));
            this.vertices.push(new Point(x, y));
        }
        if (type == "bar") this.minY = 0;
        /**Graph size.*/
        this.size = new Point(this.maxX - this.minX, this.maxY - this.minY);

        //#endregion
        console.debug("Graph created", this);
    }

    /**
     * Count of points in the graph.
     */
    get length() {
        return this.points.length;
    }

    calculateVertices(maxSize, minSize) {
        this.vertices.forEach((point) => {
            point.x = (point.x - minSize.x) / maxSize.x * 2 - 1;
            point.y = (point.y - minSize.y) / maxSize.y * 2 - 1;
        });
    }
}