import { AnimationObject } from "../core/utils.js";
import { ANIMATION_PERIOD } from "../element/element.js";
import GL from "../core/gl.js";
import LayoutDrawer from "../drawing/layout.js";
import LineGraphDrawer from "../drawing/graphLine.js";
import BarGraphDrawer from "../drawing/graphBar.js";
import AreaGraphDrawer from "../drawing/graphArea.js";
/**
 * This class is responsible for drawing the entire chart.
 */
export default class ChartDrawer {
    /**
     * Creates an object for drawing charts.
     */
    constructor(chart, canvas, shadersPack, layout = null) {
        //#region Fields
        //Core
        /**Chart object.*/
        this.chart = chart;
        /**Layout canvas.*/
        this.canvas = layout;
        /**GL Object.*/
        this.gl = new GL(canvas);
        //Custom properties
        /**Visible graphs area.*/
        this.area = {
            start: 0,
            end: 1,
            top: 1
        };
        /**The selection.*/
        this.selection = {
            index: -1,
            points: [],
            input: null,
            value: null
        };
        /**Whether the chart needs to redraw.*/
        this.redraw = true;
        /**Whether draw layout or not.*/
        this.layout = !!layout;
        /**Calls every time when the drawe was recalculated.*/
        this.onrecalculated = () => { };
        //Animations
        /**Object that contains all animated properties.*/
        this.animations = {
            /**Describes graph transformations.*/
            projection: new AnimationObject([1, 0, 0, 0, 1, 0, 0, 0, 1]),
        };
        //Sub drawers
        /**Graph drawer objects.*/
        this.graphDrawers = [];
        /**Layout drawer object.*/
        this.layoutDrawer = !this.layout ? null :
            new LayoutDrawer(this, this.canvas, this.gl, shadersPack.layout);
        //#endregion
        //Perform initial update
        this.update();
        //Initilizing graph drawers
        for (const graph of chart.graphs) {
            if (graph.type == "line") {
                this.graphDrawers.push(new LineGraphDrawer(this, graph, this.gl, shadersPack.line));
            }
            else if (graph.type == "bar") {
                this.graphDrawers.push(new BarGraphDrawer(this, graph, this.gl, shadersPack.bar));
            }
            else if (graph.type == "area") {
                this.graphDrawers.push(new AreaGraphDrawer(this, graph, this.gl, shadersPack.area));
            }
        }
        console.debug("ChartDrawer created", this);
    }
    //#region Properties
    /**
     * Sets the start drawing point.
     * @param {Number} percent The percentage(0-1) of drawing start point.
     */
    set start(value) {
        if (value > 1)
            value = 1;
        if (value < 0)
            value = 0;
        this.area.start = value;
        this.redraw = true;
    }
    /**
     * Sets the end drawing point.
     * @param {Number} percent The percentage(0-1) of drawing end point.
     */
    set end(value) {
        if (value > 1)
            value = 1;
        if (value < 0)
            value = 0;
        this.area.end = value;
        this.redraw = true;
    }
    /**
     * Sets the postion of selection line.
     * @param {Number} percent The percentage of selected point.
     */
    set select(value) {
        const selection = value == null ? null :
            (this.area.start + value / (1 / (this.area.end - this.area.start))) * 2 - 1;
        this.selection.input = selection;
        this.redraw = true;
    }
    //#endregion
    //#region Private methods
    /**
     * Calculates chart values for drawing.
     */
    _calculate() {
        const amplitude = (this.chart.type != "bar") ? 0 :
            (this.graphDrawers[0].path.points[1].x - this.graphDrawers[0].path.points[0].x) / 2;
        //Estimate index
        let index = Math.round(this.area.start * this.chart.xAxis.length);
        if (!Number.isInteger(index))
            return;
        let previousDistance = Number.MAX_SAFE_INTEGER;
        let goal = this.area.start * 2 - 1;
        //Search for start index
        while (true) {
            const vertex = this.graphDrawers[0].graph.vertices[index];
            const distance = goal - vertex.x;
            if (distance > 0) {
                index++;
            }
            else if (distance < 0) {
                index--;
            }
            else {
                break;
            }
            if (Math.abs(previousDistance) > Math.abs(distance)) {
                previousDistance = distance;
            }
            else {
                break;
            }
        }
        //Save start offset
        const start = index;
        let selectionIndex = -1;
        let minSelectionDistance = Number.MAX_SAFE_INTEGER;
        let maxY = -Number.MAX_SAFE_INTEGER;
        //Go forward and scan
        goal = this.area.end * 2 - 1;
        while (true) {
            //Wait for the end
            if (index >= this.graphDrawers[0].graph.vertices.length)
                break;
            const vertex = this.graphDrawers[0].graph.vertices[index];
            if (vertex.x > goal)
                break;
            //Calculate selection
            if (this.layout && this.selection.input != null) {
                let distance = Math.abs(this.selection.input - vertex.x - amplitude);
                if (distance < minSelectionDistance) {
                    minSelectionDistance = distance;
                    selectionIndex = index;
                }
            }
            //Calculate local maximum
            if (!this.chart.percentage) {
                let sum = 0;
                for (const drawer of this.graphDrawers) {
                    if (!drawer.visible)
                        continue;
                    const graphVertex = drawer.graph.vertices[index];
                    sum += graphVertex.y + 1;
                    if (graphVertex.y > maxY) {
                        maxY = graphVertex.y;
                    }
                }
                //For stacked charts
                if (this.chart.stacked && (sum - 1) > maxY) {
                    maxY = sum - 1;
                }
            }
            else {
                maxY = 1;
            }
            index++;
        }
        //Saving calculated data
        this.area.top = maxY;
        //Calculating the projection
        const zoomX = 1 / (this.area.end - this.area.start);
        const zoomY = 2 / (this.area.top + 1);
        const moveX = (1 - this.area.start - this.area.end) * zoomX;
        const moveY = zoomY - 1;
        const projection = [
            zoomX, 0, 0,
            0, zoomY, 0,
            moveX, moveY, 1
        ];
        this.selection.index = selectionIndex;
        this.selection.value = selectionIndex == -1 ? null :
            this.graphDrawers[0].graph.vertices[selectionIndex];
        this.selection.points = [];
        if (selectionIndex != -1) {
            for (const drawer of this.graphDrawers) {
                this.selection.points.push(drawer.graph.vertices[selectionIndex].y * zoomY + moveY);
            }
        }
        //Setting up the animations
        this.animations.projection.set(projection, this.animations.projection.modified ? ANIMATION_PERIOD / 2 : 0);
        //Call event
        this.onrecalculated();
    }
    //#endregion
    //#region Public methods
    /**
     * Toggles or sets graph's visibility state by id.
     * @param {Number} id Graph id.
     * @param {Boolean} state Visibility state.
     */
    toggle(id, state = undefined) {
        const drawer = this.graphDrawers[id];
        if (state != drawer.visible) {
            drawer.toggle();
        }
        this.redraw = true;
    }
    /**
     * Updates sizes and colors.
     */
    update(backgroundColor, textColor, textFont, thickness) {
        this.gl.resize();
        if (backgroundColor) {
            this.gl.background = backgroundColor;
        }
        if (thickness) {
            for (const drawer of this.graphDrawers) {
                if (drawer instanceof LineGraphDrawer) {
                    drawer.thickness = thickness;
                }
            }
        }
        if (this.layout) {
            this.canvas.width = this.canvas.clientWidth * window.devicePixelRatio;
            this.canvas.height = this.canvas.clientHeight * window.devicePixelRatio;
            if (textColor) {
                this.layoutDrawer.color = textColor;
                this.layoutDrawer.selectionDrawer.color = textColor;
            }
            if (textFont) {
                this.layoutDrawer.font = textFont;
            }
        }
        this.redraw = true;
    }
    /**
     * Draws all charts.
     */
    draw() {
        if (this.redraw) {
            this._calculate();
            this.gl.clear();
            const projection = this.animations.projection.get();
            for (const drawer of this.graphDrawers) {
                drawer.draw(projection);
            }
            if (this.layout) {
                this.layoutDrawer.draw(projection, this.selection);
                ///IMPLEMENT NEW SELECTION CLASS!
                /*if (this.selection.value != null) {
                    this.layoutDrawer.drawSelection(this.selection.value, this.graphDrawers[0].projection.get());
                }*/
            }
            if (!this.graphDrawers.some(x => x.animating) &&
                (!this.layout || !this.layoutDrawer.animating) &&
                !Object.values(this.animations).some(x => x.inProgress)) {
                this.redraw = false;
            }
        }
    }
}
//# sourceMappingURL=chart.js.map