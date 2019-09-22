export default class Slider {
    constructor(container, settings) {
        if (!container)
            throw new Error("Invalid container element!");
        this.container = container;
        this.element =
            $($(container).ionRangeSlider(settings))
                .data("ionRangeSlider");
    }
    update(settings) {
        this.element.update(settings);
    }
}
//# sourceMappingURL=index.class.js.map