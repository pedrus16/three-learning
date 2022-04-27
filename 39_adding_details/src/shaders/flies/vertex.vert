uniform float uTime;
uniform float uSize;
uniform float uPixelRatio;

attribute float aScale;
attribute float aSpeed;

#define SPEED 2.0

void main()
{
    vec4 modelPosition = modelMatrix * vec4(position, 1.0);

    modelPosition.x += sin(uTime * aSpeed * SPEED) * 0.5;
    modelPosition.y += sin(uTime * aSpeed * 4.0) * 0.05;
    modelPosition.z += cos(uTime * aSpeed * SPEED) * 0.5;

    vec4 viewPosition = viewMatrix * modelPosition;
    vec4 projectionPosition = projectionMatrix * viewPosition;

    gl_Position = projectionPosition;
    gl_PointSize = uSize * aScale * uPixelRatio / -viewPosition.z;
}