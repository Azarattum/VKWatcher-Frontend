import GraphDrawer from "../drawing/graph.js";
import PathArea from "../data/pathArea.js";
import {Shader, ShadersProgram} from "../core/gl.js";

/**
 * Class for drawing area stacked graphs.
 */
export default class AreaGraphDrawer extends GraphDrawer {
    constructor(chartDrawer, graph, gl, shaders) {
        super(chartDrawer, graph, gl, shaders);
    }

    //#region Private methods
    _initializeAttributes() {
        this.path = new PathArea(this.graph.vertices, this.chartDrawer.chart.graphs);
        this.stack = this.gl.newStack();

        this.gl.attributes.position = this.path.vertices;
        this.gl.attributes.base = this.path.bases;
        for (const id in this.path.uppers) {
            this.gl.attributes["upper" + id] = this.path.uppers[id];
        }
        for (const id in this.path.uppers) {
            this.gl.attributes["sum" + id] = this.path.sums[id];
        }
    }

    _initializeProgram() {
        const vertex = new Shader(this.shaders[0], Shader.types.VERTEX);
        const fragment = new Shader(this.shaders[1], Shader.types.FRAGMENT);
        vertex.variables = {
            count: this.chartDrawer.chart.graphs.length,
            current: this.chartDrawer.graphDrawers.length
        };
        return this.gl.newProgram(new ShadersProgram(vertex, fragment));
    }
    //#endregion

    //#region Public methods
    /**
     * Draws the graph depending on current settings.
     */
    draw(projection) {
        super.draw(projection);

        this.gl.uniforms.visible = this.chartDrawer.graphDrawers.map(x => (x.color.a / 255));
        const count = this.cuts.end * 2;
        const offset = this.cuts.start * 2;
        this.gl.drawShape(count, offset);
    }
    //#endregion
}