out vec3 vOrigin;
out vec3 vDirection;

void main() {
    vec4 mvPosition = modelViewMatrix * instanceMatrix * vec4( position, 1.0 );
    vOrigin = vec3( inverse( instanceMatrix * modelMatrix ) * vec4( cameraPosition, 1.0 ) ).xyz;
    vDirection = position - vOrigin;
    gl_Position = projectionMatrix * mvPosition;
}