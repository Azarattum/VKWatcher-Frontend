import GraphDrawer from "../drawing/graph.js";
import PathLine from "../data/pathLine.js";

/**
 * Class for drawing line graphs.
 */
export default class LineGraphDrawer extends GraphDrawer {
    constructor(chartDrawer, graph, gl, shaders) {
        super(chartDrawer, graph, gl, shaders);

        this.thickness = 1;
    }

    //#region Private methods
    _initializeAttributes() {
        this.path = new PathLine(this.graph.vertices);
        this.stack = this.gl.newStack();

        this.gl.indices = this.path.indices;
        this.gl.attributes.position = this.path.vertices;
        this.gl.attributes.next = this.path.nexts;
        this.gl.attributes.previous = this.path.previouses;
        this.gl.attributes.direction = this.path.directions;
    }
    //#endregion

    //#region Public methods
    /**
     * Draws the graph depending on current settings.
     */
    draw(projection) {
        super.draw(projection);

        this.gl.uniforms.aspect = this.gl.viewport.width / this.gl.viewport.height;
        this.gl.uniforms.thickness = this.thickness / this.gl.canvas.height * Math.sqrt(window.devicePixelRatio);

        const count = (this.cuts.end - 1) * 6;
        const offset = this.cuts.start * 6;
        this.gl.drawElements(count, offset);
    }
    //#endregion
}