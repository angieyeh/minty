# minty.js

[![npm version](https://badge.fury.io/js/minty.svg)](https://badge.fury.io/js/minty) [![Build Status](https://travis-ci.org/lumpy-turnips/minty.svg?branch=master)](https://travis-ci.org/lumpy-turnips/minty) [![Coverage Status](https://coveralls.io/repos/github/lumpy-turnips/minty/badge.svg?branch=master)](https://coveralls.io/github/lumpy-turnips/minty?branch=master) [![Dependencies](https://david-dm.org/lumpy-turnips/minty.svg?minty=minty)](https://david-dm.org/lumpy-turnips/minty#info=dependencies&view=list) [![Codacy Badge](https://api.codacy.com/project/badge/grade/b3826ca9b78f4cdbb151bef5d66e5136)](https://www.codacy.com/app/wade_2/minty)

Minty.js helps you keep your Node.js app minty-fresh. Run your code through
Minty.js to see the state of your variables as each line executes. Can't
figure out why you're not getting the output you expect? Minty.js will help you
see exactly where things go off the rails.

Minty.js is an npm module you install and run on your own development
environment, and which outputs to a file in that environment, so that you can be
confident you'll get the same results in debugging that you get in production.

Your code is yours, and your data is yours &mdash; your debugging results should
be as well. None of your work ever leaves your development environment when
you use Minty.js.

[![NPM](https://nodei.co/npm/minty.png)](https://nodei.co/npm/minty/)

## Current Status


Minty.js is __alpha__ code. Install and use at your own risk. May not work!
Even worse, may not be useful!

Minty.js is under active development, and we're iterating at a high rate.
Please do [open an issue](https://github.com/lumpy-turnips/minty/issues/new)
and let us know if you've found a significant bug.

## Requirements

Requires Node.js 4.0 or greater.

## How-To

1. `npm install -g minty` or `npm install --save-dev minty` (don't use minty in production!)
1. `const minty = require ('minty');` in the file you'd like to analyze
1. You can execute an entire file by typing `minty.file(//path to file)`. Note, the file path must be absolute, e.g. `minty.file(path.join(__dirname, ../lib/test.js))`
1. You can also 'mintify' a function by typing `var newFunc = minty.wrap(initialFunc)`, and then execute it by calling `newFunc()`
1. Run your code as usual (e.g. `node minty.js`) to generate the minty output. A new minty folder will appear in your root directory
1. Open the minty.html file in your browser in either the 'file' or 'function' folder (depending on whether you executed a file, function, or both). Note: data is stored in the mintyVis.js
1. Click forward and back to step through your variables' state as your app executes!

## Gotchas

* If you globally declare a variable without using let, var, or const, we won't track it.

## Examples (thanks to user [Bahmutov](https://github.com/bahmutov) for the write-up)

[Minty](https://github.com/lumpy-turnips/minty) is an awesome visualizer for your Node program's
flow.

![minty example](https://raw.githubusercontent.com/bahmutov/minty-example/master/minty-example.gif)

## Example for minty.file

```js
// index.js
'use strict'

function add(a, b) {
  a += 10
  return a + b
}

function sub(a, b) {
  return add(a, -b)
}
console.log(sub(2, 3))
```

Create a separate file `minty.js` that just loads `index.js`

```js
// minty.js
const minty = require('minty')
minty.file(require('path').join(__dirname, 'index.js'))
```

and install the tool itself `npm i -D minty`

Let's run!

```sh
$ node minty.js
9
```

## Example for minty.wrap
```js
const minty = require('minty')

function test(a) {
  return a;
}
```

This function can now be wrapped via

```js
const newTest = minty.wrap(test);
```

Each time this new function is called, an output from minty will be generated. This function can be called in the same way the original function would be.

```js
newTest(1)
//returns 1 and generates a visualization of the function process
```
Multiple functions may be 'mintified' and ran at the same time.


Both methods create a file with the structure -  `minty/ <file || function> / <file name || function name><timestamp>html`.

## Roadmap

Check our our public [roadmap on Trello](https://trello.com/b/8sh1R13O)!

Find an issue? [let us know](https://github.com/lumpy-turnips/minty/issues/new).
