uniform vec2 uResolution;
uniform float uSize;
uniform float uProgress;
uniform vec3 uColorA;
uniform vec3 uColorB;
uniform sampler2D uTexture0;
uniform sampler2D uTexture1;

attribute vec3 aPositionTarget;
attribute float aSize;
varying vec3 vColor;
varying vec2 vUv;

#include ../includes/simplexNoise3d.glsl

void main()
{
    vUv = uv;
    // Mixed position
    float noiseOrigin = simplexNoise3d(position * 0.2);
    float noiseTarget = simplexNoise3d(aPositionTarget * 0.2);
    float noise = mix(noiseOrigin, noiseTarget, uProgress);
    noise = smoothstep(-1.0, 1.0, noise);

    float duration = 0.4;
    float delay = (1.0 - duration) * noise;
    float end = delay + duration;
    float progress = smoothstep(delay, end, uProgress);
    vec3 mixedPosition = mix(position, aPositionTarget, progress);
    // Final position
    vec4 modelPosition = modelMatrix * vec4(mixedPosition, 1.0);
    vec4 viewPosition = viewMatrix * modelPosition;
    vec4 projectedPosition = projectionMatrix * viewPosition;
    gl_Position = projectedPosition;

    // Point size
    gl_PointSize = aSize * uSize * uResolution.y;
    gl_PointSize = 5.0;
    gl_PointSize *= (100.0 / - viewPosition.z);

    // Varyings
    // vec3 dayColor = texture(uDayTexture, vUv).rgb;
    // vColor = mix(uColorA, uColorB, noise);
    // vColor = texture(uTexture0, uv).rgb;
}
