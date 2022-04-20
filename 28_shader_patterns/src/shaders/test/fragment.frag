precision mediump float;

uniform vec3 uColor;
uniform sampler2D uTexture;
uniform float uTime;

varying float vRandom;
varying vec2 vUv;
varying float vElevation;

#define PI 3.1415926535897932384626433832795

/* Horizontal Gradient */
vec3 pattern3()
{
    return vec3(vUv.x);
}

/* Vertical Gradient */
vec3 pattern4()
{
    return vec3(vUv.y);
}

/* Inverted Vertical Gradient */
vec3 pattern5()
{
    float strength = 1.0 - vUv.y;
    return vec3(strength);
}

/* Vertical Gradient Strength */
vec3 pattern6()
{
    float strength = vUv.y * 10.0;
    return vec3(strength);
}

/* Multiple Horizontal Gradients */
vec3 pattern7()
{
    float strength = mod(vUv.y * 10.0, 1.0);
    return vec3(strength);
}

/* Horizontal Lines */
vec3 pattern8()
{
    float strength = step(0.5, mod(vUv.y * 10.0, 1.0));
    return vec3(strength);
}

/* Slim Horizontal Lines */
vec3 pattern9()
{
    float strength = step(0.8, mod(vUv.y * 10.0, 1.0));
    return vec3(strength);
}

/* Slim Vertical Lines */
vec3 pattern10()
{
    float strength = step(0.8, mod(vUv.x * 10.0, 1.0));
    return vec3(strength);
}

/* Grid Lines */
vec3 pattern11()
{
    float strength = step(0.8, mod(vUv.y * 10.0, 1.0)) + step(0.8, mod(vUv.x * 10.0, 1.0));
    strength = clamp(strength, 0.0, 1.0);
    return vec3(strength);
}

/* Grid Dots */
vec3 pattern12()
{
    float strength = step(0.8, mod(vUv.y * 10.0, 1.0)) * step(0.8, mod(vUv.x * 10.0, 1.0));
    return vec3(strength);
}

/* Grid Dashes */
vec3 pattern13()
{
    float strength = step(0.8, mod(vUv.y * 10.0, 1.0)) * step(0.4, mod(vUv.x * 10.0, 1.0));
    return vec3(strength);
}

/* Grid Angles */
vec3 pattern14()
{
    float barX = step(0.8, mod(vUv.y * 10.0, 1.0)) * step(0.4, mod(vUv.x * 10.0, 1.0));
    float barY = step(0.4, mod(vUv.y * 10.0, 1.0)) * step(0.8, mod(vUv.x * 10.0, 1.0));
    float strength = clamp(barX + barY, 0.0, 1.0);
    return vec3(strength);
}

/* Grid Crosses */
vec3 pattern15()
{
    float barX = step(0.8, mod(vUv.y * 10.0, 1.0)) * step(0.4, mod(vUv.x * 10.0 - 0.2, 1.0));
    float barY = step(0.4, mod(vUv.y * 10.0 - 0.2, 1.0)) * step(0.8, mod(vUv.x * 10.0, 1.0));
    float strength = clamp(barX + barY, 0.0, 1.0);
    return vec3(strength);
}

/* Mirror Gradient Y */
vec3 pattern16()
{
    float strength = abs(vUv.x - 0.5) * 2.0;
    return vec3(strength);
}

/* Mirror Gradient XY */
vec3 pattern17()
{
    float strength = min(abs(vUv.x - 0.5) * 2.0, abs(vUv.y - 0.5) * 2.0);
    return vec3(strength);
}

/* Mirror Gradient XY Inverse */
vec3 pattern18()
{
    float strength = max(abs(vUv.x - 0.5) * 2.0, abs(vUv.y - 0.5) * 2.0);
    return vec3(strength);
}

/* Square Fat */
vec3 pattern19()
{
    float strength = step(0.5, max(abs(vUv.x - 0.5) * 2.0, abs(vUv.y - 0.5) * 2.0));
    return vec3(strength);
}

/* Square Smaller */
vec3 pattern20()
{
    float strength = step(0.2, max(abs(vUv.x - 0.5) * 2.0, abs(vUv.y - 0.5) * 2.0)); 
    strength *= 1.0 - step(0.5, max(abs(vUv.x - 0.5) * 2.0, abs(vUv.y - 0.5) * 2.0));
    return vec3(strength);
}

/* Step Gradient X */
vec3 pattern21()
{
    float strength = floor(vUv.x * 10.0) / 10.0;
    return vec3(strength);
}

/* Step Gradient XY */
vec3 pattern22()
{
    float strength = floor(vUv.x * 10.0) / 10.0 * floor(vUv.y * 10.0) / 10.0;
    return vec3(strength);
}

/* Random Noise */
float random(vec2 st)
{
    return fract(sin(dot(st.xy, vec2(12.9898,78.233))) * 43758.5453123);
}

vec3 pattern23()
{
    float strength = random(vUv);
    return vec3(strength);
}

/* Grid Noise */
vec3 pattern24()
{
    vec2 gridUv = vec2(floor(vUv.x * 10.0) / 10.0, floor(vUv.y * 10.0) / 10.0);
    float strength = random(gridUv);
    return vec3(strength);
}

/* Grid Noise Skewed */
vec3 pattern25()
{
    vec2 gridUv = vec2(floor(vUv.x * 10.0) / 10.0, floor((vUv.y + vUv.x * .5) * 10.0) / 10.0);
    float strength = random(gridUv);
    return vec3(strength);
}

/* Radial Gradiant */
vec3 pattern26()
{
    return vec3(length(vUv));
}

/* Radial Gradiant from Center */
vec3 pattern27()
{
    return vec3(distance(vUv, vec2(0.5)) * 2.0);
}

/* Inverted Radial Gradiant from Center */
vec3 pattern28()
{
    return vec3(1.0 - distance(vUv, vec2(0.5)) * 2.0);
}

/* Light Dot */
vec3 pattern29()
{
    return vec3(.015 / distance(vUv, vec2(0.5)));
}

/* Light Dot Stretched */
vec3 pattern30()
{
    float strength = 0.15 / distance(vec2(vUv.x, (vUv.y - 0.5) * 5.0 + 0.5), vec2(0.5));
    return vec3(strength);
}

/* Star */
vec3 pattern31()
{
    float strength = 0.15 / distance(vec2(vUv.x, (vUv.y - 0.5) * 5.0 + 0.5), vec2(0.5)) * 0.15 / distance(vec2(vUv.y, (vUv.x - 0.5) * 5.0 + 0.5), vec2(0.5));
    return vec3(strength);
}

/* Star Diagonal */
vec2 rotate(vec2 uv, float rotation, vec2 mid)
{
    return vec2(
      cos(rotation) * (uv.x - mid.x) + sin(rotation) * (uv.y - mid.y) + mid.x,
      cos(rotation) * (uv.y - mid.y) - sin(rotation) * (uv.x - mid.x) + mid.y
    );
}

vec3 pattern32()
{
    vec2 rotatedUv = rotate(vUv, PI * 0.25, vec2(0.5));
    float strength = 0.15 / distance(vec2(rotatedUv.x, (rotatedUv.y - 0.5) * 5.0 + 0.5), vec2(0.5)) * 0.15 / distance(vec2(rotatedUv.y, (rotatedUv.x - 0.5) * 5.0 + 0.5), vec2(0.5));
    return vec3(strength);
}

/* Disk */
vec3 pattern33()
{
    float strength = step(0.5, distance(vUv, vec2(0.5)) * 2.0);
    return vec3(strength);
}

/* Gradient Donut */
vec3 pattern34()
{
    float strength = abs(distance(vUv, vec2(0.5)) - 0.25);
    return vec3(strength);
}

/* Circle B on W */
vec3 pattern35()
{
    float strength = step(0.05, abs(distance(vUv, vec2(0.5)) - 0.25));
    return vec3(strength);
}

/* Circle W on B */
vec3 pattern36()
{
    float strength = 1.0 - step(0.05, abs(distance(vUv, vec2(0.5)) - 0.25));
    return vec3(strength);
}

/* Wave Circle */
vec3 pattern37()
{
    vec2 wavedUv = vec2(
        vUv.x,
        vUv.y + sin(vUv.x * 30.0) * 0.1
    );

    float strength = 1.0 - step(0.01, abs(distance(wavedUv, vec2(0.5)) - 0.25));
    return vec3(strength);
}

/* Wave Circle 2 */
vec3 pattern38()
{
    vec2 wavedUv = vec2(
        vUv.x + sin(vUv.y * 30.0 + uTime) * 0.1,
        vUv.y + sin(vUv.x * 30.0 + uTime) * 0.1
    );

    float strength = 1.0 - step(0.01, abs(distance(wavedUv, vec2(0.5)) - 0.25));
    return vec3(strength);
}

/* Wave Circle 2 */
vec3 pattern39()
{
    vec2 wavedUv = vec2(
        vUv.x + sin(vUv.y * 100.0) * 0.1,
        vUv.y + sin(vUv.x * 100.0) * 0.1
    );

    float strength = 1.0 - step(0.01, abs(distance(wavedUv, vec2(0.5)) - 0.25));
    return vec3(strength);
}

/* UV Angle */
vec3 pattern40()
{
    float angle = atan(vUv.x, vUv.y);
    float strength = angle;

    return vec3(strength);
}

/* UV Angle Center */
vec3 pattern41()
{
    float angle = atan(vUv.x - 0.5, vUv.y - 0.5) ;
    float strength = angle;

    return vec3(strength);
}

/* UV Angle Normalized */
vec3 pattern42()
{
    float angle = atan(vUv.x - 0.5, vUv.y - 0.5) / (PI * 2.0) + 0.5;
    float strength = angle;

    return vec3(strength);
}

/* Sun Rays */
vec3 pattern43()
{
    float angle = atan(vUv.x - 0.5, vUv.y - 0.5) / (PI * 2.0) + 0.5;
    float strength = mod(angle * 20.0, 1.0);
    return vec3(strength);
}

/* Sun Rays 2 */
vec3 pattern44()
{
    float angle = atan(vUv.x - 0.5, vUv.y - 0.5) / (PI * 2.0) + 0.5;
    float strength = sin(angle * 100.0);
    return vec3(strength);
}

/* Wavy Circle */
vec3 pattern45()
{
    float angle = atan(vUv.x - 0.5, vUv.y - 0.5) / (PI * 2.0) + 0.5;
    float radius = 0.25 + sin(angle * 100.0) * 0.02;
    float strength = 1.0 - step(0.01, abs(distance(vUv, vec2(0.5)) - radius));
    return vec3(strength);
}

/* Perlin Noise */
vec4 permute(vec4 x)
{
    return mod(((x*34.0)+1.0)*x, 289.0);
}

vec2 fade(vec2 t)
{
    return t*t*t*(t*(t*6.0-15.0)+10.0);
}

float cnoise(vec2 P)
{
    vec4 Pi = floor(P.xyxy) + vec4(0.0, 0.0, 1.0, 1.0);
    vec4 Pf = fract(P.xyxy) - vec4(0.0, 0.0, 1.0, 1.0);
    Pi = mod(Pi, 289.0); // To avoid truncation effects in permutation
    vec4 ix = Pi.xzxz;
    vec4 iy = Pi.yyww;
    vec4 fx = Pf.xzxz;
    vec4 fy = Pf.yyww;
    vec4 i = permute(permute(ix) + iy);
    vec4 gx = 2.0 * fract(i * 0.0243902439) - 1.0; // 1/41 = 0.024...
    vec4 gy = abs(gx) - 0.5;
    vec4 tx = floor(gx + 0.5);
    gx = gx - tx;
    vec2 g00 = vec2(gx.x,gy.x);
    vec2 g10 = vec2(gx.y,gy.y);
    vec2 g01 = vec2(gx.z,gy.z);
    vec2 g11 = vec2(gx.w,gy.w);
    vec4 norm = 1.79284291400159 - 0.85373472095314 * vec4(dot(g00, g00), dot(g01, g01), dot(g10, g10), dot(g11, g11));
    g00 *= norm.x;
    g01 *= norm.y;
    g10 *= norm.z;
    g11 *= norm.w;
    float n00 = dot(g00, vec2(fx.x, fy.x));
    float n10 = dot(g10, vec2(fx.y, fy.y));
    float n01 = dot(g01, vec2(fx.z, fy.z));
    float n11 = dot(g11, vec2(fx.w, fy.w));
    vec2 fade_xy = fade(Pf.xy);
    vec2 n_x = mix(vec2(n00, n01), vec2(n10, n11), fade_xy.x);
    float n_xy = mix(n_x.x, n_x.y, fade_xy.y);
    return 2.3 * n_xy;
}

vec3 pattern46()
{
    float strength = cnoise(vUv * 10.0);
    return vec3(strength);
}

vec3 pattern47()
{
    float strength = step(0.1, cnoise(vUv * 10.0));
    return vec3(strength);
}

vec3 pattern48()
{
    float strength = 1.0 - abs(cnoise(vUv * 10.0));
    return vec3(strength);
}

vec3 pattern49()
{
    float strength = sin(cnoise(vUv * 10.0) * 20.0);
    return vec3(strength);
}

vec3 pattern50()
{
    float strength = step(0.9, sin(cnoise(vUv * 10.0) * 20.0));
    return vec3(strength);
}

/* Colors */
vec3 mixColor(vec3 mask)
{
    vec3 blackColor = vec3(0.0);
    vec3 uvColor = vec3(vUv, 1.0);
    vec3 mixedColor = mix(blackColor, uvColor, mask);
    return mixedColor;
}

void main()
{
    gl_FragColor = vec4(mixColor(pattern15()), 1.0);
}