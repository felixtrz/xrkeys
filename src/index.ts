import * as THREE from 'three';

import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader';

const KEY_MAPPING = {
	key1: ['q', 'Q', '1'],
	key2: ['w', 'W', '2'],
	key3: ['e', 'E', '3'],
	key4: ['r', 'R', '4'],
	key5: ['t', 'T', '5'],
	key6: ['y', 'Y', '6'],
	key7: ['u', 'U', '7'],
	key8: ['i', 'I', '8'],
	key9: ['o', 'O', '9'],
	key10: ['p', 'P', '0'],
	key11: ['a', 'A', '@'],
	key12: ['s', 'S', '#'],
	key13: ['d', 'D', '$'],
	key14: ['f', 'F', '&'],
	key15: ['g', 'G', '*'],
	key16: ['h', 'H', '('],
	key17: ['j', 'J', ')'],
	key18: ['k', 'K', "'"],
	key19: ['l', 'L', '"'],
	key21: ['z', 'Z', '-'],
	key22: ['x', 'X', '+'],
	key23: ['c', 'C', '='],
	key24: ['v', 'V', '/'],
	key25: ['b', 'B', ';'],
	key26: ['n', 'N', ':'],
	key27: ['m', 'M', '_'],
	key28: [',', ',', '!'],
	key29: ['.', '.', '?'],
	keyspace: [' ', ' ', ' '],
};

const raycaster = new THREE.Raycaster();

const loader = new GLTFLoader();

export type XRKeysConfig = {
	path?: string;
	keyMaskOffset?: number;
	hoverColor?: string;
	pressedColor?: string;
};

export default class XRKeys extends THREE.Group {
	private _keyboards: THREE.Mesh[] = [];

	private _keysetIndex = 0;

	private _isUpperCase = false;

	private _isNumber = false;

	private _keys: THREE.Object3D[];

	private _keyMask: THREE.Mesh;

	private _longKeyMask: THREE.Mesh;

	private _spaceKeyMask: THREE.Mesh;

	private _text: string = '';

	private _hoveredKey: {
		name: string;
		pressed: boolean;
	} | null = null;

	private _tempVec31 = new THREE.Vector3();

	private _tempVec32 = new THREE.Vector3();

	private _hoveredColor: string;

	private _pressedColor: string;

	public onEnter: (text: string) => {};

	private constructor(
		model: THREE.Object3D,
		keyMaskOffset = 0.00001,
		hoveredColor = '#666E73',
		pressedColor = '#ffffff',
	) {
		super();
		const lowerCaseKeys = model.getObjectByName('lowercase') as THREE.Mesh;
		const keysMaterial = new THREE.MeshBasicMaterial({
			map: (lowerCaseKeys.material as THREE.MeshStandardMaterial).map,
			transparent: true,
		});
		const upperCaseKeys = model.getObjectByName('uppercase') as THREE.Mesh;
		const numbersKeys = model.getObjectByName('number') as THREE.Mesh;
		lowerCaseKeys.material = keysMaterial;
		upperCaseKeys.material = keysMaterial;
		numbersKeys.material = keysMaterial;
		upperCaseKeys.visible = false;
		numbersKeys.visible = false;

		this._keyboards.push(lowerCaseKeys, upperCaseKeys, numbersKeys);

		const keymaskMaterial = new THREE.MeshBasicMaterial();
		this._keyMask = model.getObjectByName('shortkeymask') as THREE.Mesh;
		this._longKeyMask = model.getObjectByName('longkeymask') as THREE.Mesh;
		this._spaceKeyMask = model.getObjectByName('spacemask') as THREE.Mesh;
		this._keyMask.material = keymaskMaterial;
		this._longKeyMask.material = keymaskMaterial;
		this._spaceKeyMask.material = keymaskMaterial;
		this._keyMask.position.y = keyMaskOffset;
		this._longKeyMask.position.y = keyMaskOffset;
		this._spaceKeyMask.position.y = keyMaskOffset;
		this._keyMask.visible = false;
		this._longKeyMask.visible = false;
		this._spaceKeyMask.visible = false;

		this._keys = model.children.filter((child) => child.name.startsWith('key'));

		this._hoveredColor = hoveredColor;

		this._pressedColor = pressedColor;

		this.add(
			...this._keyboards,
			this._keyMask,
			this._longKeyMask,
			this._spaceKeyMask,
		);
	}

	public static async create(config: XRKeysConfig = {}) {
		const model = await loader.loadAsync(
			config.path ?? 'https://www.unpkg.com/xrkeys/dist/xrkeys.glb',
		);
		return new XRKeys(model.scene, config.keyMaskOffset);
	}

	public get activeKeyboard() {
		return this._keyboards[this._keysetIndex];
	}

	public get activeKeysetIndex() {
		return this._keysetIndex;
	}

	public get text() {
		return this._text;
	}

	private _updateKeyMask(
		keyMask: THREE.Mesh,
		key: THREE.Object3D,
		pressed: boolean,
	) {
		keyMask.position.set(key.position.x, 0.00001, key.position.z);
		keyMask.visible = true;
		(keyMask.material as THREE.MeshBasicMaterial).color.set(
			pressed ? this._pressedColor : this._hoveredColor,
		);
		this._hoveredKey = { name: key.name, pressed };
	}

	public update(targetRaySpace: THREE.Object3D, pressed: boolean) {
		this._keyMask.visible = false;
		this._longKeyMask.visible = false;
		this._spaceKeyMask.visible = false;
		this._keyboards.forEach((keyboard) => {
			keyboard.visible = false;
			keyboard.position.y = -0.01;
		});
		const activeKeys = this.activeKeyboard;
		activeKeys.visible = true;
		activeKeys.position.y = 0;

		const lastHoveredKey = this._hoveredKey;
		this._hoveredKey = null;

		raycaster.set(
			targetRaySpace.getWorldPosition(this._tempVec31),
			targetRaySpace.getWorldDirection(this._tempVec32).negate(),
		);

		const intersect = raycaster.intersectObject(activeKeys, true)[0];
		if (intersect) {
			const vec2 = new THREE.Vector2(
				(intersect.uv.x - 0.5) * 0.3495,
				(intersect.uv.y * 3 - this.activeKeysetIndex - 0.5) * 0.1425,
			);
			this._keys.forEach((key) => {
				if (['keydelete', 'keyenter', 'keyset'].includes(key.name)) {
					if (
						Math.abs(key.position.x - vec2.x) < 0.03225 &&
						Math.abs(key.position.z - vec2.y) < 0.015
					) {
						this._updateKeyMask(this._longKeyMask, key, pressed);
					}
				} else if (key.name === 'keyspace') {
					if (
						Math.abs(key.position.x - vec2.x) < 0.06675 &&
						Math.abs(key.position.z - vec2.y) < 0.015
					) {
						this._updateKeyMask(this._spaceKeyMask, key, pressed);
					}
				} else if (
					Math.abs(key.position.x - vec2.x) < 0.015 &&
					Math.abs(key.position.z - vec2.y) < 0.015
				) {
					this._updateKeyMask(this._keyMask, key, pressed);
				}
			});
			if (this._hoveredKey && lastHoveredKey) {
				if (
					this._hoveredKey.name === lastHoveredKey.name &&
					this._hoveredKey.pressed &&
					!lastHoveredKey.pressed
				) {
					const mapped =
						KEY_MAPPING[this._hoveredKey.name as keyof typeof KEY_MAPPING];
					if (mapped) {
						this._text += mapped[this.activeKeysetIndex];
						this.dispatchEvent({
							type: 'keypress',
							target: this,
							key: mapped[this.activeKeysetIndex],
						});
					} else {
						switch (this._hoveredKey.name) {
							case 'keydelete':
								this._text = this._text.slice(0, -1);
								this.dispatchEvent({
									type: 'keypress',
									target: this,
									key: 'delete',
								});
								break;
							case 'keyenter':
								if (this.onEnter) {
									this.onEnter(this._text);
									this._text = '';
								}
								this.dispatchEvent({
									type: 'keypress',
									target: this,
									key: 'enter',
								});
								break;
							case 'key20':
								if (this._isNumber) {
									this._text += '%';
									this.dispatchEvent({
										type: 'keypress',
										target: this,
										key: '%',
									});
								} else {
									this._isUpperCase = !this._isUpperCase;
									this._keysetIndex = this._isUpperCase ? 1 : 0;
								}
								break;
							case 'keyset':
								if (this._isNumber) {
									this._isNumber = false;
									this._keysetIndex = this._isUpperCase ? 1 : 0;
								} else {
									this._isNumber = true;
									this._keysetIndex = 2;
								}
								break;
							default:
								break;
						}
					}
				}
			}
		}
	}
}
