precision mediump float;

uniform float uTime;

varying vec2 vUv;
varying vec3 vColor;

#define PI 3.1415926535897932384626433832795

vec2 rotate(vec2 uv, float rotation, vec2 mid)
{
    return vec2(
      cos(rotation) * (uv.x - mid.x) + sin(rotation) * (uv.y - mid.y) + mid.x,
      cos(rotation) * (uv.y - mid.y) - sin(rotation) * (uv.x - mid.x) + mid.y
    );
}

vec3 star(vec2 uv)
{
    float strength = 0.15 / distance(vec2(uv.x, (uv.y - 0.5) * 5.0 + 0.5), vec2(0.5)) * 0.15 / distance(vec2(uv.y, (uv.x - 0.5) * 5.0 + 0.5), vec2(0.5));
    return vec3(strength);
}

vec3 diagonalStar()
{
    return star(rotate(gl_PointCoord, PI * 0.25, vec2(0.5)));
}


void main()
{
    vec3 color = mix(vec3(0.0), vColor, star(gl_PointCoord));
    gl_FragColor = vec4(color, 1.0);
}