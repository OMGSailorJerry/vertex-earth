// varying vec3 vColor;
uniform sampler2D uTexture0;
uniform sampler2D uTexture1;
varying vec2 vUv;

void main()
{
    // vec2 uv = gl_PointCoord;
    // float distanceToCenter = length(uv - 0.5);
    // float alpha = 0.05 / distanceToCenter - 0.1;

    // gl_FragColor = vec4(1.0, 1.0, 1.0, 1);
    // gl_FragColor = vec4( color * vColor, 1.0 );
    // texture2D( uTexture0, uv ).xyz;
    // gl_FragColor = vec4(texture2D( uTexture0, vUv ).xyz, 1.0);
    gl_FragColor = vec4(1.0, 1.0, 1.0, 1.0);

    #include <tonemapping_fragment>
    #include <colorspace_fragment>
}
