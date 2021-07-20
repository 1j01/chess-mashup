
if (!Detector.webgl) Detector.addGetWebGLMessage();

let container, stats,
	camera, controls,
	scene, renderer;
const raycastTargets = []; // don't want to include certain objects like hoverDecal, so we can't just use scene.children

let cubeObject3D;
const pieces = [];
const color1 = 0xaf0000;
const color2 = 0xffffff;

const squareSize = 30;
const cubeGeometry = new THREE.BoxGeometry(squareSize, squareSize, squareSize);

const textureLoader = new THREE.TextureLoader();

// const marbleTexture = textureLoader.load("textures/Seamless-White-Marble-Texture.webp");

const reflectionTexture = textureLoader.load('textures/2294472375_24a3b8ef46_o.jpg');
reflectionTexture.mapping = THREE.EquirectangularReflectionMapping;
reflectionTexture.encoding = THREE.sRGBEncoding;

/*const material1 = new THREE.MeshLambertMaterial({
	map: THREE.ImageUtils.loadTexture('/marble2.jpg'),
	color:color1, ambient:color1, opacity: 0.7, transparent: true
});
const material2 = new THREE.MeshLambertMaterial({
	map: THREE.ImageUtils.loadTexture('/marble1'),
	color:color2, ambient:color2, opacity: 0.7, transparent: true
});*/
const boardMat1 = new THREE.MeshPhysicalMaterial({
	color: color1,
	roughness: 0.2,
	metalness: 0.1,
	transmission: 0.5,
	opacity: 0.8,
	transparent: true,
	envMap: reflectionTexture,
	envMapIntensity: 40,
	// map: marbleTexture,
});
const boardMat2 = new THREE.MeshPhysicalMaterial({
	color: color2,
	roughness: 0.2,
	metalness: 0.4,
	transmission: 0.5,
	opacity: 0.8,
	transparent: true,
	envMap: reflectionTexture,
	envMapIntensity: 40,
	// map: marbleTexture,
});

// const pieceMat1 = new THREE.MeshLambertMaterial({
// 	color: 0xffffff,
// 	emissive: 0xd48a8a,
// 	ambient: color1,
// 	shininess: 1.0,
// 	specular: 0xfbbbbb,
// 	// map: textureLoader.load('./Seamless-White-Marble-Texture.webp'),
// 	envMap: reflectionTexture,
// });
// const pieceMat1 = new THREE.MeshPhysicalMaterial({
// 	color: color1,
// 	roughness: 0.2,
// 	metalness: 0.4,
// 	envMap: reflectionTexture,
// 	envMapIntensity: 10,
// });
const pieceMat1 = new THREE.ShaderMaterial({
	vertexShader: `

	//
	// GLSL textureless classic 3D noise "cnoise",
	// with an RSL-style periodic variant "pnoise".
	// Author:  Stefan Gustavson (stefan.gustavson@liu.se)
	// Version: 2011-10-11
	//
	// Many thanks to Ian McEwan of Ashima Arts for the
	// ideas for permutation and gradient selection.
	//
	// Copyright (c) 2011 Stefan Gustavson. All rights reserved.
	// Distributed under the MIT license. See LICENSE file.
	// https://github.com/ashima/webgl-noise
	//
	
	vec3 mod289(vec3 x)
	{
	  return x - floor(x * (1.0 / 289.0)) * 289.0;
	}
	
	vec4 mod289(vec4 x)
	{
	  return x - floor(x * (1.0 / 289.0)) * 289.0;
	}
	
	vec4 permute(vec4 x)
	{
	  return mod289(((x*34.0)+1.0)*x);
	}
	
	vec4 taylorInvSqrt(vec4 r)
	{
	  return 1.79284291400159 - 0.85373472095314 * r;
	}
	
	vec3 fade(vec3 t) {
	  return t*t*t*(t*(t*6.0-15.0)+10.0);
	}
	
	// Classic Perlin noise
	float cnoise(vec3 P)
	{
	  vec3 Pi0 = floor(P); // Integer part for indexing
	  vec3 Pi1 = Pi0 + vec3(1.0); // Integer part + 1
	  Pi0 = mod289(Pi0);
	  Pi1 = mod289(Pi1);
	  vec3 Pf0 = fract(P); // Fractional part for interpolation
	  vec3 Pf1 = Pf0 - vec3(1.0); // Fractional part - 1.0
	  vec4 ix = vec4(Pi0.x, Pi1.x, Pi0.x, Pi1.x);
	  vec4 iy = vec4(Pi0.yy, Pi1.yy);
	  vec4 iz0 = Pi0.zzzz;
	  vec4 iz1 = Pi1.zzzz;
	
	  vec4 ixy = permute(permute(ix) + iy);
	  vec4 ixy0 = permute(ixy + iz0);
	  vec4 ixy1 = permute(ixy + iz1);
	
	  vec4 gx0 = ixy0 * (1.0 / 7.0);
	  vec4 gy0 = fract(floor(gx0) * (1.0 / 7.0)) - 0.5;
	  gx0 = fract(gx0);
	  vec4 gz0 = vec4(0.5) - abs(gx0) - abs(gy0);
	  vec4 sz0 = step(gz0, vec4(0.0));
	  gx0 -= sz0 * (step(0.0, gx0) - 0.5);
	  gy0 -= sz0 * (step(0.0, gy0) - 0.5);
	
	  vec4 gx1 = ixy1 * (1.0 / 7.0);
	  vec4 gy1 = fract(floor(gx1) * (1.0 / 7.0)) - 0.5;
	  gx1 = fract(gx1);
	  vec4 gz1 = vec4(0.5) - abs(gx1) - abs(gy1);
	  vec4 sz1 = step(gz1, vec4(0.0));
	  gx1 -= sz1 * (step(0.0, gx1) - 0.5);
	  gy1 -= sz1 * (step(0.0, gy1) - 0.5);
	
	  vec3 g000 = vec3(gx0.x,gy0.x,gz0.x);
	  vec3 g100 = vec3(gx0.y,gy0.y,gz0.y);
	  vec3 g010 = vec3(gx0.z,gy0.z,gz0.z);
	  vec3 g110 = vec3(gx0.w,gy0.w,gz0.w);
	  vec3 g001 = vec3(gx1.x,gy1.x,gz1.x);
	  vec3 g101 = vec3(gx1.y,gy1.y,gz1.y);
	  vec3 g011 = vec3(gx1.z,gy1.z,gz1.z);
	  vec3 g111 = vec3(gx1.w,gy1.w,gz1.w);
	
	  vec4 norm0 = taylorInvSqrt(vec4(dot(g000, g000), dot(g010, g010), dot(g100, g100), dot(g110, g110)));
	  g000 *= norm0.x;
	  g010 *= norm0.y;
	  g100 *= norm0.z;
	  g110 *= norm0.w;
	  vec4 norm1 = taylorInvSqrt(vec4(dot(g001, g001), dot(g011, g011), dot(g101, g101), dot(g111, g111)));
	  g001 *= norm1.x;
	  g011 *= norm1.y;
	  g101 *= norm1.z;
	  g111 *= norm1.w;
	
	  float n000 = dot(g000, Pf0);
	  float n100 = dot(g100, vec3(Pf1.x, Pf0.yz));
	  float n010 = dot(g010, vec3(Pf0.x, Pf1.y, Pf0.z));
	  float n110 = dot(g110, vec3(Pf1.xy, Pf0.z));
	  float n001 = dot(g001, vec3(Pf0.xy, Pf1.z));
	  float n101 = dot(g101, vec3(Pf1.x, Pf0.y, Pf1.z));
	  float n011 = dot(g011, vec3(Pf0.x, Pf1.yz));
	  float n111 = dot(g111, Pf1);
	
	  vec3 fade_xyz = fade(Pf0);
	  vec4 n_z = mix(vec4(n000, n100, n010, n110), vec4(n001, n101, n011, n111), fade_xyz.z);
	  vec2 n_yz = mix(n_z.xy, n_z.zw, fade_xyz.y);
	  float n_xyz = mix(n_yz.x, n_yz.y, fade_xyz.x);
	  return 2.2 * n_xyz;
	}
	
	// Classic Perlin noise, periodic variant
	float pnoise(vec3 P, vec3 rep)
	{
	  vec3 Pi0 = mod(floor(P), rep); // Integer part, modulo period
	  vec3 Pi1 = mod(Pi0 + vec3(1.0), rep); // Integer part + 1, mod period
	  Pi0 = mod289(Pi0);
	  Pi1 = mod289(Pi1);
	  vec3 Pf0 = fract(P); // Fractional part for interpolation
	  vec3 Pf1 = Pf0 - vec3(1.0); // Fractional part - 1.0
	  vec4 ix = vec4(Pi0.x, Pi1.x, Pi0.x, Pi1.x);
	  vec4 iy = vec4(Pi0.yy, Pi1.yy);
	  vec4 iz0 = Pi0.zzzz;
	  vec4 iz1 = Pi1.zzzz;
	
	  vec4 ixy = permute(permute(ix) + iy);
	  vec4 ixy0 = permute(ixy + iz0);
	  vec4 ixy1 = permute(ixy + iz1);
	
	  vec4 gx0 = ixy0 * (1.0 / 7.0);
	  vec4 gy0 = fract(floor(gx0) * (1.0 / 7.0)) - 0.5;
	  gx0 = fract(gx0);
	  vec4 gz0 = vec4(0.5) - abs(gx0) - abs(gy0);
	  vec4 sz0 = step(gz0, vec4(0.0));
	  gx0 -= sz0 * (step(0.0, gx0) - 0.5);
	  gy0 -= sz0 * (step(0.0, gy0) - 0.5);
	
	  vec4 gx1 = ixy1 * (1.0 / 7.0);
	  vec4 gy1 = fract(floor(gx1) * (1.0 / 7.0)) - 0.5;
	  gx1 = fract(gx1);
	  vec4 gz1 = vec4(0.5) - abs(gx1) - abs(gy1);
	  vec4 sz1 = step(gz1, vec4(0.0));
	  gx1 -= sz1 * (step(0.0, gx1) - 0.5);
	  gy1 -= sz1 * (step(0.0, gy1) - 0.5);
	
	  vec3 g000 = vec3(gx0.x,gy0.x,gz0.x);
	  vec3 g100 = vec3(gx0.y,gy0.y,gz0.y);
	  vec3 g010 = vec3(gx0.z,gy0.z,gz0.z);
	  vec3 g110 = vec3(gx0.w,gy0.w,gz0.w);
	  vec3 g001 = vec3(gx1.x,gy1.x,gz1.x);
	  vec3 g101 = vec3(gx1.y,gy1.y,gz1.y);
	  vec3 g011 = vec3(gx1.z,gy1.z,gz1.z);
	  vec3 g111 = vec3(gx1.w,gy1.w,gz1.w);
	
	  vec4 norm0 = taylorInvSqrt(vec4(dot(g000, g000), dot(g010, g010), dot(g100, g100), dot(g110, g110)));
	  g000 *= norm0.x;
	  g010 *= norm0.y;
	  g100 *= norm0.z;
	  g110 *= norm0.w;
	  vec4 norm1 = taylorInvSqrt(vec4(dot(g001, g001), dot(g011, g011), dot(g101, g101), dot(g111, g111)));
	  g001 *= norm1.x;
	  g011 *= norm1.y;
	  g101 *= norm1.z;
	  g111 *= norm1.w;
	
	  float n000 = dot(g000, Pf0);
	  float n100 = dot(g100, vec3(Pf1.x, Pf0.yz));
	  float n010 = dot(g010, vec3(Pf0.x, Pf1.y, Pf0.z));
	  float n110 = dot(g110, vec3(Pf1.xy, Pf0.z));
	  float n001 = dot(g001, vec3(Pf0.xy, Pf1.z));
	  float n101 = dot(g101, vec3(Pf1.x, Pf0.y, Pf1.z));
	  float n011 = dot(g011, vec3(Pf0.x, Pf1.yz));
	  float n111 = dot(g111, Pf1);
	
	  vec3 fade_xyz = fade(Pf0);
	  vec4 n_z = mix(vec4(n000, n100, n010, n110), vec4(n001, n101, n011, n111), fade_xyz.z);
	  vec2 n_yz = mix(n_z.xy, n_z.zw, fade_xyz.y);
	  float n_xyz = mix(n_yz.x, n_yz.y, fade_xyz.x);
	  return 2.2 * n_xyz;
	}
	
	// Include the Ashima code here!
	
	varying vec2 vUv;
	varying float noise;
	
	float turbulence( vec3 p ) {
		float w = 100.0;
		float t = -.5;
		for (float f = 1.0 ; f <= 10.0 ; f++ ){
			float power = pow( 2.0, f );
			t += abs( pnoise( vec3( power * p ), vec3( 10.0, 10.0, 10.0 ) ) / power );
		}
		return t;
	}
	
	void main() {
	
		vUv = uv;
	
		noise = 10.0 *  -.10 * turbulence( .5 * normal );
		float b = 5.0 * pnoise( 0.05 * position, vec3( 100.0 ) );
		float displacement = - 10. * noise + b;
	
		vec3 newPosition = position + normal * displacement * 0.1;
		gl_Position = projectionMatrix * modelViewMatrix * vec4( newPosition, 1.0 );
	
	}
	`,
	fragmentShader: `
	varying vec2 vUv;
	varying float noise;
	
	void main() {
	
	  // compose the colour using the UV coordinate
	  // and modulate it with the noise like ambient occlusion
	  vec3 color = vec3( vUv * ( 1. - 2. * noise ), 0.0 );
	  gl_FragColor = vec4( color.rgb, 1.0 );
	
	}
	
		`,
});

const pieceMat2 = new THREE.MeshPhysicalMaterial({
	color: color2,
	// emissive: 0x3f3f3f,
	roughness: 0.2,
	metalness: 0.4,
	envMap: reflectionTexture,
	envMapIntensity: 10,
});

// const hoveredBoardMat1 = boardMat1.clone(); hoveredBoardMat1.emissive.add(new THREE.Color(0x000000));
// const hoveredBoardMat2 = boardMat2.clone(); hoveredBoardMat2.emissive.add(new THREE.Color(0x000000));
const hoveredPieceMat1 = pieceMat1.clone();
const hoveredPieceMat2 = pieceMat2.clone();
const hoverDecalMat = new THREE.MeshStandardMaterial({
	color: 0xffffff,
	emissive: 0x442200,
	transparent: true,
	// map: textureLoader.load('./textures/vintage-symmetric-frame-extrapolated.png'), // too high detail
	// alphaMap: textureLoader.load('./textures/symmetric-checkerboard-frame.jpg'), // funny
	// alphaMap: textureLoader.load('./textures/flower-frame-1436652825nLe.jpg'),
	map: textureLoader.load('./textures/hover-decal-flower-frame-with-outline.png'), // outline for contrast... but from far away it looks bad and reduces contrast!
	// depthTest: false,
	// depthWrite: false,
	// combine: THREE.MultiplyOperation,
});

const hoverDecal = new THREE.Mesh(new THREE.PlaneBufferGeometry(squareSize, squareSize), hoverDecalMat);

const stlLoader = new THREE.STLLoader();
const pieceTypes = [
	"pawn",
	"knight",
	"bishop",
	"rook",
	"queen",
	"king",
];
const geometryPromises = pieceTypes.map((pieceType) => new Promise((resolve, reject) => {
	const url = `models/classic_${pieceType}.stl`;
	stlLoader.load(
		url,
		(geometry) => { // Success callback
			geometry.computeFaceNormals();
			geometry.computeVertexNormals();
			resolve(geometry);
		},
		(xhr) => {
			// Progress callback
		},
		(xhr) => {
			// Failure callback
			// Reject the promise with the failure
			reject(new Error('Could not load ' + url));
		}
	);
}));

const C = 8; // metacube board size in cubes/squares/cells

let turn = false;
let raycaster;
const intersects = [];
let hoveredPiece;
let hoveredSpace;
let selectedPiece;

const mouse = { x: null, y: null };

addEventListener('mousemove', function (e) {
	mouse.x = (e.clientX / window.innerWidth) * 2 - 1;
	mouse.y = 1 - (e.clientY / window.innerHeight) * 2;
}, true);

addEventListener('mousedown', function (e) {
	if (e.button !== 0) return;
	if (hoveredPiece) {
		selectedPiece = hoveredPiece;
	} else if (selectedPiece) {
		if (hoveredSpace) {
			selectedPiece.moveTo(hoveredSpace.x, hoveredSpace.y, hoveredSpace.z);
		}
		selectedPiece = null;
	}
}, true);

addEventListener('mouseleave', function (e) {
	mouse.x = null;
	mouse.y = null;
}, true);

addEventListener('blur', function (e) {
	mouse.x = null;
	mouse.y = null;
}, true);

// function worldToGameSpace(worldPosition) {
// 	return worldPosition.clone().divideScalar(squareSize).floor();
// }
function gameToWorldSpace(gamePosition) {
	return gamePosition.clone().subScalar((C - 1) / 2).multiplyScalar(squareSize);
}

class Piece {
	constructor(x, y, z, team, pieceType) {
		this.gamePosition = new THREE.Vector3(x, y, z);
		this.targetWorldPosition = gameToWorldSpace(this.gamePosition);
		this.targetOrientation = new THREE.Quaternion();
		this.towardsGroundVector = new THREE.Vector3();
		this.team = team;
		this.pieceType = pieceType || "pawn";
		this.o = new THREE.Object3D();
		const mat = !team ? pieceMat1 : pieceMat2;
		const tempGeometry = new THREE.CylinderGeometry(11, 10, 2, 15, 1, false);
		const tempMesh = new THREE.Mesh(tempGeometry, mat);
		this.o.add(tempMesh);
		raycastTargets.push(tempMesh);
		geometryPromises[Math.max(0, pieceTypes.indexOf(this.pieceType))].then((geometry) => {
			const mesh = new THREE.Mesh(geometry, mat);
			this.o.add(mesh);
			this.o.remove(tempMesh);
			raycastTargets.push(mesh);
			raycastTargets.splice(raycastTargets.indexOf(tempMesh), 1);
			mesh.rotation.x -= Math.PI / 2;
			mesh.position.y -= 15;
		});
		this.o.position.copy(this.targetWorldPosition);
		this.orientTowardsCube();
		scene.add(this.o);
		this.o.piece = this;
	}
	// TEMPORARY!
	get ox() {
		return this.towardsGroundVector.x;
	}
	get oy() {
		return this.towardsGroundVector.y;
	}
	get oz() {
		return this.towardsGroundVector.z;
	}
	get x() {
		return this.gamePosition.x;
	}
	get y() {
		return this.gamePosition.y;
	}
	get z() {
		return this.gamePosition.z;
	}
	moveRelative2D(mx, my) {
		if (mx === 0 && my === 0)
			return false;
		//if(cubeAt(x,y,z))return false;
		let x, y, z;
		if (this.ox === 0 && this.oy === 0) {
			z = this.z;
			x = this.x + mx;
			y = this.y + my;
		} else if (this.ox === 0 && this.oz === 0) {
			y = this.y;
			x = this.x + mx;
			z = this.z + my;
		} else if (this.oz === 0 && this.oy === 0) {
			x = this.x;
			z = this.z + mx;
			y = this.y + my;
		} else {
			console.warn("Weird orientation...");
			return false;
		}

		// if there's no ground underneath the new position, wrap around the cube
		// (ox/oy/oz are orientation)
		if (!cubeAt(x + this.ox, y + this.oy, z + this.oz)) {
			// don't move diagonally off the edge of the board cube
			if (mx !== 0 && my !== 0) {
				return false;
			}
			x += this.ox;
			y += this.oy;
			z += this.oz;
			//this.rx += mx * Math.PI/2;
			//this.rz -= my * Math.PI/2;
		}

		return this.moveTo(x, y, z);
	}
	moveTo(x, y, z) {
		if (pieceAt(x, y, z))
			return false; // TODO: allow capturing

		this.gamePosition.set(x, y, z);
		this.targetWorldPosition = gameToWorldSpace(this.gamePosition);

		this.orientTowardsCube();
		return true;
	}
	orientTowardsCube() {
		if (this.x < 0) {
			this.towardsGroundVector.set(1, 0, 0);
		} else if (this.y < 0) {
			this.towardsGroundVector.set(0, 1, 0);
		} else if (this.z < 0) {
			this.towardsGroundVector.set(0, 0, 1);
		} else if (this.x >= C) {
			this.towardsGroundVector.set(-1, 0, 0);
		} else if (this.y >= C) {
			this.towardsGroundVector.set(0, -1, 0);
		} else if (this.z >= C) {
			this.towardsGroundVector.set(0, 0, -1);
		} else {
			console.warn("Oh no, piece is inside cube!");
		}
		this.targetOrientation.setFromUnitVectors(
			new THREE.Vector3(0, -1, 0),
			this.towardsGroundVector.clone(),
		);
	}
	update() {
		this.o.position.x += (this.targetWorldPosition.x - this.o.position.x) / 20;
		this.o.position.y += (this.targetWorldPosition.y - this.o.position.y) / 20;
		this.o.position.z += (this.targetWorldPosition.z - this.o.position.z) / 20;
		this.o.quaternion.slerp(this.targetOrientation, 1 / 20);
		// this.o.quaternion.rotateTowards(this.targetOrientation, 0.05);
		if (selectedPiece === this) {
			this.o.rotation.z += Math.sin(Date.now() / 500) / 150;
			this.o.position.add(this.towardsGroundVector.clone().multiplyScalar(-0.5));
		}
	}
	updateHovering(hovering) {
		const mesh = this.o.children[0];
		if (!this.team) {
			mesh.material = !hovering ? pieceMat1 : hoveredPieceMat1;
		} else {
			mesh.material = !hovering ? pieceMat2 : hoveredPieceMat2;
		}
	}
	toString() {
		return `${!this.team ? "Red" : "White"} ${this.pieceType} at (${this.x},${this.y},${this.z})`;
	}
}

function init() {

	camera = new THREE.PerspectiveCamera(60, window.innerWidth / window.innerHeight, 1, 1000);
	camera.position.z = 500;
	camera.near = 0.1;
	camera.far = 1000;

	controls = new THREE.CubeControls(camera);
	controls.noPan = true; // panning already doesn't work but this makes it not give state === STATE.PANNING (with my modifications)

	scene = new THREE.Scene();
	// scene.fog = new THREE.FogExp2(0x000000, 0.002);

	let theme = "default";
	try {
		theme = localStorage.getItem("3d-theme");
	} catch (e) {
		console.warn("Couldn't read 3d-theme from local storage");
	}
	if (theme === "wireframe") {
		scene.overrideMaterial = new THREE.MeshBasicMaterial({ color: "lime", wireframe: true })
		scene.fog = new THREE.FogExp2(0x000000, 0.003);
	}

	raycaster = new THREE.Raycaster();

	// metacube
	cubeObject3D = new THREE.Object3D();
	for (let x = 0; x < C; x++) {
		for (let y = 0; y < C; y++) {
			for (let z = 0; z < C; z++) {
				const mesh = new THREE.Mesh(cubeGeometry, ((x + y + z) % 2) ? boardMat1 : boardMat2);
				mesh.gamePosition = new THREE.Vector3(x, y, z);
				mesh.position.copy(gameToWorldSpace(mesh.gamePosition));
				mesh.updateMatrix();
				mesh.matrixAutoUpdate = false;
				cubeObject3D.add(mesh);
				raycastTargets.push(mesh);
			}
		}
	}
	scene.add(cubeObject3D);
	scene.add(hoverDecal);

	// pieces
	const pieceLocations = [
		[1, 1],
		[1, C - 2],
		[C - 2, 1],
		[C - 2, C - 2],

		[2, 2],
		[2, C - 3],
		[C - 3, 2],
		[C - 3, C - 3],

		[3, 1],
		[1, C - 4],
		[C - 2, 3],
		[C - 4, C - 2],
	];
	for (let i in pieceLocations) {
		pieces.push(new Piece(pieceLocations[i][0], pieceLocations[i][1], -1, 0, pieceTypes[i % 6]));
		pieces.push(new Piece(pieceLocations[i][0], pieceLocations[i][1], C, 1, pieceTypes[i % 6]));
	}

	// lighting
	const ambientLight = new THREE.AmbientLight(0xeeeeee);
	scene.add(ambientLight);


	// renderer

	renderer = new THREE.WebGLRenderer();
	// renderer.setClearColor(scene.fog.color, 1);
	renderer.setSize(window.innerWidth, window.innerHeight);

	container = document.body;
	container.appendChild(renderer.domElement);

	stats = new Stats();
	stats.domElement.style.position = 'absolute';
	stats.domElement.style.top = '0px';
	stats.domElement.style.zIndex = 100;
	container.appendChild(stats.domElement);

	//

	window.addEventListener('resize', onWindowResize, false);

}

function onWindowResize() {
	camera.aspect = window.innerWidth / window.innerHeight;
	camera.updateProjectionMatrix();
	renderer.setSize(window.innerWidth, window.innerHeight);
	controls.handleResize();
}

function animate() {
	requestAnimationFrame(animate);
	stats.update();

	for (let i = 0; i < pieces.length; i++) {
		pieces[i].update();
	}
	controls.update();

	// clear hover state of previously hovered piece
	if (hoveredPiece) {
		hoveredPiece.updateHovering(false);
	}
	hoveredPiece = null;

	// clear hover state of board
	hoverDecal.visible = false;
	hoveredSpace = null;

	// find hovered piece and/or board space and highlight it
	if (mouse.x != null && mouse.y != null && controls.state === controls.STATE.NONE) {
		raycaster.setFromCamera(mouse, camera);
		intersects.length = 0;
		raycaster.intersectObjects(raycastTargets, false, intersects);

		if (intersects.length > 0) {
			const m = intersects[0].object;
			// TODO: hover space via piece or visa-versa, depending on state of the game (selecting piece, moving piece)
			if (m.geometry == cubeGeometry) {
				hoverDecal.visible = true;
				hoverDecal.position.copy(m.position);
				hoverDecal.position.add(intersects[0].face.normal.clone().multiplyScalar(squareSize / 2 + 0.01));
				const axis = new THREE.Vector3(0, 0, 1);
				hoverDecal.quaternion.setFromUnitVectors(axis, intersects[0].face.normal);
				hoveredSpace = new THREE.Vector3().addVectors(m.gamePosition, intersects[0].face.normal);
			} else {
				hoveredPiece = m.parent.piece;
			}
		}
	}

	if (hoveredPiece) {
		hoveredPiece.updateHovering(true);
	}
	document.body.style.cursor = hoveredPiece ? 'pointer' : 'default';

	renderer.render(scene, camera);
}

function cubeAt(x, y, z) {
	if (x < 0 || y < 0 || z < 0) return false;
	if (x >= C || y >= C || z >= C) return false;
	return true;
}
function pieceAt(x, y, z) {
	for (let i = 0; i < pieces.length; i++) {
		if (pieces[i].x == x && pieces[i].y == y && pieces[i].z == z) {
			return true;
		}
	}
	return false;
}

function takeTurn() {
	//AI!
	turn = !turn;
	let timeout = 100;
	while (timeout--) {
		const p = pieces[Math.floor(Math.random() * pieces.length)];
		if (p.team == turn && Math.random() < 4) {
			if (p.moveRelative2D(r(), r())) {
				return true;
			}
		}
	}
	console.log("Couldn't find move.");
	return false;

	function r() {
		return Math.floor(Math.random() * 3) - 1;
	}
}

init();
animate();
setTimeout(() => {
	setInterval(takeTurn, 1000);
}, 5000);
