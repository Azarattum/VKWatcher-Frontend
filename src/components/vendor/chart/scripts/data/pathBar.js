import Path from "../data/path.js";

/**
 * This class exteds Path class to path bars.
 */
export default class PathBar extends Path {
    constructor(points, graphs) {
        super(points);
        //#region Properties
        this.pointers = [];
        this.uppers = [];
        this.bases = [];
        //#endregion

        //Fill up the verteces
        const amplitude = (points[1].x - points[0].x);
        points.forEach(point => {
            this.vertices.push(
                point.x, -1,
                point.x, point.y,
                point.x + amplitude, point.y,
                point.x + amplitude, -1
            );
        });

        //Fill up the indices
        let j = 0;
        let index = 0;
        points.forEach(point => {
            let i = index;
            this.indices[j++] = i + 0;
            this.indices[j++] = i + 1;
            this.indices[j++] = i + 2;
            this.indices[j++] = i + 2;
            this.indices[j++] = i + 0;
            this.indices[j++] = i + 3;
            index += 4;
        });

        //Fill up the pointers
        points.forEach((point, index) => {
            this.pointers.push(index, index, index, index);
        });

        //Fill up the bases
        points.forEach((point, index) => {
            this.bases.push(1, 0, 0, 1);
        });

        //Fill up upper points
        const thisIndex = graphs.indexOf(graphs.find(x => x.vertices == points));
        points.forEach((point, index) => {
            for (const graph in graphs) {
                if (!this.uppers[graph]) {
                    this.uppers[graph] = [];
                }

                if (graph < thisIndex) {
                    this.uppers[graph].push(graphs[graph].vertices[index].y + 1);
                    this.uppers[graph].push(graphs[graph].vertices[index].y + 1);
                    this.uppers[graph].push(graphs[graph].vertices[index].y + 1);
                    this.uppers[graph].push(graphs[graph].vertices[index].y + 1);
                } else {
                    this.uppers[graph].push(0);
                    this.uppers[graph].push(0);
                    this.uppers[graph].push(0);
                    this.uppers[graph].push(0);
                }
            }
        });
    }
}