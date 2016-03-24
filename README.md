# minty.js

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

## Current Status

Minty.js is __alpha__ code. Install and use at your own risk. May not work!
Even worse, may not be useful!

Minty.js is under active development, and we're iterating at a high rate.
Please do [open an issue](https://github.com/lumpy-turnips/minty/issues/new)
and let us know if you've found a significant bug.

## How-To

1. `npm install -g minty` or `npm install --save-dev minty` (don't use minty in production!)
1. `const minty = require ('minty');` in the file you'd like to analyze
1. You can execute an entire file by typing `minty.file(//path to file)`. Note, the file path must be absolute, e.g. `minty.file(path.join(__dirname, ../lib/test.js))`
1. You can also 'mintify' a function by typing `var newFunc = mint.wrap(initialFunc)`, and then execute it by calling `newFunc()`
1. Run your code as usual (e.g. `node minty.js`) to generate the minty output. A new minty folder will appear in your root directory
1. Open the minty.html file in your browser in either the 'file' or 'function' folder (depending on whether you executed a file, function, or both). Note: data is stored in the mintyVis.js
1. Click forward and back to step through your variables' state as your app executes!

## Roadmap

* Show execution path through multiple files, for instance for middleware
* Good UX
* Display nested variables
* Track variable state under more edge cases
* Output packaged in one file that you can share with your co-workers
* Better UX
* Your feature here &mdash; [let us know](https://github.com/lumpy-turnips/minty/issues/new)!
