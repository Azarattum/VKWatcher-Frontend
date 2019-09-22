import Path from "../data/path.js";

/**
 * This class exteds Path class to path lines.
 */
export default class PathLine extends Path {
    constructor(points) {
        super(points);
        //#region Properties
        this.indices = new Uint16Array(points.length * 6);
        this.previouses = [];
        this.nexts = [];
        this.directions = [];
        //#endregion

        //Fill up the verteces
        points.forEach(point => {
            this.vertices.push(point.x, point.y, point.x, point.y);
        });

        //Fill up the previouses points
        points.forEach((point, i, array) => {
            if (i > 0) i--;

            this.previouses.push(
                array[i].x, array[i].y, array[i].x, array[i].y
            );
        });

        //Fill up the nexts points
        points.forEach((point, i, array) => {
            if (i < array.length - 1) i++;

            this.nexts.push(
                array[i].x, array[i].y, array[i].x, array[i].y
            );
        });

        //Fill up the directions
        points.forEach(point => {
            this.directions.push(-1, 1);
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
            this.indices[j++] = i + 1;
            this.indices[j++] = i + 3;
            index += 2;
        });
    }
}