precision highp float;
precision highp sampler3D;

in vec3 vOrigin;
in vec3 vDirection;

uniform sampler3D uMap;
uniform vec3 uSize;
uniform float uThreshold;
uniform float uResolutionMultiplier;
uniform float uNormalSampling;

out vec4 color;

vec2 hitBox( vec3 orig, vec3 dir ) {
    float maxSize = max(uSize.x, max(uSize.y, uSize.z));
    vec3 box_min = vec3(-uSize.x / maxSize, -uSize.y / maxSize, -uSize.z / maxSize) * 0.5;
    vec3 box_max = vec3(uSize.x / maxSize, uSize.y / maxSize, uSize.z / maxSize)  * 0.5;
    vec3 inv_dir = 1.0 / dir;
    vec3 tmin_tmp = ( box_min - orig ) * inv_dir;
    vec3 tmax_tmp = ( box_max - orig ) * inv_dir;
    vec3 tmin = min( tmin_tmp, tmax_tmp );
    vec3 tmax = max( tmin_tmp, tmax_tmp );
    float t0 = max( tmin.x, max( tmin.y, tmin.z ) );
    float t1 = min( tmax.x, min( tmax.y, tmax.z ) );
    return vec2( t0, t1 );
}

float sample1( vec3 p ) {
    float maxSize = max(uSize.x, max(uSize.y, uSize.z));
    vec3 scale = vec3(uSize.x / maxSize, uSize.y / maxSize, uSize.z / maxSize);
    return texture(uMap, p).a;
}

#define epsilon .0001

vec3 normal( vec3 coord ) {
    if ( coord.x < epsilon ) return vec3( -1.0, 0.0, 0.0 );
    if ( coord.y < epsilon ) return vec3( 0.0, -1.0, 0.0 );
    if ( coord.z < epsilon ) return vec3( 0.0, 0.0, -1.0 );
    if ( coord.x > 1.0 - epsilon ) return vec3( 1.0, 0.0, 0.0 );
    if ( coord.y > 1.0 - epsilon ) return vec3( 0.0, 1.0, 0.0 );
    if ( coord.z > 1.0 - epsilon ) return vec3( 0.0, 0.0, 1.0 );
    vec3 step = 1.0 / uSize / uNormalSampling;
    float x = sample1( coord + vec3( - step.x, 0.0, 0.0 ) ) - sample1( coord + vec3( step.x, 0.0, 0.0 ) );
    float y = sample1( coord + vec3( 0.0, - step.y, 0.0 ) ) - sample1( coord + vec3( 0.0, step.y, 0.0 ) );
    float z = sample1( coord + vec3( 0.0, 0.0, - step.z ) ) - sample1( coord + vec3( 0.0, 0.0, step.z ) );
    return normalize( vec3( x, y, z ) );
}

void main() {
    float maxSize = max(uSize.x, max(uSize.y, uSize.z));
    vec3 scale = vec3(uSize.x / maxSize, uSize.y / maxSize, uSize.z / maxSize);

    vec3 rayDir = normalize( vDirection );
    vec2 bounds = hitBox( vOrigin, rayDir );
    if ( bounds.x > bounds.y ) discard;
    bounds.x = max( bounds.x, 0.0 );
    vec3 p = (vOrigin + bounds.x * rayDir ) / scale;
    vec3 inc = 1.0 / abs( rayDir );
    float delta = min( inc.x, min( inc.y, inc.z ) );
    delta /= maxSize * (uResolutionMultiplier + 0.1 /* Slightly bigger resolution to avoid Z fighting issues */);
    for ( float t = bounds.x; t < bounds.y; t += delta ) {
        float d = sample1( p + 0.5 );
        if ( d > uThreshold ) {
            vec3 norm = normal( p + 0.5 );
            color = texture(uMap, p + 0.5).rgba;

            /* Ambient Light */
            float ambientStrength = 0.25;
            vec3 ambient = ambientStrength * color.rgb;

            /* Directional Light */
            vec3 lightColor = vec3(1.0, 1.0, 1.0);
            vec3 directionLight = normalize(vec3(-1.0, 1.0, 1.0));
            float diff = max(dot(norm, directionLight), 0.0);
            vec3 diffuse = diff * lightColor;

            color = vec4((ambient + diffuse) * color.rgb, 1.0);

            break;
        }
        p += rayDir * delta / scale;
    }
    if ( color.a == 0.0 ) discard;
}