import {Color, AnimationObject} from "../core/utils.js";
import {ANIMATION_PERIOD} from "../element/element.js";

/**
 * Class for drawing the selection line and circles.
 */
export default class SelectionDrawer {
    constructor(chartDrawer, gl) {
        //#region Fields

        //Core

        /**Chart drawer object.*/
        this.chartDrawer = chartDrawer;
        /**GL Object.*/
        this.gl = gl;

        //Custom properties
        /**Selection line color.*/
        this.color = new Color();

        //Animations

        this.animations = {
            projection: new AnimationObject([1, 0, 0, 0, 1, 0, 0, 0, 1]),
            points: new AnimationObject(Array.apply(null, Array(chartDrawer.chart.graphs.length)).map(x => 0))
        };

        //#endregion

        this._initializeAttributes();
    }

    //#region Properties
    get animating() {
        return Object.values(this.animations).some(x => x.inProgress);
    }
    //#endregion

    //#region Private methods
    _initializeAttributes() {
        /**Selection stack id*/
        this.stackLine = this.gl.newStack();

        this.gl.attributes.position = [0, -1, 0, 1];

        this.stackCircles = this.gl.newStack();
        this.gl.attributes.position = [0, 0];
    }

    _drawSelection(projection) {
        //Draw selection line
        this.gl.stack = this.stackLine;
        this.gl.uniforms.projection = projection;
        this.gl.uniforms.color = this.color.alpha(128).toArray();
        this.gl.drawStrip(2);
    }

    _drawCircles(points) {
        //Draw selected circles
        this.gl.stack = this.stackCircles;
        let circles = [];
        let colors = [];
        for (const i in points) {
            circles.push(0, points[i]);
            const colorArray = this.chartDrawer.graphDrawers[i].color.toArray();
            colors.push(colorArray[0], colorArray[1], colorArray[2], colorArray[3]);
        }
        this.gl.attributes.position = circles;
        this.gl.attributes.pointColor = colors;

        this.gl.uniforms.circle = true;
        this.gl.uniforms.windowSize = [this.gl.viewport.width, this.gl.viewport.height];
        this.gl.uniforms.clearColor = this.gl.clearColor;

        this.gl.drawPoints(points.length);

        this.gl.uniforms.circle = false;
    }
    //#endregion

    //#region Public methods
    /**
     * Draws the selection
     */
    draw(projection, selection) {
        if (!selection.value) return

        if (!this.chartDrawer.chart.stacked || this.chartDrawer.chart.percentage) {
            //Setting up animations
            this.animations.projection.set([
                1, 0, 0,
                0, 1, 0,
                selection.value.x * projection[0] + projection[6], 0, 1
            ], ANIMATION_PERIOD / 4);
            this.animations.points.set(selection.points, ANIMATION_PERIOD / 4);

            projection = this.animations.projection.get();
            const points = this.animations.points.get();

            this._drawSelection(projection);
            if (!this.chartDrawer.chart.percentage && points.length > 0) {
                this._drawCircles(points);
            }
        }
    }
    //#endregion
}