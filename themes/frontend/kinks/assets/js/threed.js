	
	var container, renderer, scene, camera, fov = 45;
	var toRAD = Math.PI/180;
	
	var clientMouseX, 
		clientMouseY,
		currentRotationX = 0,
		currentRotationY = 0,
		mouse = {
			x: 0, 
			y: 0
		},
		mouseX = 0,
		mouseY = 0,
		onMouseDownX = 0,
		onMouseDownY = 0,
		targetRotationX = 0,
		targetMouseDownX = 0,
		targetRotationY = 0,
		targetMouseDownY = 0,
		targetSubtleRotationX = 0,
		targetSubtleRotationY = 0,
		targetDeviceRotationX = 0,
		targetDeviceRotationY = 0,
		isMouseDown = false;
	
	var WIDTH = window.innerWidth,
		HEIGHT = window.innerHeight,
		windowHalfX = WIDTH / 2,
		windowHalfY = HEIGHT / 2;
	
	var batLogoIntro = new TimelineMax({ paused: true }),
		batHeadIntro = new TimelineMax({ paused: true }),
		batLogoOutro = new TimelineMax({ paused: true }),
		batHeadOutro = new TimelineMax({ paused: true });
	
	
	// GENERATE RANDOM NUMBER
	function generateRandomNumber(min, max) {
		var random = Math.floor(Math.random() * (max - min + 1)) + min;
		return random;
	}
	
	// MODEL LOAD MANAGER
	var manager = new THREE.LoadingManager();
	manager.onProgress = function ( item, loaded, total ) {
		//console.log( item, loaded, total );
	};
	var onProgress = function ( xhr ) {
		if ( xhr.lengthComputable ) {
			var percentComplete = xhr.loaded / xhr.total * 100;
			//console.log( Math.round(percentComplete, 2) + '% downloaded' );
		}
	};
	var onError = function ( xhr ) {
	};
	
	var batSceneObject,
		batModelObject,
		batBallGeometry,
		batBallMaterial,
		batBallMesh;
	function initWebGL() {
		container = document.getElementById( 'interactive' );
		
		scene = new THREE.Scene();
	
		camera = new THREE.PerspectiveCamera( fov, window.innerWidth / window.innerHeight, 1, 5000 );
		camera.position.z = 350;
		camera.target = new THREE.Vector3( 0, 0, 0 );
		scene.add( camera );
		
		// RENDERER
		renderer = new THREE.WebGLRenderer({ alpha: false, antialias: true });
		renderer.setSize( window.innerWidth, window.innerHeight );
		renderer.autoClear = false;
		renderer.setClearColor( 0x000000, 0);
		container.appendChild( renderer.domElement );
		
		
		// LIGHTS
		var sphere = new THREE.SphereGeometry( 5, 16, 8 );
		var ambientLight = new THREE.AmbientLight( 0x000000 );
		scene.add( ambientLight );
	
		var lights = [];
		lights[0] = new THREE.PointLight( 0x484e53, 1.0, 500 );
		//lights[0].add( new THREE.Mesh( sphere, new THREE.MeshBasicMaterial( { color: 0x484e53 } ) ) );
		lights[1] = new THREE.PointLight( 0x484e53, 0.5, 100 );
		lights[2] = new THREE.PointLight( 0x484e53, 0.5, 0 ); 
	
		lights[0].position.set( 0, 150, 150 );
		lights[1].position.set( -200, 0, 0 );
		lights[2].position.set( 200, 0, 0 );
		
		scene.add( lights[0] );
		scene.add( lights[1] );
		scene.add( lights[2] );
		
		
		// MAIN SCENE				
		batSceneObject = new THREE.Object3D();
		//batSceneObject.position.z = -500
		scene.add( batSceneObject );
			
			// MODEL CONTAINER
			batModelObject = new THREE.Object3D();
			batModelObject.scale.x = batModelObject.scale.y = batModelObject.scale.z = 1;
			batSceneObject.add( batModelObject );
		
			// REACTIVE BALL
			batBallGeometry = new THREE.SphereGeometry( 5, 32, 32 );
			batBallMaterial = new THREE.MeshBasicMaterial({ color: 0x000000, transparent: true, opacity: 0 });
			batBallMesh = new THREE.Mesh( batBallGeometry, batBallMaterial );
			batBallMesh.position.set( -2000,-2000, 0 );
			batModelObject.add( batBallMesh );
			
			// CHAOS CONTAINER
			batmanChaosObject = new THREE.Object3D();
			batSceneObject.add( batmanChaosObject );
			
		// LIGHTS
		batLightsObject = new THREE.Object3D();
		scene.add( batLightsObject );
		
		initMaterials();
		
		initLogo();
		initHead();
		initChaos();
		initBackground();
		
		initComputeRenderer();
		initBats();
		
		initDeviceMotion();
		
		// LISTENERS
		window.addEventListener( 'resize', onWindowResize, false );
		if (!deviceSettings.isMobile) {
			initListeners();
		}
		
		TweenMax.set( "#interactive", { autoAlpha: 1, display: 'block' } );
		render();
	}
	
	
	var gyroNorm,
		gyroMotion = {},
		gyroMotionSupported = false,
    	gyroAccelerationX,
		gyroAccelerationY,
		gyroAccelerationZ;
    function initDeviceMotion() {

        // firefox breaks things, so it's not invited to the party
        if (navigator.userAgent.toLowerCase().indexOf('firefox') > -1) return;
		if (typeof GyroNorm === 'undefined') return;
		
        // normalization library for device motion events
        gyroNorm = new GyroNorm();
		
        gyroNorm.init().then(function(e){
			var isDeviceMotion = gyroNorm.isAvailable(GyroNorm.ACCELERATION_INCLUDING_GRAVITY);
            if (isDeviceMotion) {
				gyroNorm.start(function(data){
					onDeviceMove(data);
				});
            }
        }).catch(function(){});
    }
	
    function onDeviceMove(data) {
		gyroMotionSupported = true;
        gyroMotion.x = data.dm.gx;
        gyroMotion.y = data.dm.gy;
        gyroMotion.z = data.dm.gz;
    }
	
    function updateDeviceMotion() {
		gyroAccelerationX = -gyroMotion.x;
		gyroAccelerationY = gyroMotion.y;
		gyroAccelerationZ = gyroMotion.z;
		
		targetDeviceRotationX = -(gyroAccelerationX * 3);  
		targetDeviceRotationY = -(gyroAccelerationZ * 3 + 20);
    }
	
	
	function initListeners() {
		document.addEventListener( 'mousedown', onMouseDown, false );
		document.addEventListener( 'touchstart', onTouchStart, false );
		document.addEventListener( 'touchmove', onTouchMove, false );
		document.addEventListener( 'touchend', onTouchEnd, false );
		window.addEventListener( 'mousemove', onMouseMove, false );
	}
	
	var batLogoMaterial;
	var batHeadMaterial;
	function initMaterials() {
		batLogoMaterial = new THREE.MeshPhongMaterial({
			color: 0x686d73,
			specular: 0x050505,
			shininess: 100,
			shading: THREE.FlatShading,
			side: THREE.DoubleSide,
			//depthTest: false,
			//depthWrite: false,
			transparent: true,
			opacity: 0
		});
		batLogoMaterial.needsUpdate = true;
		
		batHeadMaterial = new THREE.MeshPhongMaterial({ 
			color: 0x686d73,
			specular: 0x050505,
			shininess: 100,
			shading: THREE.FlatShading,
			side: THREE.DoubleSide,
			//depthTest: false,
			//depthWrite: false,
			transparent: true,
			opacity: 0
		});
		batHeadMaterial.needsUpdate = true;
	}
	
	// BACKGROUND
	var batBgObject;
	var batBgTexture;
	var batBgMaterial;
	var batBgGeometry;
	var batBgMesh;
	function initBackground() {
		
		batBgObject = new THREE.Object3D();
		scene.add( batBgObject );
		
		// file:// blocks WebGL textures from local image URLs; prefer embedded data URL
		var batBgSrc = (typeof BAT_BG_DATA_URL === 'string') ? BAT_BG_DATA_URL : (asset_url+"/3d/background.jpg");
		batBgTexture = new THREE.TextureLoader().load(batBgSrc);
		batBgTexture.wrapS = batBgTexture.wrapT = THREE.MirroredRepeatWrapping;
		batBgMaterial = new THREE.MeshBasicMaterial({
			side: THREE.DoubleSide,
			map: batBgTexture
			//color: 0xFF0000,
			//wireframe: true
		})
				
		//batBgGeometry = new THREE.SphereGeometry(500, 16, 8, 0, 2, 1, 1.2);
		batBgGeometry = new THREE.SphereGeometry(2100, 32, 16, 1, 3, 0.8, 1.2);
		
		batBgMesh = new THREE.Mesh(batBgGeometry, batBgMaterial);
		batBgMesh.scale.x = batBgMesh.scale.y = batBgMesh.scale.z = 1;
		batBgMesh.position.y = -200;
		batBgMesh.position.z = -1000;
		batBgMesh.rotation.y = -260 * toRAD;
		batBgObject.add(batBgMesh);
	}
	
	function updateBackground() {
		if (deviceSettings.isMobile) {
			batBgObject.rotation.x -= ( ((targetDeviceRotationY * 0.1
			) * toRAD) + batBgObject.rotation.x ) * 0.05;
			batBgObject.rotation.y -= ( ((targetDeviceRotationX * 0.5) * toRAD) + batBgObject.rotation.y ) * 0.05;
		} else {
			batBgObject.rotation.x -= ( (targetSubtleRotationY/20 * toRAD) + batBgObject.rotation.x ) * 0.05;
			batBgObject.rotation.y -= ( (targetSubtleRotationX/20 * toRAD) + batBgObject.rotation.y ) * 0.05;
		}
	}
	
	
	
	// BAT LOGO
	var batLogoObject;
	var batLogoMesh;
	var batLogoGeometry;
	var batLogoMeshLoaded = false;
	var batLogoParticleDistance = 2;
	var batLogoParticleSegments;
	var batLogoParticleDetails = [];
	var batLogoFaceDetails = [];
	function initLogo() {
		
		batLogoObject = new THREE.Object3D();
		batModelObject.add( batLogoObject );
			
		var loaderBatLogo = new THREE.OBJLoader( manager );
		function onBatLogoLoaded( object ) {
			object.traverse( function ( child ) {
				if ( child instanceof THREE.Mesh ) {
					child.geometry.computeVertexNormals();
					batLogoGeometry = new THREE.Geometry().fromBufferGeometry(child.geometry);
				}
			});
			batLogoMesh = new THREE.Mesh( batLogoGeometry, batLogoMaterial );
			batLogoMesh.scale.x = batLogoMesh.scale.y = batLogoMesh.scale.z = 1.0;
			batLogoObject.add( batLogoMesh );
			
			batLogoParticleSegments = batLogoGeometry.vertices.length;
			for(var i = 0; i < batLogoParticleSegments; i++) {
				var x = batLogoGeometry.vertices[i].x;
				var y = batLogoGeometry.vertices[i].y;
				var z = batLogoGeometry.vertices[i].z;
				batLogoParticleDetails.push({
					origin: new THREE.Vector3(x, y, z),
					current: new THREE.Vector3(x, y, z),
					pointA: new THREE.Vector3(x + Math.random() * batLogoParticleDistance, y + Math.random() * batLogoParticleDistance, z + Math.random() * batLogoParticleDistance*3),
					pointB: new THREE.Vector3(x + Math.random() * batLogoParticleDistance, y + Math.random() * batLogoParticleDistance, z + Math.random() * batLogoParticleDistance*3),
					phase: new THREE.Vector3( 0, 0, 0 ),
					speed: new THREE.Vector3(Math.random() * 0.03 + 0.003, Math.random() * 0.03 + 0.003, Math.random() * 0.03 + 0.003)
				});
			}
			
			// LOOP FOR THE FACE ATTRIBUTES
			for(var i = 0; i < batLogoParticleSegments; i++) {
				if (i % 3 === 0) {
					var tempX = (batLogoParticleDetails[i].origin.x + batLogoParticleDetails[i].origin.x + batLogoParticleDetails[i].origin.x) / 3;
					var tempY = (batLogoParticleDetails[i+1].origin.y + batLogoParticleDetails[i+1].origin.y + batLogoParticleDetails[i+1].origin.y) / 3;
					var tempZ = (batLogoParticleDetails[i+2].origin.z + batLogoParticleDetails[i+2].origin.z + batLogoParticleDetails[i+2].origin.z) / 3;
					
					batLogoFaceDetails.push({
						origin: new THREE.Vector3(tempX, tempY, tempZ),
						current: new THREE.Vector3(0, 0, 0),
						target: new THREE.Vector3(0, 0, 0),
						extra: new THREE.Vector3(0, 0, 0),
						speed: Math.random() * 0.08 + 0.01
					});
				}
			}
			
			batLogoGeometry.verticesNeedUpdate = true;
			batLogoMeshLoaded = true;
			
			checkPreload3d();
			
		}
		// file:// cannot XHR .obj files; use embedded JS string when present
		if (typeof BAT_EXPLODE_OBJ === 'string') {
			onBatLogoLoaded( loaderBatLogo.parse( BAT_EXPLODE_OBJ ) );
		} else {
			loaderBatLogo.load( asset_url+'/3d/bat_explode.obj', onBatLogoLoaded, onProgress, onError );
		}
	}
	
	function animateLogo() {
		if (!batLogoMeshLoaded) return;
		if (!batLogoMesh.visible) return;
		
		var faceGroupId = 0;
		for(var i = 0; i < batLogoParticleSegments; i++) {
			var ed = batLogoParticleDetails[i];
			ed.phase.x += ed.speed.x;
			ed.phase.y += ed.speed.y;
			ed.phase.z += ed.speed.z;
			var tx = Math.sin(ed.phase.x);
			var ty = Math.sin(ed.phase.y);
			var tz = Math.sin(ed.phase.z);
			
			// AMBIENT MOVEMENT
			ed.current.x = ed.pointA.x + (ed.pointB.x - ed.pointA.x) * tx;
			ed.current.y = ed.pointA.y + (ed.pointB.y - ed.pointA.y) * ty;
			ed.current.z = ed.pointA.z + (ed.pointB.z - ed.pointA.z) * tz;
			
			batLogoGeometry.vertices[i].x = ed.current.x;
			batLogoGeometry.vertices[i].y = ed.current.y;
			batLogoGeometry.vertices[i].z = ed.current.z;
			
			var p 
			if (i % 3 === 0) {
				p = batLogoFaceDetails[faceGroupId];
				var x0 = p.origin.x;
				var y0 = p.origin.y;
				var z0 = p.origin.z;
				var x1 = batBallMesh.position.x;
				var y1 = batBallMesh.position.y;
				var z1 = batBallMesh.position.z;
				var distancex = x1-x0;
				var distancey = y1-y0;
				var distancez = z1-z0;
				var distance = Math.sqrt((distancex * distancex) + (distancey * distancey));
				
				var buffer = 20;
				var newExtraX = 0;
				var newExtraY = 0;
				var newExtraZ = 0;
				
				// Explode outward from cursor and hold (June 2016 behavior)
				if (distance < buffer) {
					if (distance < buffer/2) {
						newExtraX = -(distancex/buffer * 20);
						newExtraY = -(distancey/buffer * 20);
					} else {
						newExtraX = -(distancex/buffer * 40);
						newExtraY = -(distancey/buffer * 40);
					}
				}
				
				p.current.x += (p.target.x - p.current.x) * p.speed;
				p.current.y += (p.target.y - p.current.y) * p.speed;
				p.current.z += (p.target.z - p.current.z) * p.speed;
	
				p.extra.x += (newExtraX - p.extra.x) * 0.1;
				p.extra.y += (newExtraY - p.extra.y) * 0.1;
				p.extra.z += (newExtraZ - p.extra.z) * 0.1;
				
				faceGroupId++;
			}
			
			batLogoGeometry.vertices[i].x = ed.current.x + p.extra.x + p.current.x;
			batLogoGeometry.vertices[i].y = ed.current.y + p.extra.y + p.current.y;
			batLogoGeometry.vertices[i].z = ed.current.z + p.extra.z + p.current.z;
		}
		
		batLogoGeometry.verticesNeedUpdate = true;
	}
	
	
	
	
	
	// BATMAN HEAD
	var batHeadObject;
	var batHeadMesh;
	var batHeadGeometry;
	var batHeadMeshLoaded = false;
	var batHeadParticleDistance = 4;
	var batHeadParticleSegments;
	var batHeadParticleDetails = [];
	var batHeadFaceDetails = [];
	function initHead() {
		
		batHeadObject = new THREE.Object3D();
		batModelObject.add( batHeadObject );
		
		var loaderBatHead = new THREE.OBJLoader( manager );
		function onBatHeadLoaded( object ) {
			object.traverse( function ( child ) {
				if ( child instanceof THREE.Mesh ) {
					child.geometry.computeVertexNormals();
					batHeadGeometry = new THREE.Geometry().fromBufferGeometry(child.geometry);
				}
			});
			batHeadMesh = new THREE.Mesh( batHeadGeometry, batHeadMaterial );
			batHeadMesh.scale.x = batHeadMesh.scale.y = batHeadMesh.scale.z = 1.0;
			batHeadObject.add( batHeadMesh );

			batHeadParticleSegments = batHeadGeometry.vertices.length;
			for(var i = 0; i < batHeadParticleSegments; i++) {
				var x = batHeadGeometry.vertices[i].x;
				var y = batHeadGeometry.vertices[i].y;
				var z = batHeadGeometry.vertices[i].z;
				batHeadParticleDetails.push({
					origin: new THREE.Vector3(x, y, z),
					current: new THREE.Vector3(x, y, z),
					pointA: new THREE.Vector3(x + Math.random() * batHeadParticleDistance, y + Math.random() * batHeadParticleDistance, z + Math.random() * batHeadParticleDistance*3),
					pointB: new THREE.Vector3(x + Math.random() * batHeadParticleDistance, y + Math.random() * batHeadParticleDistance, z + Math.random() * batHeadParticleDistance*3),
					phase: new THREE.Vector3( 0, 0, 0 ),
					speed: new THREE.Vector3(Math.random() * 0.03 + 0.003, Math.random() * 0.03 + 0.003, Math.random() * 0.03 + 0.003)
				});
			}
			
			// LOOP FOR THE FACE ATTRIBUTES
			for(var i = 0; i < batHeadParticleSegments; i++) {
				if (i % 3 === 0) {
					var tempX = (batHeadParticleDetails[i].origin.x + batHeadParticleDetails[i].origin.x + batHeadParticleDetails[i].origin.x) / 3;
					var tempY = (batHeadParticleDetails[i+1].origin.y + batHeadParticleDetails[i+1].origin.y + batHeadParticleDetails[i+1].origin.y) / 3;
					var tempZ = (batHeadParticleDetails[i+2].origin.z + batHeadParticleDetails[i+2].origin.z + batHeadParticleDetails[i+2].origin.z) / 3;
					
					batHeadFaceDetails.push({
						origin: new THREE.Vector3(tempX, tempY, tempZ),
						current: new THREE.Vector3(0, 0, 0),
						target: new THREE.Vector3(0, 0, 0),
						extra: new THREE.Vector3(0, 0, 0),
						speed: Math.random() * 0.08 + 0.01
					});
				}
			}
			
			batHeadGeometry.verticesNeedUpdate = true;
			batHeadMeshLoaded = true;
			
			checkPreload3d();
			
		}
		// file:// cannot XHR .obj files; use embedded JS string when present
		if (typeof BATMAN_BACK_EXPLODED_OBJ === 'string') {
			onBatHeadLoaded( loaderBatHead.parse( BATMAN_BACK_EXPLODED_OBJ ) );
		} else {
			loaderBatHead.load( asset_url+'/3d/batman_back_exploded.obj', onBatHeadLoaded, onProgress, onError );
		}
	}
	
	function animateHead() {
		if (!batHeadMeshLoaded) return;
		if (!batHeadMesh.visible) return;
		
		
		var faceGroupId = 0;
		for(var i = 0; i < batHeadParticleSegments; i++) {
			var ed = batHeadParticleDetails[i];
			ed.phase.x += ed.speed.x;
			ed.phase.y += ed.speed.y;
			ed.phase.z += ed.speed.z;
			var tx = Math.sin(ed.phase.x);
			var ty = Math.sin(ed.phase.y);
			var tz = Math.sin(ed.phase.z);
			
			// AMBIENT MOVEMENT
			ed.current.x = ed.pointA.x + (ed.pointB.x - ed.pointA.x) * tx;
			ed.current.y = ed.pointA.y + (ed.pointB.y - ed.pointA.y) * ty;
			ed.current.z = ed.pointA.z + (ed.pointB.z - ed.pointA.z) * tz;
			
			batHeadGeometry.vertices[i].x = ed.current.x;
			batHeadGeometry.vertices[i].y = ed.current.y;
			batHeadGeometry.vertices[i].z = ed.current.z;
			
			var p 
			if (i % 3 === 0) {
				p = batHeadFaceDetails[faceGroupId];
				var x0 = p.origin.x;
				var y0 = p.origin.y;
				var z0 = p.origin.z;
				var x1 = batBallMesh.position.x;
				var y1 = batBallMesh.position.y;
				var z1 = batBallMesh.position.z;
				var distancex = x1-x0;
				var distancey = y1-y0;
				var distancez = z1-z0;
				var distance = Math.sqrt((distancex * distancex) + (distancey * distancey));
				
				var buffer = 20;
				var newExtraX = 0;
				var newExtraY = 0;
				var newExtraZ = 0;
				
				// Explode outward from cursor and hold (June 2016 behavior)
				if (distance < buffer) {
					if (distance < buffer/2) {
						newExtraX = -(distancex/buffer * 20);
						newExtraY = -(distancey/buffer * 20);
					} else {
						newExtraX = -(distancex/buffer * 40);
						newExtraY = -(distancey/buffer * 40);
					}
				}
				
				p.current.x += (p.target.x - p.current.x) * p.speed;
				p.current.y += (p.target.y - p.current.y) * p.speed;
				p.current.z += (p.target.z - p.current.z) * p.speed;
	
				p.extra.x += (newExtraX - p.extra.x) * 0.1;
				p.extra.y += (newExtraY - p.extra.y) * 0.1;
				p.extra.z += (newExtraZ - p.extra.z) * 0.1;
				
				faceGroupId++;
			}
			
			batHeadGeometry.vertices[i].x = ed.current.x + p.extra.x + p.current.x;
			batHeadGeometry.vertices[i].y = ed.current.y + p.extra.y + p.current.y;
			batHeadGeometry.vertices[i].z = ed.current.z + p.extra.z + p.current.z;
		}
		
		batHeadGeometry.verticesNeedUpdate = true;
	}
	
	
	
	var currentModel = "";
	function changeModel() {
		hideModel(currentModel);
		switch (currentSection) {
			case "home":
				break;
			case "signup":
				break;
			case "empty":
				break;
			case "":
				break;
		}
		currentModel = currentSection;
		
		showModel(currentModel);
	}
	
	var isIntro = false;
	function showModel(target) {
		switch (target) {
			case "home":						
				batLogoIntro.fromTo( batLogoMaterial, 3, { opacity: 0 }, { opacity: 1, ease: Expo.easeOut, onStart: function() {
					batLogoObject.visible = true;
				}}, 0);						
				
				if (!isIntro) {
					isIntro = true;
					modelAnimate("home", "intro");
				} else {
					modelAnimate("home", "show");
					batLogoIntro.fromTo( batLogoObject.rotation, 2, { y: (45 * toRAD) }, { y: 0, ease: Expo.easeOut }, 0);
				}
				batLogoIntro.play(0);	
									
				break;
			case "preorder":
			case "signup":
				batHeadIntro.fromTo( batHeadMaterial, 3, { opacity: 0 }, { opacity: 1, ease: Expo.easeOut, onStart: function() {
					batHeadObject.visible = true;
				}}, 0);
				batHeadIntro.fromTo( batHeadObject.rotation, 2, { y: (45 * toRAD) }, { y: 0, ease: Expo.easeOut }, 0);
				batHeadIntro.play(0);	
				
				modelAnimate("preorder", "show");		
				break;
			case "trailer":
				break;
			case "":
				break;
		}
	}
	
	function hideModel(target) {
		switch (target) {
			case "home":
				batLogoOutro.to( batLogoMaterial, 1, { opacity: 0, ease: Expo.easeOut, onComplete: function() {
					batLogoObject.visible = false;
				}}, 0);
				batLogoOutro.fromTo( batLogoObject.rotation, 2, { y: 0 }, { y: (-45 * toRAD), ease: Expo.easeOut }, 0);
				batLogoOutro.play(0);
				
				modelAnimate("home", "hide");
				break;
			case "preorder":
			case "signup":
				batHeadOutro.to( batHeadMaterial, 1, { opacity: 0, ease: Expo.easeOut, onComplete: function() {
					batHeadObject.visible = false;
				}}, 0);
				batHeadOutro.fromTo( batHeadObject.rotation, 2, { y: 0 }, { y: (-45 * toRAD), ease: Expo.easeOut }, 0);
				batHeadOutro.play(0);
				
				modelAnimate("preorder", "hide");	
				break;
			case "trailer":
				break;
			case "":
				break;
		}
	}
	
	function modelAnimate(target, direction) {
		if (target == "home") {
			
			if (direction == "intro") {
				for( var i = 0; i < batLogoFaceDetails.length; i++ ) {
					batLogoFaceDetails[i].current.y = -75;
					batLogoFaceDetails[i].target.x = 0;
					batLogoFaceDetails[i].target.y = 0;
					batLogoFaceDetails[i].target.z = 0;
				}
			}
			
			if (direction == "show") {
				for( var i = 0; i < batLogoFaceDetails.length; i++ ) {
					batLogoFaceDetails[i].current.y = 75;
					batLogoFaceDetails[i].target.x = 0;
					batLogoFaceDetails[i].target.y = 0;
					batLogoFaceDetails[i].target.z = 0;
				}
			}
			if (direction == "hide") {
				for( var i = 0; i < batLogoFaceDetails.length; i++ ) {
					batLogoFaceDetails[i].target.y = -75;
				}
			}
		}
		if (target == "preorder" || target == "signup") {
			if (direction == "show") {
				for( var i = 0; i < batHeadFaceDetails.length; i++ ) {
					batHeadFaceDetails[i].current.y = 75;
					batHeadFaceDetails[i].target.x = 0;
					batHeadFaceDetails[i].target.y = 0;
					batHeadFaceDetails[i].target.z = 0;
				}
			}
			if (direction == "hide") {
				for( var i = 0; i < batHeadFaceDetails.length; i++ ) {
					batHeadFaceDetails[i].target.y = -75;
				}
			}
		}
	}
	
	function updateModels() {
		if (isMouseDown) {
		} else {
			currentRotationX += 0.01;
		};
		
		if (deviceSettings.isMobile) {
			batSceneObject.rotation.x -= ( (targetDeviceRotationY * toRAD) + batSceneObject.rotation.x ) * 0.05;
			batSceneObject.rotation.y -= ( (targetDeviceRotationX * toRAD) + batSceneObject.rotation.y ) * 0.05;
		} else {
			batSceneObject.rotation.x -= ( (targetSubtleRotationY/10 * toRAD) + batSceneObject.rotation.x ) * 0.05;
			batSceneObject.rotation.y -= ( (targetSubtleRotationX/10 * toRAD) + batSceneObject.rotation.y ) * 0.05;
		}
		
		animateLogo();
		animateHead();
	}
	
	
	
	
	
	
	
	
	
	
	
	// CHAOS TRIANGLE PARTICLES FLYING AROUND
	var chaosMesh;
	var chaosGeometry
	var chaosMaterial
	var chaosInstances = 2000;
	
	function createVertices() {
		var triangles = 1;
		var vertices = new THREE.BufferAttribute( new Float32Array( triangles * 3 * 3 ), 3 );
		vertices.setXYZ( 0, 0.025, -0.025, 0 );
		vertices.setXYZ( 1.5, -.025, 0.025, 0 );
		vertices.setXYZ( 2, 0, 0, 0.025 );
		vertices.setXYZ( .5, 0, 0.025, 0 );
		return vertices;
	}
	function createOffsets(chaosInstances) {
		var offsets = new THREE.InstancedBufferAttribute( new Float32Array( chaosInstances * 3 ), 3, 1 );
		for ( var i = 0, ul = offsets.count; i < ul; i++ ) {
			offsets.setXYZ( i, Math.random() - 0.5, Math.random() - 0.5, Math.random() - 0.5 );
		}
		return offsets;
	}
	function createColors(chaosInstances) {
		var colors = new THREE.InstancedBufferAttribute( new Float32Array( chaosInstances * 4 ), 4, 1 );
		// NORMAL BLUE
		var tempRed = 50 / 255;
		var tempGreen = 70 / 255;
		var tempBlue = 90 / 255;
		var tempRed = 38 / 255;
		var tempGreen = 44 / 255;
		var tempBlue = 51 / 255;
		
		for ( var i = 0, ul = colors.count; i < ul; i++ ) {
			colors.setXYZW( i, tempRed, tempGreen, tempBlue, Math.random() );
		}
		return colors;
	}
	function createOrientationStarts(chaosInstances) {
		var vector = new THREE.Vector4();
		var orientationsStart = new THREE.InstancedBufferAttribute( new Float32Array( chaosInstances * 4 ), 4, 1 );
		for ( var i = 0, ul = orientationsStart.count; i < ul; i++ ) {
			vector.set( Math.random() * 2 - 1, Math.random() * 2 - 1, Math.random() * 2 - 1, Math.random() * 2 - 1 );
			vector.normalize();
			orientationsStart.setXYZW( i, vector.x, vector.y, vector.z, vector.w );
		}
		return orientationsStart;
	}
	function createOrientationEnds(chaosInstances) {
		var vector = new THREE.Vector4();
		var orientationsEnd = new THREE.InstancedBufferAttribute( new Float32Array( chaosInstances * 4 ), 4, 1 );
		for ( var i = 0, ul = orientationsEnd.count; i < ul; i++ ) {
			vector.set( Math.random() * 2 - 1, Math.random() * 2 - 1, Math.random() * 2 - 1, Math.random() * 2 - 1 );
			vector.normalize();
			orientationsEnd.setXYZW( i, vector.x, vector.y, vector.z, vector.w );
		}
		return orientationsEnd;
	}
	
	function createTimeSpeed(chaosInstances) {
		
		var timeSpeeds = new THREE.BufferAttribute( new Float32Array( chaosInstances ), 1 );
		var tempSpeed;
		for ( var i = 0, ul = timeSpeeds.count; i < ul; i++ ) {
			if (i % 3 === 0) {
				tempSpeed = Math.random() * .1;
			}
			timeSpeeds.array[i] = tempSpeed;
		}
		return timeSpeeds;
	}
	
	function initChaos() {
		chaosGeometry = new THREE.InstancedBufferGeometry();
		chaosGeometry.addAttribute( 'position', createVertices() );
		chaosGeometry.addAttribute( 'offset', createOffsets(chaosInstances));
		chaosGeometry.addAttribute( 'color', createColors(chaosInstances));
		chaosGeometry.addAttribute( 'orientationStart', createOrientationStarts(chaosInstances));
		chaosGeometry.addAttribute( 'orientationEnd', createOrientationEnds(chaosInstances));
		chaosGeometry.addAttribute( 'timeSpeed', createTimeSpeed(chaosInstances));
		
		var sizes = new Float32Array( chaosInstances );
		var tempSize;
		for( var i = 0; i < chaosInstances; i++) {
			if (i % 3 === 0) {
				tempSize = Math.random() * 3; //Math.random() - 0.5  // Math.floor(Math.random());
			}
			sizes[ i ] = tempSize;
		}
		chaosGeometry.addAttribute( 'size', new THREE.BufferAttribute( sizes, 1 ) );
		
		chaosMaterial = new THREE.RawShaderMaterial( {
			uniforms: {
				time: { type: "f", value: 1.0 },
				opacity: { type: "f", value: 0.0 },
				sineTime: { type: "f", value: 1.0 }
			},
			vertexShader: document.getElementById( 'vertexShader' ).textContent,
			fragmentShader: document.getElementById( 'fragmentShader' ).textContent,
			side: THREE.DoubleSide,
			transparent: true
		} );
		chaosMesh = new THREE.Mesh( chaosGeometry, chaosMaterial );
		chaosMesh.scale.x = chaosMesh.scale.y = chaosMesh.scale.z = 200;
		batmanChaosObject.add( chaosMesh );
	}
	
	function updateChaos() {
		var time = performance.now();
		chaosMesh.material.uniforms.time.value = time;
		batmanChaosObject.rotation.y += 0.0001;
		
		var timeSpeed = chaosGeometry.attributes.timeSpeed.array;
		var tempSize;
		for ( var i = 0; i < chaosInstances; i++ ) {
			if (i % 3 === 0) {
				tempSize = ( 2 + Math.sin( 0.5 * i + (time * 0.5) * 0.0001 ) );
			}
			timeSpeed[ i ] = tempSize;
		}
		chaosGeometry.attributes.timeSpeed.needsUpdate = true;
	}
	
	
	
	
	
			
	
	
	
	
	
	
	
	// SWARMING BATS FLYING AROUND
	var BAT_WIDTH = 8;		// NUMBER OF BATS * 4
	var BATS = BAT_WIDTH * BAT_WIDTH;
	var BOUNDS = 800, 
		BOUNDS_HALF = BOUNDS / 2;
	var batLast = performance.now();
	var gpuCompute;
	var batUniforms;
	var velocityVariable;
	var positionVariable;
	var positionUniforms;
	var velocityUniforms;
	
	// Custom Geometry - using 3 triangles each. No UVs, no normals currently.
	THREE.BirdGeometry = function () {
	
		var wingsSpan = 20;
		var triangles = BATS * 3 * 3;
		var points = triangles * 3;
	
		THREE.BufferGeometry.call( this );
	
		var vertices = new THREE.BufferAttribute( new Float32Array( points * 3 ), 3 );
		var birdColors = new THREE.BufferAttribute( new Float32Array( points * 3 ), 3 );
		var references = new THREE.BufferAttribute( new Float32Array( points * 2 ), 2 );
		var birdVertex = new THREE.BufferAttribute( new Float32Array( points ), 1 );
	
		this.addAttribute( 'position', vertices );
		this.addAttribute( 'birdColor', birdColors );
		this.addAttribute( 'reference', references );
		this.addAttribute( 'birdVertex', birdVertex );
	
		var v = 0;
	
		function verts_push() {
			for (var i=0; i < arguments.length; i++) {
				vertices.array[v++] = arguments[i];
			}
		}
	
		for (var f = 0; f<BATS; f++ ) {
			// X, Z, Y
			// LEFT WING
			verts_push(
				0, 0, -15,			// BOTTOM POINT
				-wingsSpan, 0, 0,	// MID POINT
				0, 0, 0				// TOP
			);
			// RIGHT WING
			verts_push(
				0, 0, -15,
				wingsSpan, 0, 0,
				0, 0, 0
			);
			// HEAD
			verts_push(
				0, 0, -15,
				-3, 0, 2,
				3, 0, 2
			);
			// EARS
			verts_push(
				0, 0, -10,
				4, 0, -5,
				2, 0, 8
			);
			verts_push(
				0, 0, -10,
				-4, 0, -5,
				-2, 0, 8
			);
			// EMPTY
			verts_push( 0, 0, 0, 0, 0, 0, 0, 0, 0 );
			verts_push( 0, 0, 0, 0, 0, 0, 0, 0, 0 );
			verts_push( 0, 0, 0, 0, 0, 0, 0, 0, 0 );
			verts_push( 0, 0, 0, 0, 0, 0, 0, 0, 0 );
		}
	
		for( var v = 0; v < triangles * 3; v++ ) {
			var i = ~~(v / 3);
			var x = (i % BAT_WIDTH) / BAT_WIDTH;
			var y = ~~(i / BAT_WIDTH) / BAT_WIDTH;
			var c = new THREE.Color(
				0x444444 +
				~~(v / 9) / BATS * 0x666666
			);
			birdColors.array[ v * 3 + 0 ] = c.r;
			birdColors.array[ v * 3 + 1 ] = c.g;
			birdColors.array[ v * 3 + 2 ] = c.b;
			references.array[ v * 2     ] = x;
			references.array[ v * 2 + 1 ] = y;
			birdVertex.array[ v         ] = v % (9 * 3);
		}
		this.scale( 0.25, 0.25, 0.25 );
	};
	
	THREE.BirdGeometry.prototype = Object.create( THREE.BufferGeometry.prototype );
	
	
	function initComputeRenderer() {
		gpuCompute = new GPUComputationRenderer( BAT_WIDTH, BAT_WIDTH, renderer );
	
		var dtPosition = gpuCompute.createTexture();
		var dtVelocity = gpuCompute.createTexture();
		fillPositionTexture( dtPosition );
		fillVelocityTexture( dtVelocity );
	
		velocityVariable = gpuCompute.addVariable( "textureVelocity", document.getElementById( 'batFragShaderVelocity' ).textContent, dtVelocity );
		positionVariable = gpuCompute.addVariable( "texturePosition", document.getElementById( 'batFragShaderPosition' ).textContent, dtPosition );
	
		gpuCompute.setVariableDependencies( velocityVariable, [ positionVariable, velocityVariable ] );
		gpuCompute.setVariableDependencies( positionVariable, [ positionVariable, velocityVariable ] );
	
		positionUniforms = positionVariable.material.uniforms;
		velocityUniforms = velocityVariable.material.uniforms;
	
		positionUniforms.time = { value: 0.0 };
		positionUniforms.delta = { value: 0.0 };
		velocityUniforms.time = { value: 1.0 };
		velocityUniforms.delta = { value: 0.0 };
		velocityUniforms.testing = { value: 1.0 };
		velocityUniforms.seperationDistance = { value: 1.0 };
		velocityUniforms.alignmentDistance = { value: 1.0 };
		velocityUniforms.cohesionDistance = { value: 1.0 };
		velocityUniforms.freedomFactor = { value: 1.0 };
		velocityUniforms.predator = { value: new THREE.Vector3() };
		velocityVariable.material.defines.BOUNDS = BOUNDS.toFixed( 2 );
		
		velocityUniforms.seperationDistance.value = 20.0;
		velocityUniforms.alignmentDistance.value = 20.0;
		velocityUniforms.cohesionDistance.value = 20.0;
		velocityUniforms.freedomFactor.value = 0.75;
	
		velocityVariable.wrapS = THREE.RepeatWrapping;
		velocityVariable.wrapT = THREE.RepeatWrapping;
		positionVariable.wrapS = THREE.RepeatWrapping;
		positionVariable.wrapT = THREE.RepeatWrapping;
	
		var error = gpuCompute.init();
		if ( error !== null ) {
			console.error( error );
		}
	}
	
	function initBats() {
		var geometry = new THREE.BirdGeometry();
	
		// For Vertex and Fragment
		batUniforms = {
			color: { value: new THREE.Color( 0xff2200 ) },
			texturePosition: { value: null },
			textureVelocity: { value: null },
			time: { value: 1.0 },
			delta: { value: 0.0 }
		};
	
		// ShaderMaterial
		var material = new THREE.ShaderMaterial( {
			uniforms:       batUniforms,
			vertexShader:   document.getElementById( 'batVertexShader' ).textContent,
			fragmentShader: document.getElementById( 'batFragShader' ).textContent,
			side: THREE.DoubleSide
	
		});
	
		birdMesh = new THREE.Mesh( geometry, material );
		birdMesh.rotation.y = Math.PI / 2;
		birdMesh.matrixAutoUpdate = false;
		birdMesh.updateMatrix();
	
		scene.add(birdMesh);
	}
	
	function fillPositionTexture( texture ) {
		var theArray = texture.image.data;
		for ( var k = 0, kl = theArray.length; k < kl; k += 4 ) {
			var x = Math.random() * BOUNDS - BOUNDS_HALF;
			var y = Math.random() * BOUNDS - BOUNDS_HALF;
			var z = Math.random() * BOUNDS - BOUNDS_HALF;
			theArray[ k + 0 ] = x;
			theArray[ k + 1 ] = y;
			theArray[ k + 2 ] = z;
			theArray[ k + 3 ] = 1;
		}
	}
	
	function fillVelocityTexture( texture ) {
		var theArray = texture.image.data;
		for ( var k = 0, kl = theArray.length; k < kl; k += 4 ) {
			var x = Math.random() - 0.5;
			var y = Math.random() - 0.5;
			var z = Math.random() - 0.5;
			theArray[ k + 0 ] = x * 10;
			theArray[ k + 1 ] = y * 10;
			theArray[ k + 2 ] = z * 10;
			theArray[ k + 3 ] = 1;
		}
	}
	
	function updateBats() {
		var batNow = performance.now();
		var delta = (batNow - batLast) / 1000;
	
		if (delta > 1) delta = 1; // safety cap on large deltas
		batLast = batNow;
	
		positionUniforms.time.value = batNow;
		positionUniforms.delta.value = delta;
		velocityUniforms.time.value = batNow;
		velocityUniforms.delta.value = delta;
		batUniforms.time.value = batNow;
		batUniforms.delta.value = delta;
	
		velocityUniforms.predator.value.set( 0.5 * mouseX / windowHalfX, - 0.5 * mouseY / windowHalfY, 0 );
		//mouseX = 10000;
		//mouseY = 10000;
		gpuCompute.compute();
	
		batUniforms.texturePosition.value = gpuCompute.getCurrentRenderTarget( positionVariable ).texture;
		batUniforms.textureVelocity.value = gpuCompute.getCurrentRenderTarget( velocityVariable ).texture;
	}
	
	
	
	
	// RENDER LOOP
	function render() {
		updateBackground();
		updateModels();
		updateBats();
		updateChaos();
		
		if (gyroMotionSupported) updateDeviceMotion();
	
		//composer.render( );
		
		renderer.render( scene, camera );
		requestAnimationFrame( render );
	}
	
	
	
	
	
	
	
	
	
	
	
	
	// MOUSE LISTENERS
	function onWindowResize() {
		windowHalfX = window.innerWidth / 2;
		windowHalfY = window.innerHeight / 2;
	
		camera.aspect = window.innerWidth / window.innerHeight;
		camera.updateProjectionMatrix();
		
		renderer.setSize( window.innerWidth, window.innerHeight );
		
		//vblur.uniforms[ 'v' ].value = 3 / window.innerHeight;
		
		//composer.setSize( window.innerWidth, window.innerHeight );
		/*
		effectFXAA.uniforms['resolution'].value.set(1 / (window.innerWidth * dpr), 1 / (window.innerHeight * dpr));
		composer.setSize(window.innerWidth * dpr, window.innerHeight * dpr);
		*/
	}
	
	function onMouseDown( event ) {
		isMouseDown = true;
		
		//event.preventDefault();
		
		//window.addEventListener( 'mousemove', onMouseMove, false );
		window.addEventListener( 'mouseup', onMouseUp, false );
		window.addEventListener( 'mouseout', onMouseOut, false );
	
		onMouseDownX = event.clientX - windowHalfX;
		targetMouseDownX = targetRotationX;
		
		onMouseDownY = event.clientY - windowHalfY;
		targetMouseDownY = targetRotationY;
	}
	
	
	function onMouseMove( event ) {
		// SPHERE FOLLOW MOUSE
		mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
		mouse.y = - (event.clientY / window.innerHeight) * 2 + 1;
		var vector = new THREE.Vector3(mouse.x, mouse.y, 0.5);
		vector.unproject( camera );
		var dir = vector.sub( camera.position ).normalize();
		var distance = -camera.position.z / dir.z;
		var pos = camera.position.clone().add( dir.multiplyScalar( distance ) );
		batBallMesh.position.copy(pos);
		// MOUSE POSITION
		mouseX = event.clientX - windowHalfX;
		mouseY = event.clientY - windowHalfY;
		/*
		// CONTAINER ROTATION
		if (isMouseDown) {
			targetRotationY = targetMouseDownY + (mouseY - onMouseDownY) * 0.001;
			targetRotationX = targetMouseDownX + (mouseX - onMouseDownX) * 0.001;
		}
		*/
		targetSubtleRotationX = (mouseX - 0)/25;
		targetSubtleRotationY = (mouseY - 0)/25;
	}
	
	function onMouseUp( event ) {
		isMouseDown = false;
		//window.removeEventListener( 'mousemove', onMouseMove, false );
		window.removeEventListener( 'mouseup', onMouseUp, false );
		window.removeEventListener( 'mouseout', onMouseOut, false );
	}
	
	function onMouseOut( event ) {
		isMouseDown = false;
		//window.removeEventListener( 'mousemove', onMouseMove, false );
		window.removeEventListener( 'mouseup', onMouseUp, false );
		window.removeEventListener( 'mouseout', onMouseOut, false );
	}
	
	// TOUCH LISTENERS
	function onTouchStart( event ) {
		isMouseDown = true;
		if ( event.touches.length == 1 ) {
			event.preventDefault();
			onMouseDownX = event.touches[ 0 ].pageX - windowHalfX;
			targetMouseDownX = targetRotationX;
			
			onMouseDownY = event.touches[ 0 ].pageY - windowHalfY;
			targetMouseDownY = targetRotationY;
		}
	}
	
	function onTouchMove( event ) {
		if ( event.touches.length == 1 ) {
	
			event.preventDefault();
			mouseX = event.touches[ 0 ].pageX - windowHalfX;
			targetRotationX = targetMouseDownX + ( mouseX - onMouseDownX ) * 0.02;
			mouseY = event.touches[ 0 ].pageY - windowHalfY;
			targetRotationY = targetMouseDownY + (mouseY - onMouseDownY) * 0.02;
		}
	}
	
	function onTouchEnd( event ) {
		isMouseDown = false;
	}