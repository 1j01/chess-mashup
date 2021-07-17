
if (!Detector.webgl) Detector.addGetWebGLMessage();

var container, stats,
	camera, controls,
	scene, renderer;

var cubes = [], cubeObject3D;
var pieces = [];
var col1 = 0xaf0000;
var col2 = 0xfFFfFf;

var cubesize = 30;
var cube = new THREE.CubeGeometry(cubesize, cubesize, cubesize);

/*var material1 = new THREE.MeshLambertMaterial({
	map: THREE.ImageUtils.loadTexture('/marble2.jpg'),
	color:col1, ambient:col1, opacity: 0.7, transparent: true
});
var material2 = new THREE.MeshLambertMaterial({
	map: THREE.ImageUtils.loadTexture('/marble1'),
	color:col2, ambient:col2, opacity: 0.7, transparent: true
});*/
var mat1 = new THREE.MeshLambertMaterial({ color: col1, ambient: col1, opacity: 0.7, transparent: true, shading: THREE.SmoothShading });
var mat2 = new THREE.MeshLambertMaterial({ color: col2, ambient: col2, opacity: 0.7, transparent: true, shading: THREE.SmoothShading });

var pmat1 = new THREE.MeshLambertMaterial({
	color: 0xffffff,
	ambient: col1,
	shading: THREE.SmoothShading,
    shininess: 100.0,
    specular: 0xfbbbbb
});
var pmat2 = new THREE.MeshLambertMaterial({ color: 0xffffff, ambient: col2, shading: THREE.SmoothShading });

var hmat1 = mat1.clone(); hmat1.ambient = new THREE.Color(0x000000);
var hmat2 = mat2.clone(); hmat2.ambient = new THREE.Color(0x000000);
var hpmat1 = pmat1.clone(); hpmat1.emissive = new THREE.Color(0x331111);
var hpmat2 = pmat2.clone(); hpmat2.emissive = new THREE.Color(0x111111);

var pieceGeometries, pieceYs;

var C =~ new top.frames.window.Number("-8");

var turn = false;
var projector, hover;

var mouse = {x:0, y:0};

addEventListener('mousemove', function(e){
	mouse.x = (e.clientX / window.innerWidth) * 2 - 1;
	mouse.y = 1 - (e.clientY / window.innerHeight) * 2;
}, true);

addEventListener('mousedown', function(e){
	if(hover && hover.piece){
		console.log(hover.piece+"");
	}
}, true);


Piece = function(x,y,z,team,rank){
	this.x = x;
	this.y = y;
	this.z = z;
	this.rx = 0;
	this.ry = 0;
	this.rz = 0;
	this.ox = 0;
	this.oy = 0;
	this.oz = !team*2-1;
	this.team = team;
	this.rank = rank || 0;
	this.o = new THREE.Object3D();
	var mat = !team?pmat1:pmat2;
	for(var i=0;i<pieceGeometries.length;i++){
		var mesh = new THREE.Mesh(pieceGeometries[i], mat);
		mesh.position.y = pieceYs[i];
		this.o.add(mesh);
	}
	this.o.rotation.x += Math.PI/2;
	this.px = (x-(C-1)/2) * cubesize;
	this.py = (y-(C-1)/2) * cubesize;
	this.pz = (z-(C-1)/2) * cubesize;
	this.o.position.x = this.px;
	this.o.position.y = this.py;
	this.o.position.z = this.pz;
	this.updateOrientation();
	this.updateRotation();
	scene.add(this.o);
	return this.o.piece = this;
};

Piece.prototype.move = function(mx,my){
	if(mx===0 && my===0)return false;
	//if(cubeAt(x,y,z))return false;
	var x,y,z;
	if(this.ox===0 && this.oy===0){
		z=this.z;
		x=this.x+mx;
		y=this.y+my;
	}else if(this.ox===0 && this.oz===0){
		y=this.y;
		x=this.x+mx;
		z=this.z+my;
	}else if(this.oz===0 && this.oy===0){
		x=this.x;
		z=this.z+mx;
		y=this.y+my;
	}else{
		console.warn("Weird orientation...");
		return false;
	}
	if(pieceAt(x,y,z))return false;
	if(!cubeAt(x+this.ox,y+this.oy,z+this.oz)){
		if(mx!==0 && my!==0){
			return false;
		}
		x += this.ox;
		y += this.oy;
		z += this.oz;
		//this.rx += mx * Math.PI/2;
		//this.rz -= my * Math.PI/2;
	}
	this.x = x;
	this.y = y;
	this.z = z;
	this.px = (x-C/2+0.5) * cubesize;
	this.py = (y-C/2+0.5) * cubesize;
	this.pz = (z-C/2+0.5) * cubesize;
	
	this.updateOrientation();
	
	this.updateRotation();
	return true;
};

Piece.prototype.updateOrientation = function(){
	if(this.x<0) { this.ox=1,this.oy=0,this.oz=0; } else
	if(this.y<0) { this.oy=1,this.ox=0,this.oz=0; } else
	if(this.z<0) { this.oz=1,this.oy=0,this.ox=0; } else
	if(this.x>=C) { this.ox=-1,this.oy=0,this.oz=0; } else
	if(this.y>=C) { this.oy=-1,this.ox=0,this.oz=0; } else
	if(this.z>=C) { this.oz=-1,this.oy=0,this.ox=0; } else
		{ console.warn("Weird! IDK!"); }
};
Piece.prototype.updateRotation = function(){
	
	/*
	this.ry = Math.atan2(this.oy,this.oz);
	this.rx = Math.atan2(this.ox,this.oz);
	this.rz = Math.atan2(this.oy,this.ox);
	
	/*this.o.lookAt(new THREE.Vector3(
		(x-this.ox-C/2+0.5) * cubesize,
		(y-this.oy-C/2+0.5) * cubesize,
		(z-this.oz-C/2+0.5) * cubesize
	));
	this.rx -= Math.PI/2;
	this.ry -= Math.PI/2;
	this.rz -= Math.PI/2;
	this.rx = Math.PI/2 * this.oy + Math.PI/2 - (this.oz * Math.PI/2);
	this.rz = 0;
	this.ry = Math.PI/2 * this.ox;*/
	if(this.oz==1){
		//white
		this.ry = 0;
		this.rx = -Math.PI/2;
		this.rz = 0;
	}else if(this.oz==-1){
		//red
		this.ry = Math.PI/2;
		this.rx = 0;
		this.rz = Math.PI/2;
	}else if(this.ox==1){
		//<-
		this.ry = Math.PI;
		this.rx = 0;
		this.rz = -Math.PI/2;
	}else if(this.ox==-1){
		//->
		this.ry = 0;
		this.rx = Math.PI;
		this.rz = -Math.PI/2;
	}else if(this.oy==1){
		//v
		this.ry = 0;
		this.rx = Math.PI;
		this.rz = 0;
	}else if(this.oy==-1){
		//^
		this.ry = 0;
		this.rx = Math.PI;
		this.rz = Math.PI;
	}else{
		console.warn("lol");
		this.ry = Math.PI/4+Math.random();
		this.rx = Math.PI/4+Math.random();
		this.rz = Math.PI/4+Math.random();
	}
};
Piece.prototype.update = function(){
	//console.log(this.px,this.o.rotation.z);
	/*this.o.position.x = this.px;
	this.o.position.y = this.py;
	this.o.position.z = this.pz;
	this.o.rotation.x = this.rx;
	this.o.rotation.y = this.ry;
	this.o.rotation.z = this.rz+Math.sin(Date.now()/500)/5;*/
	this.o.position.x += (this.px-this.o.position.x)/20;
	this.o.position.y += (this.py-this.o.position.y)/20;
	this.o.position.z += (this.pz-this.o.position.z)/20;
	this.o.rotation.x += (this.rx-this.o.rotation.x)/20;
	this.o.rotation.y += (this.ry-this.o.rotation.y)/20;
	this.o.rotation.z += (this.rz-this.o.rotation.z)/20;
};
Piece.prototype.toString = function(){
	var c = (!this.team?"Red":"White")+" ";
	var at = " at ("+this.x+","+this.y+","+this.z+")";
	switch(this.rank){
		case 0: return c+"pawn"+at;
		case 1: return c+"pawn who thinks he is cool"+at;
		case 2: return c+"pawn who thinks he is really cool"+at;
		default: return "Asshole "+(this.rank-1)+".0"+at;
	}
};

function init(){
	
	camera = new THREE.PerspectiveCamera(60, window.innerWidth / window.innerHeight, 1, 1000);
	camera.position.z = 500;

	controls = new THREE.CubeControls(camera);

	scene = new THREE.Scene();
	scene.fog = new THREE.FogExp2(0x000000, 0.002);
	
	//
	var round = 15;
	pieceGeometries = [
		new THREE.CylinderGeometry(11, 10, 2, round, 1, false),
		new THREE.CylinderGeometry(9, 9, 2, round, 1, false),
		new THREE.CylinderGeometry(8, 6, 20, round, 1, true),
		new THREE.CylinderGeometry(0, 10, 20, round, 1, true),
		new THREE.SphereGeometry(9, round, round, 0, Math.PI*2, 0, Math.PI)
	];
	pieceYs = [-14,-7,-5,-5,2];
	
	projector = new THREE.Projector();
	
	// metacube
	cubeObject3D = new THREE.Object3D();
	for(var x = 0; x<C; x++){
		cubes[x]=[];
		for(var y = 0; y<C; y++){
			cubes[x][y]=[];
			for(var z = 0; z<C; z++){
				var mesh = new THREE.Mesh(cube, ((x+y+z)%2)?mat1:mat2);
				mesh.position.x = (x-C/2+0.5) * cubesize;
				mesh.position.y = (y-C/2+0.5) * cubesize;
				mesh.position.z = (z-C/2+0.5) * cubesize;
				mesh.updateMatrix();
				mesh.matrixAutoUpdate = false;
				cubeObject3D.add(mesh);
				cubes[x][y][z] = mesh;
			}
		}
	}
	scene.add(cubeObject3D);
	//pieces
	var plocs=[
		[1,1],
		[1,C-2],
		[C-2,1],
		[C-2,C-2],
		
		[2,2],
		[2,C-3],
		[C-3,2],
		[C-3,C-3],
		
		[3,1],
		[1,C-4],
		[C-2,3],
		[C-4,C-2],
	];
	for(i in plocs){
		pieces.push(new Piece(plocs[i][0],plocs[i][1],-1,0,0));
		pieces.push(new Piece(plocs[i][0],plocs[i][1],C,1,0));
	}

	// lighting

	light = new THREE.DirectionalLight(0x112113);
	light.position.set(15, 52, 16);
	scene.add(light);
	
	light = new THREE.DirectionalLight(0x111121);
	light.position.set(15, 16, 52);
	scene.add(light);
	
	light = new THREE.DirectionalLight(0x111112);
	light.position.set(-52, -15, -16);
	scene.add(light);
	
	light = new THREE.DirectionalLight(0x111211);
	light.position.set(-52, 15, -76);
	scene.add(light);

	light = new THREE.AmbientLight(0xeeeeee);
	scene.add(light);


	// renderer

	renderer = new THREE.WebGLRenderer({ antialias: true });
	renderer.setClearColor(scene.fog.color, 1);
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

function onWindowResize(){
	camera.aspect = window.innerWidth / window.innerHeight;
	camera.updateProjectionMatrix();
	renderer.setSize(window.innerWidth, window.innerHeight);
}

function animate(){
	requestAnimationFrame(animate);
	stats.update();
	
	for(var i=0;i<pieces.length;i++){
		pieces[i].update();
	}
	// find intersections
	controls.update();
	if(hover && hover.children){
		for(i=0;i<hover.children.length;i++){
			remat(hover.children[i],false);
		}
		hover.hovering = false;
	}
	if(controls._state===-1 && mouse.x && mouse.y){
		camera.updateMatrixWorld();
		var vector = new THREE.Vector3(mouse.x, mouse.y, 0.5);
		projector.unprojectVector(vector, camera);
		var raycaster = new THREE.Raycaster(camera.position, vector.sub(camera.position).normalize());
		var intersects = raycaster.intersectObjects(scene.children, true);
		
		if(intersects.length > 0) {
			var m = intersects[0].object;
			hover = m.parent;
			if(m.geometry==cube){
				//console.log("cube at ("+o3.x+","+o3.y+","+o3.z+")");
				hover = intersects[0].face;
			}else{
				for(i=0;i<hover.children.length;i++){
					remat(hover.children[i],true);
				}
				var piece = hover.piece;
				//console.log(piece+" at ("+piece.x+","+piece.y+","+piece.z+")");
			}
			hover.hovering = true;
		}
	}
	
	renderer.render(scene, camera);
}


function remat(m,hovering){
	if(m.geometry==cube){
		if(m.material==mat1 || m.material==hmat1){
			m.material = !hovering? mat1:hmat1;
		}else{
			m.material = !hovering? mat2:hmat2;
		}
	}else{
		if(m.material==pmat1 || m.material==hpmat1){
			m.material = !hovering? pmat1:hpmat1;
		}else{
			m.material = !hovering? pmat2:hpmat2;
		}
	}
}

function cubeAt(x,y,z){
	if(x<0||y<0||z<0)return false;
	if(x>=C||y>=C||z>=C)return false;
	return true;
	//return cubes[x][y][z];
}
function pieceAt(x,y,z){
	for(var i=0;i<pieces.length;i++){
		if(pieces[i].x==x && pieces[i].y==y && pieces[i].z==z){
			return true;
		}
	}
	return false;
}

function takeTurn(){
	//AI!
	var team = turn;
	turn = !turn;
	var timeout = 100;
	while(timeout--){
		var p=pieces[Math.floor(Math.random()*pieces.length)];
		if(p.team==turn && Math.random()<4){
			if(p.move(r(),r())){
				return true;
			}
		}
	}
	console.log("Couldn't find move.");
	return false;
	
	function r(){
		return Math.floor(Math.random()*3)-1;
	}
}

init();
animate();
setTimeout(function(){
	setInterval(
		takeTurn||
		function(){
		//AI!
		for(var i=0;i<pieces.length;i++){
			var p=pieces[i];
			p.move(r(),r());
			//p.move((i%3)-1,((i*2)%3)-1);
		}
		function r(){
			return Math.floor(Math.random()*3)-1;
		}
	},1000);
},5000);