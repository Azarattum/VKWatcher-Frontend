import * as TensorFlow from "./libs/tf.js";

export default class Tensorflow {
	public tf: any;
	public constructor() {
		this.tf = TensorFlow;
	}
}
