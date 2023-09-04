# XRKeys

[![npm version](https://badge.fury.io/js/xrkeys.svg)](https://badge.fury.io/js/xrkeys)
[![language](https://badgen.net/badge/icon/typescript?icon=typescript&label)](https://www.typescriptlang.org/)
[![license](https://badgen.net/github/license/felixtrz/xrkeys)](/LICENSE.md)

A highly performant and plug-and-play WebXR keyboard library for Three.js applications. XRKeys empowers your WebXR applications with typing capabilities at the minimal expense of just **two draw calls**, while eliminating the need for extra setup such as loading fonts for the keyboard.

![](example/xrkeys.gif)

## Features

- 🔌 **Plug-and-Play:** No need for extra setup like loading fonts for the keyboard. Just install and use it right away.
- ⚡️ **High Performance:** Requires only 2 drawcalls, minimal impact on performance of your WebXR applications.
- 🌍 **Three.js Compatible:** Specifically built for Three.js WebXR applications.

## Demo App

A demo app has been built using Three.js to showcase XRKeys in action. You can check out the demo app at https://felixtrz.github.io/xrkeys/ to see how XRKeys works and to get a feel for its capabilities.

This demo app is a great resource for developers who are considering using XRKeys in their projects. It provides a hands-on experience with the library and will give you a better understanding of how it works and what it can do.

## Installation

To install XRKeys, simply run the following command in your terminal:

```sh
$ npm install xrkeys
```

Or if you prefer using Yarn:

```sh
$ yarn add xrkeys
```

## Usage

Using XRKeys is simple. First, import the package in your WebXR project:

```js
import XRKeys from 'xrkeys';
```

> **_NOTE:_** NOTE: XRKeys requires Three.js as a peer dependency, make sure to have a recent version installed.

Then, create an instance of the XR keyboard:

```js
const keyboard = await XRKeys.create();
```

The XRKeys object created extends [THREE.Group](https://threejs.org/docs/#api/en/objects/Group), and can be used as such. Setup the keyboard and add it to your scene:

```js
// listen for keypress events
keyboard.addEventListener('keypress', (e) => {
	console.log('Key pressed: ' + e.key);
});

// you can bind a custom function to the enter key
keyboard.onEnter = (text) => {
	console.log('Entered text: ' + text);
};

scene.add(keyboard);
```

Update the keyboard in your render loop:

```js
function render() {
	// update the keyboard with a target ray and a pressing flag
	const targetRaySpace = renderer.xr.getController(0);
	keyboard.update(targetRaySpace, triggerIsPressed);

	// you can also access the keyboard's text content anytime
	console.log(keyboard.text);
}
```

## API Reference

### `XRKeysConfig` type

`XRKeysConfig` is an object type that can have the following optional properties:

- `path?: string`: Path override for custom keyboard model.
- `keyMaskOffset?: number`: Z Offset for the key mask.
- `hoverColor?: string`: Color of the key mask when hovered.
- `pressedColor?: string`: Color of the key mask when pressed.

### `XRKeys` class

`XRKeys` is a class that extends `THREE.Group`.

#### Properties

- `activeKeyboard: THREE.Mesh`: Returns the active keyboard mesh.
- `activeKeysetIndex: number`: Returns the index of the active keyset.
- `text: string`: Returns the text inputted using the keyboard.
- `onEnter: (text: string) => void`: Callback function called when the Enter key is pressed.

#### Methods

- `static create(config?: XRKeysConfig): Promise<XRKeys>`: Static method that creates and returns a promise that resolves to an `XRKeys` instance. Takes an optional `XRKeysConfig` object as a parameter.
- `update(targetRaySpace: THREE.Object3D, pressed: boolean): void`: Method to update the keyboard based on the target ray space and whether a key is being pressed.

## License

[MIT License](/LICENSE.md) © 2023 Felix Zhang
