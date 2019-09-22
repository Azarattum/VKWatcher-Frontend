attribute vec2 position;
attribute vec4 pointColor;

uniform mat3 projection;
uniform vec4 color;
uniform vec2 windowSize;
uniform bool circle;

varying vec4 resultColor;
varying vec2 pointPos;
varying float radius;

void main() {
	gl_Position = vec4(projection * vec3(position, 1.), 1.);
	gl_PointSize = windowSize.y / 24.;

	resultColor = circle ? pointColor : color;

	vec2 halfsize = vec2(windowSize.x, windowSize.y) * 0.5;
  	pointPos = halfsize + ((gl_Position.xy / gl_Position.w) * halfsize);
	radius = gl_PointSize * 0.5;
}