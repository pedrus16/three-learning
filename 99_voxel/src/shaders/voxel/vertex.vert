uniform float uSize;

attribute float aScale;
attribute vec3 aRandomness;
attribute vec3 aNormal;
attribute vec3 aOffset;

varying vec2 vUv;
varying vec3 vColor;
varying vec3 vNormal;
varying vec3 vFragPos;
varying vec3 vViewPos;

void main()
{
    /**
    * Position
    */
    vec3 instancedPosition = position + aOffset;
    vec4 modelPosition = modelMatrix * vec4(instancedPosition, 1.0);

    vec4 viewPosition = viewMatrix * modelPosition;
    vec4 projectedPosition = projectionMatrix * viewPosition;
    gl_Position = projectedPosition;

    vFragPos = vec3(modelMatrix * vec4(position, 1.0));
    vViewPos = vec3(viewPosition);

    /**
    * Size
    */
    gl_PointSize = uSize * ( 1.0 / - viewPosition.z );

    vColor = color;

    vNormal = aNormal;
}