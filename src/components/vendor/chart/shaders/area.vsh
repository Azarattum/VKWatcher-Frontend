attribute vec2 position;
attribute float pointer;
attribute float base;
/*/repeat count/*/
attribute float sum/*/i/*/;
/*/repeat count/*/
attribute float upper/*/i/*/;

uniform float visible[/*/count/*/];
uniform mat3 projection;

uniform int selected;
varying float opacity;

void main() {
	vec3 tranformed = vec3(position, 1.);
	float upwards = 0.;
	float sums = 0.;
	/*/repeat count/*/
	upwards += upper/*/i/*/ * visible[/*/i/*/];
	/*/repeat count/*/
	sums += sum/*/i/*/ * visible[/*/i/*/];

	if (base == 0.) {
		tranformed.y = (tranformed.y + 1.) * visible[/*/current/*/] - 1.;
	}

	tranformed.y += upwards;
	tranformed.y = (tranformed.y + 1.) / (sums + upwards) * 2. - 1.;

	gl_Position = vec4(projection * tranformed, 1.0);
	gl_PointSize = 1.0;
}