export default class Slider {
    private container: HTMLElement;
    private element: any;

    constructor(container: HTMLElement | null, settings: ISliderSettings) {
        if (!container) throw new Error("Invalid container element!");
        this.container = container;
        this.element =
            ($(($(container) as any).ionRangeSlider(settings)) as any)
                .data("ionRangeSlider");
    }

    update(settings: ISliderSettings) {
        this.element.update(settings);
    }
}

export interface ISliderSettings {
    type?: "double" | "single";
    min?: number;
    max?: number;
    step?: number;
    from?: number;
    to?: number;
    drag_interval?: boolean;
    grid?: boolean;
    prettify?: (value: number) => string;
    onFinish?: (state: { from: number, to: number }) => void;
    onChange?: (state: { from: number, to: number }) => void;
}