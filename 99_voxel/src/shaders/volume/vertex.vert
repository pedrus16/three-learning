out vec3 vOrigin;
out vec3 vDirection;
out mat4 vInverseInstanceMatrix;

out vec3 vFragPos;

void main() {
    vec4 mvPosition = modelViewMatrix * instanceMatrix * vec4( position, 1.0 );
    vOrigin = vec3( inverse( instanceMatrix * modelMatrix ) * vec4( cameraPosition, 1.0 ) ).xyz;
    vDirection = position - vOrigin;
    vInverseInstanceMatrix = inverse(instanceMatrix);

    vFragPos = vec3(modelMatrix * instanceMatrix * vec4(position, 1.0));

    gl_Position = projectionMatrix * mvPosition;
}