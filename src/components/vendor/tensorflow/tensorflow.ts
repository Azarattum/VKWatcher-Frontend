import * as tf from "./libs/tf";

/**
 * Tensorflow lib wrapper
 */
export default class Tensorflow {
	private model: any | null = null;
	private modelUrl: string | null = null;

	/**
	 * Makes a prediction
	 * @param data Data to predict
	 */
	public async predict(
		data: number[][]
	): Promise<Float32Array | Int32Array | Uint8Array | null> {
		if (!this.ready) return null;

		const prediction = (tf as any).tidy(() => {
			return this.model.predict((tf as any).tensor2d(data));
		});
		const result = prediction.data();
		prediction.dispose();
		return result;
	}

	/**
	 * Loads the prediction model
	 * @param url Url to json model information
	 */
	public async loadModel(url: string): Promise<void> {
		this.modelUrl = url;

		this.model = await (tf as any).loadLayersModel(this.modelUrl);
	}

	/**
	 * Whether the library ready or not
	 */
	public get ready(): boolean {
		return this.model != null;
	}
}
