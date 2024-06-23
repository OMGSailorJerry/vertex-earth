import * as THREE from 'three'
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js'
import GUI from 'lil-gui'
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader'
import { DRACOLoader } from 'three/examples/jsm/loaders/DRACOLoader'

import particlesVertexShader from './shaders/particles/vertex.glsl'
import particlesFragmentShader from './shaders/particles/fragment.glsl'


/**
 * Base
 */
// Debug
const gui = new GUI()

// Canvas
const canvas = document.querySelector('canvas.webgl')

// Scene
const scene = new THREE.Scene()
/**
 *  Models
 */
const dracoLoader = new DRACOLoader()
dracoLoader.setDecoderPath('/draco/')
const gltfLoader = new GLTFLoader()
gltfLoader.setDRACOLoader(dracoLoader)
scene.background = new THREE.Color('#333');



let mixer = null
let particles = null

const sprite0 = new THREE.TextureLoader().load( 'textures/1.png' );
const sprite1 = new THREE.TextureLoader().load( 'textures/2.png' );

sprite0.colorSpace = THREE.SRGBColorSpace;
sprite1.colorSpace = THREE.SRGBColorSpace;


gltfLoader.load(
    '/models/Earth/clean-earth3.glb',
    (gltf) => {
        particles = {}
        particles.index = 0
        const newArray = new Float32Array(gltf.scene.children[0].geometry.attributes.position.array);
        particles.positions = [];
        particles.positions.push(new THREE.Float32BufferAttribute(newArray, 3))
        particles.geometry = new THREE.BufferGeometry()
        particles.geometry.setAttribute('position', particles.positions[0])
        particles.geometry.setAttribute('aPositionTarget', particles.positions[0])


        console.log(particles.positions[0].count);
        const sizesArray = new Float32Array(particles.positions[0].count)
        for(let i = 0; i < particles.positions[0].count; i++)
            sizesArray[i] = 3

        particles.geometry.setAttribute('aSize', new THREE.BufferAttribute(sizesArray, 1))
        
        // Material
        particles.colorA = '#ff7300'
        particles.colorB = '#0091ff'

        // particles.material = new THREE.PointsMaterial({
        //     map: sprite1,
        //     blending: THREE.AdditiveBlending,
        //     depthWrite: false
        // })
        particles.material = new THREE.ShaderMaterial({
            vertexShader: particlesVertexShader,
            fragmentShader: particlesFragmentShader,
            uniforms:
            {
                uTexture0: sprite0,
                uTexture1: sprite1,
                uSize: new THREE.Uniform(0.4),
                uResolution: new THREE.Uniform(new THREE.Vector2(sizes.width * sizes.pixelRatio, sizes.height * sizes.pixelRatio)),
                uProgress:  new THREE.Uniform(0),
                uColorA: new THREE.Uniform(new THREE.Color(particles.colorA)),
                uColorB: new THREE.Uniform(new THREE.Color(particles.colorB)),
            },
            blending: THREE.AdditiveBlending,
            depthWrite: false
        })

        particles.points = new THREE.Points(particles.geometry, particles.material)
        particles.points.frustumCulled = false;
        scene.add(particles.points)

        // gui.addColor(particles, 'colorA').onChange(() => { particles.material.uniforms.uColorA.value.set(particles.colorA) })
        // gui.addColor(particles, 'colorB').onChange(() => { particles.material.uniforms.uColorB.value.set(particles.colorB) })
        // gui.add(particles.material.uniforms.uProgress, 'value').min(0).max(1).step(0.001).name('uProgress').listen()
    }
)
/**
 * Sizes
 */
const sizes = {
    width: window.innerWidth,
    height: window.innerHeight
}

window.addEventListener('resize', () =>
{
    // Update sizes
    sizes.width = window.innerWidth
    sizes.height = window.innerHeight

    // Update camera
    camera.aspect = sizes.width / sizes.height
    camera.updateProjectionMatrix()

    // Update renderer
    renderer.setSize(sizes.width, sizes.height)
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
})

/**
 * Camera
 */
// Base camera
const camera = new THREE.PerspectiveCamera(75, sizes.width / sizes.height, 0.1, 1000000)
camera.position.set(2, 2, 2)
scene.add(camera)

// Controls
const controls = new OrbitControls(camera, canvas)
controls.target.set(0, 0.75, 0)
controls.enableDamping = true

/**
 * Renderer
 */
const renderer = new THREE.WebGLRenderer({
    canvas: canvas,
})
renderer.shadowMap.enabled = true
renderer.shadowMap.type = THREE.PCFSoftShadowMap
renderer.setSize(sizes.width, sizes.height)
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))

/**
 * Animate
 */
const clock = new THREE.Clock()
let previousTime = 0

const tick = () =>
{
    const elapsedTime = clock.getElapsedTime()
    const deltaTime = elapsedTime - previousTime
    previousTime = elapsedTime

    // Update Mixer
    if (mixer) {
        mixer.update(deltaTime)
    }

    // Update controls
    controls.update()

    // Render
    renderer.render(scene, camera)

    // Call tick again on the next frame
    window.requestAnimationFrame(tick)
}

tick()
