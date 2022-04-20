precision mediump float;

uniform float uTime;
uniform vec3 uDepthColor;
uniform vec3 uSurfaceColor;
uniform float uColorOffset;
uniform float uColorMultiplier;

varying vec2 vUv;
varying float vElevation;

#define PI 3.1415926535897932384626433832795

void main()
{
    vec3 color = mix(uDepthColor, uSurfaceColor, (vElevation + uColorOffset) * uColorMultiplier);
    gl_FragColor = vec4(color, 1.0);
}