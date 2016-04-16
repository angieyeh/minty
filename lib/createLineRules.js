'use strict';

let lineRules = {
  ruler,
  addVariables,
  addLines,
  addScopeName,
};

/**
* building up the lineActivity object - keys are line numbers and values are objects- looks like { rulesFound: [ { action: 'START or END', rule: 'SCOPE', type: 'SwitchCase' } ] }
* @param {type of statement/expression/function declaration} type
* @param {a string like 'swap', 'void' - it avoids inserting monitoring code in objects, multi-line function call, 'scope'} rule
* @param {the parsed data we got from the abstract syntax tree for each of the type (ForStatement, FunctionDeclaration, ArrowFunctionExpression, SwitchCase, VariableDeclaration, etc) - an array of objects that has the start and end lines for each of the types. if its a var declaration will also have kind and variables as properties.
example:
[{ startLine: 3,
    endLine: 3,
    kind: 'var',
    variables: [ 'one', 'two', 'three' ] },
    { startLine: 4,
    endLine: 4,
    kind: 'var',
    variables: [ 'four', 'five' ] }]
 } cluster

* lineActivity is globally defined - thats why we can add properties to the lineActivity object that we defined in ruler
**/

// start line is group.startline - 1 because when we read the text, we are splitting the lines of text by \n and so now its an array
function addLines(type, rule, cluster, lineActivity) {
  let startLine;
  let endLine;
  cluster.forEach(group => {
    startLine = group.startLine - 1;
    endLine = group.endLine - 1;
    if (!lineActivity[startLine]) lineActivity[startLine] = {};
    if (!lineActivity[startLine].rulesFound) lineActivity[startLine].rulesFound = [];
    if (rule) {
      lineActivity[startLine].rulesFound.push({ action: 'START', rule, type });
    }
    if (!lineActivity[endLine]) lineActivity[endLine] = {};
    if (!lineActivity[endLine].rulesFound) lineActivity[endLine].rulesFound = [];
    if (rule) {
      lineActivity[endLine].rulesFound.push({ action: 'END', rule, type });
    }
  });
}

/**
* addVariables is adding more properties to the nested objects in the lineActivity objects
* checking if any element(the element is an object) in the cluster array are parameters for a function - if there are we are adding a key called parameters to line.variable
*if there are variables then we are adding a name and kind key called variables to the line.variables object
**/

function addVariables(cluster, lineActivity) {
  cluster.forEach(group => {
    const line = lineActivity[group.startLine - 1];
    if (!line.variables) line.variables = {};
    if (group.parameters) {
      line.variables.parameters = group.parameters;
    }
    if (group.variables) {
      line.variables.variables = {
        names: group.variables,
        kind: group.kind,
      };
    }
  });

}

/**
  @param {the parsed data we got from the abstract syntax tree for each of the type (ForStatement, FunctionDeclaration, ArrowFunctionExpression, SwitchCase, VariableDeclaration, etc) - an array of objects that has the start and end lines for each of the types. if its a var declaration will also have kind and variables as properties.
  example:
  [{ startLine: 3,
      endLine: 3,
      kind: 'var',
      variables: [ 'one', 'two', 'three' ] },
      { startLine: 4,
      endLine: 4,
      kind: 'var',
      variables: [ 'four', 'five' ] }]
   } cluster

**/

/* function declaration - this will have a name so the function name will be set to line.SCOPE
 function expression - var func = function() {} this function doesnt have a name, but we are getting the variable name and setting that as its scope name
*/
function addScopeName(cluster, lineActivity) {

  cluster.forEach(group => {
    const line = lineActivity[group.startLine - 1];
    if (group.name) {
      line.scope = group.name;
    } else if (group.parameters) {
      if (line.variables.variables) {
        line.scope = line.variables.variables.names.join('');
      } else {
        line.scope = 'anonymous function';
      }
    }
  });
}

//examples of call expression users.find, console.log, invoking function
function ruler(parsed) {
  let lineActivity = {};
  Object.keys(parsed).forEach(type => {
    switch (type) {
      case 'BreakStatement':
      case 'ReturnStatement':
      case 'YieldExpression':
        lineRules.addLines(type, 'SWAP', parsed[type], lineActivity);
        break;
      case 'FunctionDeclaration':
      case 'FunctionExpression':
      case 'ArrowFunctionExpression':
      case 'SwitchCase':
        lineRules.addLines(type, 'SCOPE', parsed[type], lineActivity);
        lineRules.addVariables(parsed[type], lineActivity);
        lineRules.addScopeName(parsed[type], lineActivity);
        break;
      case 'VariableDeclaration':
        lineRules.addLines(type, null, parsed[type], lineActivity);
        lineRules.addVariables(parsed[type], lineActivity);
        break;
      case 'CallExpression':
      case 'SwitchStatement':
        lineRules.addLines(type, 'VOID', parsed[type], lineActivity);
        break;
      default:
        lineRules.addLines(type, 'SCOPE', parsed[type], lineActivity);
        break;
    }
  });
  return lineActivity;
}

module.exports = lineRules;
