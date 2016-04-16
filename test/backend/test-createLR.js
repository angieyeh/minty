/* eslint no-unused-vars: 0 */

'use strict';
const createLR = require('./../../lib/createLineRules.js');
const createLRInput = require('./../fixtures/createLR-input.js');
const createLROutput = require('./../fixtures/createLR-output.js');
const createLRFixture = require('./../fixtures/createLR-input.js');
const lineActivityFixture = require('./../fixtures/lineActivityObj.js');
const test = require('tape');
const sinon = require('sinon');

test('ruler', (t) => {
  let addScopeName = sinon.spy(createLR, 'addScopeName');
  let addVariables = sinon.spy(createLR, 'addVariables');
  let addLines = sinon.spy(createLR, 'addLines');
  var lineActivityObj = createLR.ruler(createLRInput.parsed);
  t.plan(5);
  t.equal(typeof createLR.ruler, 'function');
  t.deepEqual(lineActivityObj, lineActivityFixture);
  t.equal(addLines.callCount, 16);
  t.equal(addVariables.callCount, 5)
  t.equal(addScopeName.callCount, 4);
});

test('addLines', (t) => {
  t.plan(2);
  let lineActivity = {};
  createLR.addLines('FunctionDeclaration', 'SCOPE', createLRInput.parseFunctionDec, lineActivity);
  t.deepEqual(lineActivity, createLROutput.addLines);
  t.equal(typeof createLR.addLines, 'function');

});

test('addVariables', (t) => {
  t.plan(1);
  t.equal(typeof createLR.addScopeName, 'function');
});

test('addScopeName', (t) => {
  t.plan(1);
  let lineActivity = {};
  // createLR.addScopeName(createLRInput.parseFunctionDec, lineActivity);
  // t.deepEqual(lineActivity);
  t.equal(typeof createLR.addVariables, 'function');
});
