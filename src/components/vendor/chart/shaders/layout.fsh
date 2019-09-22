precision mediump float;

uniform vec4 clearColor;
uniform bool circle;

varying vec4 resultColor;
varying vec2 pointPos;
varying float radius;

void main() {
    vec4 color = resultColor;
    
    color = mix(clearColor, color, smoothstep(0.6, 0.85, distance(gl_FragCoord.xy, pointPos) / radius * 1.5));
    color.a *= smoothstep(1., 0.85, distance(gl_FragCoord.xy, pointPos) / radius);
    color.a = min(color.a, resultColor.a);

    gl_FragColor = circle ? color : resultColor;
}