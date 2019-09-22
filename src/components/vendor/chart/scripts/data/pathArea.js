import Path from "../data/path.js";

/**
 * This class exteds Path class to path areas.
 */
export default class PathArea extends Path {
    constructor(points, graphs) {
        super(points);
        //#region Properties
        this.sums = [];
        this.uppers = [];
        this.bases = [];
        //#endregion

        //Fill up the verteces
        points.forEach((point, index) => {
            this.vertices.push(point.x, point.y, point.x, -1);
        });

        //Fill up the bases
        points.forEach((point, index) => {
            this.bases.push(0, 1);
        });

        //Fill up upper points and sums
        const thisIndex = graphs.indexOf(graphs.find(x => x.vertices == points));
        points.forEach((point, index) => {
            for (const graph in graphs) {
                if (!this.uppers[graph]) {
                    this.uppers[graph] = [];
                }
                if (!this.sums[graph]) {
                    this.sums[graph] = [];
                }

                if (graph < thisIndex) {
                    this.uppers[graph].push(graphs[graph].vertices[index].y + 1);
                    this.uppers[graph].push(graphs[graph].vertices[index].y + 1);
                    this.sums[graph].push(0);
                    this.sums[graph].push(0);
                } else {
                    this.uppers[graph].push(0);
                    this.uppers[graph].push(0);
                    this.sums[graph].push(graphs[graph].vertices[index].y + 1);
                    this.sums[graph].push(graphs[graph].vertices[index].y + 1);
                }
            }
        });
    }
}