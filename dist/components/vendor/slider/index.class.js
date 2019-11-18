export default class Slider {
    constructor(container, settings) {
        if (!container)
            throw new Error("Invalid container element!");
        settings["drag_interval"] = settings.dragInterval;
        this.element = $($(container).ionRangeSlider(settings)).data("ionRangeSlider");
    }
    update(settings) {
        settings["drag_interval"] = settings.dragInterval;
        this.element.update(settings);
    }
}
//# sourceMappingURL=index.class.js.map