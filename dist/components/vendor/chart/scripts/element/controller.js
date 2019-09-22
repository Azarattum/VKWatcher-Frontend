export default class ChartController {
    /**
     * Creates an interactive chart controller.
     * @param {Element} selector Chart area selector element.
     * @param {Element} leftDragger Area left side dragger element.
     * @param {Element} rightDragger Area right side dragger element.
     * @param {Function} onupdate Callback on controller's update.
     */
    constructor(selector, leftDragger, rightDragger, field) {
        //#region Properties
        /**Chart area selector element.*/
        this.selector = selector;
        /**Chart drawing element.*/
        this.field = field;
        /**Border width style of the selector element.*/
        this.borderWidth =
            parseInt(window.getComputedStyle(selector)["border-left-width"]) *
                2;
        /**Minimum width style of the selector element.*/
        this.minWidth =
            parseInt(window.getComputedStyle(selector)["min-width"]) +
                this.borderWidth;
        /**Old element position for dragging.*/
        this.positionOld = 0;
        /**New element position for dragging.*/
        this.positionNew = 0;
        /**Callback on controller's update.*/
        this.onupdate = (start, end) => { };
        /**Callback on changed field selection.*/
        this.onselect = () => { };
        //#endregion
        //#region Events Registration
        leftDragger.onmousedown = e => {
            this.startDrag(e, 1);
        };
        leftDragger.ontouchstart = e => {
            this.startDrag(e, 1);
        };
        rightDragger.onmousedown = e => {
            this.startDrag(e, 2);
        };
        rightDragger.ontouchstart = e => {
            this.startDrag(e, 2);
        };
        selector.onmousedown = e => {
            this.startDrag(e, 0);
        };
        selector.ontouchstart = e => {
            this.startDrag(e, 0);
        };
        field.onmousemove = e => {
            this.select(e, true);
        };
        field.onmouseleave = e => {
            this.select(e, false);
        };
        field.ontouchstart = e => {
            this.select(e, true);
        };
        field.ontouchmove = e => {
            this.select(e, true);
        };
        field.ontouchend = e => {
            this.select(e, false);
        };
        //#endregion
        console.debug("ChartController created", this);
    }
    /**
     * Updates current selection state and invokes callback.
     * @param {Object} eventArgs Event arguments.
     * @param {Bool} visible Whethe selection is visible now or not.
     */
    select(eventArgs, visible) {
        if (!eventArgs.offsetX &&
            eventArgs.touches &&
            eventArgs.touches.length > 0) {
            eventArgs.offsetX =
                eventArgs.targetTouches[0].pageX -
                    eventArgs.target.getBoundingClientRect().left;
        }
        eventArgs.preventDefault();
        let percent = eventArgs.offsetX / this.field.clientWidth;
        this.onselect(eventArgs.offsetX, percent, visible);
    }
    /**
     * Starts element dragging.
     * @param {Object} eventArgs Event arguments.
     * @param {Number} type Type of dragging (0-2).
     */
    startDrag(eventArgs, type) {
        eventArgs = eventArgs || window.event;
        if (!eventArgs.clientX && eventArgs.touches) {
            eventArgs.clientX = eventArgs.touches[0].clientX;
        }
        eventArgs.stopPropagation();
        eventArgs.preventDefault();
        //Save the old postion and register the events
        this.positionOld = eventArgs.clientX;
        document.onmouseup = e => {
            this.stopDrag();
        };
        document.ontouchend = e => {
            this.stopDrag();
        };
        document.onmousemove = e => {
            this.drag(e, type);
        };
        document.ontouchmove = e => {
            this.drag(e, type);
        };
    }
    /**
     * Performs element dragging.
     * @param {Object} eventArgs Event arguments.
     * @param {Number} type Type of dragging (0-2).
     */
    drag(eventArgs, type) {
        eventArgs = eventArgs || window.event;
        if (!eventArgs.clientX && eventArgs.touches) {
            eventArgs.clientX = eventArgs.touches[0].clientX;
        }
        eventArgs.preventDefault();
        //Calculate the new position
        this.positionNew = this.positionOld - eventArgs.clientX;
        this.positionOld = eventArgs.clientX;
        //Set the style
        if (type === 0) {
            let left = this.selector.offsetLeft - this.positionNew;
            if (left < 0)
                left = 0;
            this.selector.style.left = left + "px";
        }
        else if (type === 1) {
            let width = this.selector.clientWidth + this.positionNew;
            let left = this.selector.offsetLeft - this.positionNew;
            if (width < this.minWidth) {
                left += width - this.minWidth;
                width = this.minWidth;
            }
            if (left < 0) {
                width -= -left;
                left = 0;
            }
            this.selector.style.left = left + "px";
            this.selector.style.width = width + "px";
        }
        else if (type === 2) {
            let width = this.selector.clientWidth - this.positionNew;
            if (width + this.selector.offsetLeft + this.borderWidth >
                this.selector.parentNode.clientWidth) {
                width = this.selector.clientWidth;
            }
            this.selector.style.width = width + "px";
        }
        this.normalize();
        this.update();
    }
    /**
     * Stops element dragging.
     */
    stopDrag() {
        //Clear the events
        document.onmouseup = null;
        document.ontouchend = null;
        document.onmousemove = null;
        document.ontouchmove = null;
    }
    /**
     * Makes sure that the element is inside boudary box if not normalizes.
     */
    normalize() {
        if (parseInt(this.selector.style.left) < 0) {
            this.selector.style.left = "0px";
        }
        if (parseInt(this.selector.style.left) +
            this.selector.clientWidth +
            this.borderWidth >
            this.selector.parentNode.clientWidth) {
            this.selector.style.left =
                this.selector.parentNode.clientWidth -
                    this.selector.clientWidth -
                    this.borderWidth +
                    "px";
        }
    }
    /**
     * Updates current state of the controller and invokes callback.
     */
    update() {
        let size = this.selector.parentNode.clientWidth;
        let start = this.selector.offsetLeft / size;
        let end = (this.selector.offsetLeft +
            this.selector.clientWidth +
            this.borderWidth) /
            size;
        this.onupdate(start, end);
    }
    get dragging() {
        return !(document.onmouseup == null &&
            document.ontouchend == null &&
            document.onmousemove == null &&
            document.ontouchmove == null);
    }
}
//# sourceMappingURL=controller.js.map