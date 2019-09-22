precision mediump float;

uniform vec4 color;
varying float opacity;

void main() {
    gl_FragColor = vec4(color.rgb, color.a * opacity);
}