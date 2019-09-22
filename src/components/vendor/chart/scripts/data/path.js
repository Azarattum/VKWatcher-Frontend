/**
 * This class is used to create path points for drawing from graphs.
 */
export default class Path {
    constructor(points) {
        this.points = points;
        this.indices = new Uint16Array(points.length * 6);
        this.vertices = [];
    }

    get length() {
        return (this.points.length - 1) * 6;
    }
}