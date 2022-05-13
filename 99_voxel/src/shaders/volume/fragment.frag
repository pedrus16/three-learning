precision highp float;
precision highp sampler3D;

in vec3 vOrigin;
in vec3 vDirection;
in mat4 vInverseInstanceMatrix;
in vec3 vFragPos;

uniform mat4 modelViewMatrix;
uniform mat4 projectionMatrix;
uniform mat3 normalMatrix;

uniform sampler3D uMap;
uniform sampler3D uNormal;
uniform vec3 uSize;
uniform float uThreshold;
uniform float uResolutionMultiplier;
uniform vec3 uViewPos;

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
    return texture(uMap, p).a;
}

#define epsilon .0001

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
            /* Normal */
            vec3 normal = texture(uNormal, p + 0.5 ).xyz;
            normal = normal * 2.0 - 1.0;
            normal = normalize(vec3(vec4(normal, 0.0) * vInverseInstanceMatrix));

            color = texture(uMap, p + 0.5).rgba;

            /* Ambient Light */
            float ambientStrength = 0.5;
            vec3 ambient = ambientStrength * color.rgb;

            /* Directional Light */
            vec3 lightColor = vec3(1.5);
            vec3 directionLight = normalize(vec3(1.0, 1.0, 1.0));
            float diff = max(dot(normal, directionLight), 0.0);
            vec3 diffuse = diff * lightColor;

            /* Specular Light */
            float specularStrength = 1.0;
            vec3 viewDir = normalize(uViewPos - vFragPos);
            vec3 reflectDir = reflect(-directionLight, normal);  
            float spec = pow(max(dot(viewDir, reflectDir), 0.0), 4.0);
            vec3 specular = specularStrength * spec * lightColor;  

            color = vec4((ambient + diffuse + specular) * color.rgb, 1.0);

            /* DEBUG SPEC */
            // color = vec4(vec3(spec), 1.0);

            /* DEBUG NORMAL */
            // color = vec4(normal, 1.0);
            // color = color * vec4(1.0, 1.0, 1.0, 1.0);

            break;
        }
        p += rayDir * delta / scale;
    }
    if ( color.a == 0.0 ) discard;
}