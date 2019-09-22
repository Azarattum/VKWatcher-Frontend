import GraphDrawer from "../drawing/graph.js";
import PathBar from "../data/pathBar.js";
import {Shader, ShadersProgram} from "../core/gl.js";

/**
 * Class for drawing bar graphs.
 */
export default class BarGraphDrawer extends GraphDrawer {
    constructor(chartDrawer, graph, gl, shaders) {
        super(chartDrawer, graph, gl, shaders);
    }

    //#region Private methods
    _initializeAttributes() {
        this.path = new PathBar(this.graph.vertices, this.chartDrawer.chart.graphs);
        this.stack = this.gl.newStack();

        this.gl.indices = this.path.indices;
        this.gl.attributes.position = this.path.vertices;
        this.gl.attributes.pointer = this.path.pointers;
        this.gl.attributes.base = this.path.bases;
        for (const id in this.path.uppers) {
            this.gl.attributes["upper" + id] = this.path.uppers[id];
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

        this.gl.uniforms.selected = this.chartDrawer.selection.index;
        this.gl.uniforms.visible = this.chartDrawer.graphDrawers.map(x => (x.color.a / 255));

        const count = (this.cuts.end - 1) * 6;
        const offset = this.cuts.start * 6;
        this.gl.drawElements(count, offset);
    }
    //#endregion
}