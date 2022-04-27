precision mediump float;

#define PI 3.1415926535897932384626433832795
#define FALLOFF 4.0

void main()
{
    vec3 color = vec3(0.2);
    float strength = (1.0 - distance(gl_PointCoord, vec2(0.5)) * 2.0) * FALLOFF;
    gl_FragColor = vec4(color, strength);
}