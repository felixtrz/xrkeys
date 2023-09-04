import * as THREE from 'three';

import { BoxLineGeometry } from 'three/examples/jsm/geometries/BoxLineGeometry';
import { VRButton } from 'three/addons/webxr/VRButton.js';
import { XRConsoleFactory } from 'logxr';
import { XRControllerModelFactory } from 'three/examples/jsm/webxr/XRControllerModelFactory.js';
import XRKeys from 'xrkeys';

let camera, scene, renderer, targetRaySpace, xrkeys;

init();
animate();

function init() {
	scene = new THREE.Scene();
	scene.background = new THREE.Color(0x505050);

	camera = new THREE.PerspectiveCamera(
		50,
		window.innerWidth / window.innerHeight,
		0.1,
		10,
	);
	camera.position.set(0, 1.6, 3);

	const room = new THREE.LineSegments(
		new BoxLineGeometry(6, 6, 6, 10, 10, 10),
		new THREE.LineBasicMaterial({ color: 0x808080 }),
	);
	room.geometry.translate(0, 3, 0);
	scene.add(room);

	scene.add(new THREE.HemisphereLight(0x606060, 0x404040));

	const light = new THREE.DirectionalLight(0xffffff);
	light.position.set(1, 1, 1).normalize();
	scene.add(light);

	renderer = new THREE.WebGLRenderer({ antialias: true });
	renderer.setPixelRatio(window.devicePixelRatio);
	renderer.setSize(window.innerWidth, window.innerHeight);
	renderer.outputEncoding = THREE.sRGBEncoding;
	renderer.xr.enabled = true;
	renderer.xr.setFoveation(0);
	document.body.appendChild(renderer.domElement);

	document.body.appendChild(VRButton.createButton(renderer));

	const controllerModelFactory = new XRControllerModelFactory();
	for (let i = 0; i < 2; i++) {
		const controller = renderer.xr.getController(i);
		controller.addEventListener('connected', function (event) {
			if (event.data.handedness === 'left') {
				const xrConsole = XRConsoleFactory.getInstance().createConsole({
					pixelHeight: 512,
					pixelWidth: 1024,
					actualHeight: 0.25,
					actualWidth: 0.5,
					fontSize: 24,
				});
				controller.add(xrConsole);
				xrConsole.position.set(0, 0.26, -0.14);
				console.info('Welcome to XRKeys demo!');
				console.debug('Console powered by logxr');

				XRKeys.create().then((instance) => {
					xrkeys = instance;
					controller.add(xrkeys);
					xrkeys.addEventListener('keypress', (e) => {
						console.log('Key pressed: ' + e.key);
					});
					xrkeys.onEnter = (text) => {
						console.log('Entered text: ' + text);
					};
					xrkeys.position.set(0, 0.075, -0.075);
					xrkeys.rotateX(Math.PI / 4);
				});
			} else {
				const geometry = new THREE.BufferGeometry().setFromPoints([
					new THREE.Vector3(0, 0, 0),
					new THREE.Vector3(0, 0, -1),
				]);
				const line = new THREE.Line(geometry);
				line.name = 'line';
				line.scale.z = 5;
				controller.add(line);
				targetRaySpace = controller;
				targetRaySpace.userData = { selecting: false };
				controller.addEventListener('selectstart', function () {
					targetRaySpace.userData.selecting = true;
				});
				controller.addEventListener('selectend', function () {
					targetRaySpace.userData.selecting = false;
				});
			}
		});
		controller.addEventListener('disconnected', function () {
			if (event.data.handedness === 'left') {
				this.remove(this.children[0]);
			}
		});
		scene.add(controller);

		const controllerGrip = renderer.xr.getControllerGrip(i);
		controllerGrip.add(
			controllerModelFactory.createControllerModel(controllerGrip),
		);
		scene.add(controllerGrip);
	}

	renderer.xr.setFramebufferScaleFactor(2.0);

	window.addEventListener('resize', onWindowResize);
}

function onWindowResize() {
	camera.aspect = window.innerWidth / window.innerHeight;
	camera.updateProjectionMatrix();

	renderer.setSize(window.innerWidth, window.innerHeight);
}

function animate() {
	renderer.setAnimationLoop(render);
}

function render() {
	if (targetRaySpace && xrkeys) {
		xrkeys.update(targetRaySpace, targetRaySpace.userData.selecting);
	}
	renderer.render(scene, camera);
}
