import * as THREE from 'three'
import { OrbitControls } from 'three/addons/controls/OrbitControls.js'
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js'
import { DRACOLoader } from 'three/addons/loaders/DRACOLoader.js'
import GUI from 'lil-gui'
import gsap from 'gsap'
import particlesVertexShader from './shaders/particles/vertex.glsl'
import particlesFragmentShader from './shaders/particles/fragment.glsl'

/**
 * Base
 */
// Debug
const gui = new GUI({ width: 340 })
const debugObject = {}

// Canvas
const canvas = document.querySelector('canvas.webgl')

// Scene
const scene = new THREE.Scene()
scene.fog = new THREE.Fog( 0xcccccc, 1, 15000);

// Loaders
const dracoLoader = new DRACOLoader()
dracoLoader.setDecoderPath('./draco/')
const gltfLoader = new GLTFLoader()
gltfLoader.setDRACOLoader(dracoLoader)

/**
 * Sizes
 */
const sizes = {
    width: window.innerWidth,
    height: window.innerHeight,
    pixelRatio: Math.min(window.devicePixelRatio, 2)
}

window.addEventListener('resize', () =>
{
    // Update sizes
    sizes.width = window.innerWidth
    sizes.height = window.innerHeight
    sizes.pixelRatio = Math.min(window.devicePixelRatio, 2)

    // Materials
    if(particles)
        particles.material.uniforms.uResolution.value.set(sizes.width * sizes.pixelRatio, sizes.height * sizes.pixelRatio)

    // Update camera
    camera.aspect = sizes.width / sizes.height
    camera.updateProjectionMatrix()

    // Update renderer
    renderer.setSize(sizes.width, sizes.height)
    renderer.setPixelRatio(sizes.pixelRatio)
})

/**
 * Camera
 */
// Base camera
const camera = new THREE.PerspectiveCamera(35, sizes.width / sizes.height, 0.1, 1000)
camera.position.set(0, 0, 8 * 10)
scene.add(camera)

// Controls
const controls = new OrbitControls(camera, canvas)
controls.enableDamping = true

/**
 * Renderer
 */
const renderer = new THREE.WebGLRenderer({
    canvas: canvas,
    antialias: true,
})

renderer.setSize(sizes.width, sizes.height)
renderer.setPixelRatio(sizes.pixelRatio)

debugObject.clearColor = '#160920'
gui.addColor(debugObject, 'clearColor').onChange(() => { renderer.setClearColor(debugObject.clearColor) })
renderer.setClearColor(debugObject.clearColor)

/**
 * Particles
 */
let particles = null
let earthGroup = new THREE.Group()

gltfLoader.load('./clean-earth.glb', (gltf) =>
{
    particles = {}
    particles.index = 0
    const position = gltf.scene.children[0].geometry.attributes.position;
    particles.maxCount = position.count;
    particles.positions = [];
    const originalArray = position.array;
    const newArray = new Float32Array(particles.maxCount * 3)
    const randomArray = new Float32Array(particles.maxCount * 3)

    for(let i = 0; i < particles.maxCount; i++) {
        const i3 = i * 3;

        newArray[i3 + 0] = originalArray[i3 + 0]
        newArray[i3 + 1] = originalArray[i3 + 1]
        newArray[i3 + 2] = originalArray[i3 + 2]

        randomArray[i3 + 0] = Math.random() * 120 - 60
        randomArray[i3 + 1] = Math.random() * 120 - 60
        randomArray[i3 + 2] = Math.random() * 120 - 60
    }

    particles.positions.push(new THREE.Float32BufferAttribute(randomArray, 3))
    particles.positions.push(new THREE.Float32BufferAttribute(newArray, 3))

    // Geometry
    particles.geometry = new THREE.BufferGeometry()
    particles.geometry.setAttribute('position', particles.positions[0])
    particles.geometry.setAttribute('aPositionTarget', particles.positions[1])
    particles.geometry.setAttribute('aSize', new THREE.BufferAttribute(originalArray, 1))


    // Material
    particles.colorA = '#ff7300'
    particles.colorB = '#0091ff'

    particles.material = new THREE.ShaderMaterial({
        vertexShader: particlesVertexShader,
        fragmentShader: particlesFragmentShader,
        uniforms:
        {
            uSize: new THREE.Uniform(0.2),
            uResolution: new THREE.Uniform(new THREE.Vector2(sizes.width * sizes.pixelRatio, sizes.height * sizes.pixelRatio)),
            uProgress: new THREE.Uniform(0),
            uColorA: new THREE.Uniform(new THREE.Color(particles.colorA)),
            uColorB: new THREE.Uniform(new THREE.Color(particles.colorB))
        },
        blending: THREE.AdditiveBlending,
        depthWrite: false
    })

    // Points
    particles.points = new THREE.Points(particles.geometry, particles.material)
    particles.points.frustumCulled = false
    earthGroup.add(particles.points)
    earthGroup.rotation.z = - Math.PI / 15
    scene.add(earthGroup)

    particles.morph = (index) => {
        // Update attributes
        particles.geometry.attributes.position = particles.positions[particles.index]
        particles.geometry.attributes.aPositionTarget = particles.positions[index]

        // Animate uProgress
        gsap.fromTo(
            particles.material.uniforms.uProgress,
            { value: 0 },
            { value: 1, duration: 5, ease: 'ease in/out' }
        )

        // Save index
        particles.index = index
    }
    
    // Tweaks
    gui.addColor(particles, 'colorA').onChange(() => { particles.material.uniforms.uColorA.value.set(particles.colorA) })
    gui.addColor(particles, 'colorB').onChange(() => { particles.material.uniforms.uColorB.value.set(particles.colorB) })

    gui.add(particles.material.uniforms.uProgress, 'value').min(0).max(1).step(0.001).name('uProgress').listen()

    particles.morph0 = () => { particles.morph(0) }
    particles.morph1 = () => { particles.morph(1) }

    gui.add(particles, 'morph0')
    gui.add(particles, 'morph1')
})

/**
 * Animate
 */
const tick = () =>
{
    // particles.points;
    if (particles)
        particles.points.rotation.y += 0.001;
        // debugger
    // Update controls
    controls.update()

    // Render normal scene
    renderer.render(scene, camera)

    // Call tick again on the next frame
    window.requestAnimationFrame(tick)
}

tick()
