precision mediump float;

uniform vec3 uViewPos;

varying vec2 vUv;
varying vec3 vColor;
varying vec3 vNormal;
varying vec3 vFragPos;


void main()
{
    vec3 normal = normalize(vNormal);

    float ambient = 0.56;
    float specularStrength = 2.0;

    vec3 lightColor = vec3(1.2);
    vec3 lightDir = normalize(vec3(1.0, 0.0, 1.0));

    float diff = max(dot(normal, lightDir), 0.0);
    vec3 diffuse = diff * lightColor;

    vec3 viewDir = normalize(uViewPos - vFragPos);
    vec3 reflectDir = reflect(-lightDir, normal);  
    float spec = pow(max(dot(viewDir, reflectDir), 0.0), 256.0);
    vec3 specular = specularStrength * spec * lightColor;  

    vec3 color = (ambient + diffuse + specular) * vColor;
    gl_FragColor = vec4(color, 1.0);
}