const fs = require('fs');
const _ = require('lodash');
const decomment = require('decomment');
const path = require('path');
const appRoot = require('app-root-path');

'use strict';

const minty = {};

// reads file into string
minty.read = function read(file, callback) {
  fs.readFile(file, 'utf8', (err, results) => {
    'use strict';
    let found = true;
    if (!results) {
      console.log("MINTY: Could not find specified file. Please use the absolute file path.");
      found = false;
    }
    if (found) return callback(null, results, file);
    return results;
  });
};

// split file lines into array and removes blank lines and any comments
minty.splitFile = function splitFile(text, file, callback) {

  console.log('text in', text);
  text = decomment(text, {
    space: true
  });
  const EOL = decomment.getEOL(text);
  text = text.split(EOL);
  console.log('text post', text);
  console.log('is there text0?', text[0]);
  if (!file) {
    if (text[0]) {
      file = text[0].match(/(?=function)(.*)(?=\()/gm, '');
      if (file) {
        file = file
          .join('')
          .replace(/function/gm, '')
          .trim();
      }
    }
    if (!file) file = 'anonymous';
  }
  console.log('file post', file);
  if (callback) {
    console.log('calling back');
    console.log(JSON.stringify(callback(null, text, file)));
    return callback(null, text, file);
  } else {
    console.log('injecting code');
    console.log(JSON.stringify(minty.injectCheckCode(text, file)));
    return minty.injectCheckCode(text, file);
  }
};


// Refactor meeeee! I'm in misery. Somebody relieve my pain....
minty.multiLineVarsCheck = function(arrayOfResults) {
  "use strict";
  // If we're looking at a variable declaration
  let openers = [];
  let startOpeners;
  let endOpeners;
  let bracketLinesToConcat = 0;
  let thisLine;
  let thisLineOpeners;
  let thisLineClosers;
  let concatStart;
  let stringMatch;
  let regexMatch;
  let varMatch = false;
  let startingVarMatch;
  let closingAVar = false;
  let concatLeadMatch = false;
  let concatTrailMatch = false;
  let startConcatLeadMatch;
  let startConcatTailMatch;
  let concatMatchingLead = false;
  let concatMatchingTrail = false;
  let concatLinesToConcat = 0;
  let funcMatch;
  let matchingVar = false;
  let startBacktick;
  let backtickMatch;
  let matchingBacktick = false;
  let backtickLinesToConcat = 0;

  arrayOfResults.forEach(function(element, index, array) {

    // Make a dupe of this line to do destructive operations on
    thisLine = JSON.parse(JSON.stringify(element)); // makes a copy no matter what the content i
    startOpeners = openers.length;
    startBacktick = matchingBacktick;

    // Speaking of destructive matches, remove any strings or regexes
    // Because these can contain brackets that we don't care to match
    thisLine = thisLine.replace(/".*"/g, '');
    thisLine = thisLine.replace(/'.*'/g, '');
    thisLine = thisLine.replace(/\/.*\//, '');

    startingVarMatch = varMatch;
    if (thisLine.indexOf('for') === -1) {
      varMatch = thisLine.match(/var|const|let/g);
    }
    if (varMatch) closingAVar = true;
    funcMatch = thisLine.match(/\bfunction\b\s*\(|[^"'`].*?=>.*?(?!"'`)/g);
    backtickMatch = thisLine.match(/`/g);
    concatLeadMatch = thisLine.match(/^\s*\+/g);
    concatTrailMatch = thisLine.match(/\s*\+\s*$/g);
    if (startingVarMatch && concatLeadMatch) {
      concatLinesToConcat++;
      concatMatchingLead = true;
    }
    if (varMatch && concatTrailMatch) {
      concatLinesToConcat++;
      concatMatchingTrail = true;
    }
    if ((backtickMatch) && (backtickMatch.length % 2 !== 0)) {
      matchingBacktick = !matchingBacktick;
    }
    if (startBacktick && matchingBacktick) backtickLinesToConcat++;


    // console.log(index, element, 'closingVar', closingAVar, 'matchingBacktick', matchingBacktick);

    if (!funcMatch && closingAVar && !matchingBacktick) {

      // Normally we've eliminated all possible things that could screw up bracket counting
      //  However, bracket-quoted strings still can
      //    So we're going to only count brackets if we're not in a bracket-quoted string

      // Get the array of opening and closing parens
      thisLineOpeners = thisLine.match(/\{|\[/g);
      if (thisLineOpeners) thisLineOpeners.reverse();
      thisLineClosers = thisLine.match(/\}|\]/g);

      // See if we've closed all our open parens
      if (thisLineClosers) {
        thisLineClosers.forEach(function(thisLine) {
          if (thisLine === ']') {
            if (thisLineOpeners && (thisLineOpeners[0] === '[')) {
              thisLineOpeners.shift();
              thisLineClosers.shift();
            }
          } else if (thisLine === '}') {
            if (thisLineOpeners && (thisLineOpeners[0] === '{')) {
              thisLineOpeners.shift();
              thisLineClosers.shift();
            }
          } else {
            console.log('unbalanced parens!');
          }
        });

        // If there are still closers left, take them off the openers
        if (thisLineClosers.length > 0) {
          thisLineClosers.forEach(function(thisLine) {
            if (thisLine === ']') {
              if (openers && (openers[0] === '[')) {
                openers.shift();
                thisLineClosers.shift();
              }
            } else if (thisLine === '}') {
              if (openers && (openers[0] === '{')) {
                openers.shift();
                thisLineClosers.shift();
              }
            } else {
              console.log('you did not balance your parens.');
            }
          });
        }
      }

      if (thisLineOpeners) {
        // console.log('concatting', thisLineOpeners.concat(openers));
        openers = thisLineOpeners.concat(openers);
      }

      if (openers.length > 0) {
        bracketLinesToConcat++;
      } else if ((openers.length === 0) && (startOpeners > 0)) {
        // concat the lines

        concatStart = index - bracketLinesToConcat; // -1 because we count the current line
        // console.log('start concat from line', concatStart, 'stopping at', index + 2);
        for (let i = concatStart + 1; i < index + 2; i++) {
          // console.log('concatting to', concatStart, i);
          arrayOfResults[concatStart] += arrayOfResults[i];
          // console.log(concatStart, 'is now', arrayOfResults[concatStart]);
          arrayOfResults[i] = '\n'; //TODO: make this the same as the EOL in the file
        }

        bracketLinesToConcat = 0;
        closingAVar = false;
      } else if (openers.length === 0) {
        closingAVar = false;
      }
    }

    // If you're reading this, I'm sorry. TODO: make this lovely
    if (startBacktick && !matchingBacktick) {
      // If we started with an open backtick and now have no open backtick
      //  Let's close it up

      concatStart = index - backtickLinesToConcat - 1; // We count backtick lines different than bracket lines. Boo!

      for (let i = concatStart + 1; i < index + 1; i++) {
        // console.log('concatting to', concatStart, i);
        arrayOfResults[concatStart] += arrayOfResults[i];
        // console.log(concatStart, 'is now', arrayOfResults[concatStart]);
        arrayOfResults[i] = '\n'; //TODO: make this the same as the EOL in the file
      }

      backtickLinesToConcat = 0;
    }

    // Concat multiline strings without backticks
    if (concatLinesToConcat && concatMatchingLead && !concatLeadMatch) {
      // There are lines to concat
      // we're matching with the + at the beginnging of the line
      // there's no + at the beginning of the line
      // We need to concat the previous line to the ones before it
      //  but NOT this one
      concatStart = index - backtickLinesToConcat;
      for (let i = concatStart + 1; i < index; i++) {
        // console.log('concatting to', concatStart, i);
        arrayOfResults[concatStart] += arrayOfResults[i];
        // console.log(concatStart, 'is now', arrayOfResults[concatStart]);
        arrayOfResults[i] = '\n'; //TODO: make this the same as the EOL in the file
      }

      concatLinesToConcat = 0;
    } else if (concatLinesToConcat && concatMatchingTrail && !concatTrailMatch) {
      // There are lines to Concat
      // We're matching with the + at the end of the line
      // there's no + at the end of the line
      // We need to concat this line to the ones before it
      concatStart = index - backtickLinesToConcat - 1;
      for (let i = concatStart + 1; i < index + 1; i++) {
        // console.log('concatting to', concatStart, i);
        arrayOfResults[concatStart] += arrayOfResults[i];
        // console.log(concatStart, 'is now', arrayOfResults[concatStart]);
        arrayOfResults[i] = '\n'; //TODO: make this the same as the EOL in the file
      }
      concatLinesToConcat = 0;
    }
  });
  return arrayOfResults;
};

//adds variable check function inbetween each line
minty.injectCheckCode = function injectCheckCode(results, file, callback) {
  "use strict";
  //keep track of variables as they are declared
  let variables = [];
  let activeParams = [];
  let bracketMonitor = [];
  let lineNumber = 0;
  //final code with injection will happen in this line of code;
  const injectedCodeLines = [];
  results.forEach(line => {
    if (minty.functionAndLoopCheck(line)) {
      if (line.indexOf('for') === -1 && line.indexOf('while') === -1) {
        let foundVariables = minty.findVariables(line);
        if (foundVariables) variables.push(foundVariables);
      }
      //set active params
      activeParams.push(minty.findParams(line));
      //add new bracketMonitor array (one for each function currently 'running')
      bracketMonitor.push(0);
      //monitor brackets
      minty.bracketWatch(line, bracketMonitor, lineNumber);
      //create line
      minty.createLine(file, injectedCodeLines, _.flattenDeep(variables.concat(activeParams)).slice(0), line, lineNumber);
      lineNumber++;
    } else if (line !== '') {
      if (line.trim() === '}' || line.trim() === '};' || line.trim() === '})' || line.trim() === '});') {
        if (bracketMonitor.length) {
          minty.bracketWatch(line, bracketMonitor, lineNumber);
          activeParams.length = bracketMonitor.length;
        }
        injectedCodeLines.push(`${line}\n`);
        lineNumber++;
      } else {
        //check for variable names on each line
        // if(functionAndLoopCheck) variables.push(arguments)
        let foundVariables = minty.findVariables(line);
        if (foundVariables) {
          if (bracketMonitor.length) {
            activeParams[activeParams.length - 1].push(foundVariables);
          } else {
            variables.push(foundVariables);
          }
        }
        if (bracketMonitor.length) {
          minty.bracketWatch(line, bracketMonitor, lineNumber);
          activeParams.length = bracketMonitor.length;
        }
        //create new line
        console.log(variables, activeParams, line + '\n\n\n\n')
        minty.createLine(file, injectedCodeLines, _.flattenDeep(variables.concat(activeParams)).slice(0), line, lineNumber);
        lineNumber++;
      }

    } else {
      injectedCodeLines.push('\n');
      lineNumber++;
    }
  });
  minty.functionLineSwap(injectedCodeLines);
  minty.returnLineSwap(injectedCodeLines);
  if (callback) {
    callback(null, injectedCodeLines.join(''), file);
  } else {
    return minty.wrapped(injectedCodeLines.join(''), file);
  }
};


//swap check line for when function is called
minty.functionLineSwap = function functionLineSwap(injectedCodeLines) {
  'use strict'
  const functionLog = {};
  let blacklist = {};
  for (var i = 0; i < injectedCodeLines.length; i++) {
    if (injectedCodeLines[i].indexOf('minty.variableLog') === -1) {
      if (injectedCodeLines[i].indexOf('function') !== -1) {
        var functionName = injectedCodeLines[i].match(/(?=function)(.*)(?=\()/gm)
          .join('')
          .replace(/function/gm, '')
          .trim();
        if (functionName === '') {
          functionName = injectedCodeLines[i].match(/(?=(const|var|let))(.*)(?=\=)/gm)
            .join('')
            .replace(/(const|var|let)/gm, '')
            .trim();
        }
        if (functionName) {
          var paramNums = minty.findParams(injectedCodeLines[i]).length;
          functionLog[functionName] = paramNums;
          blacklist[i] = 1;
        }
      }
    }
  }
  for (var j = 0; j < injectedCodeLines.length; j++) {
    if(!blacklist[j] && injectedCodeLines[j].indexOf('minty.variableLog') === -1) {
      var commas = injectedCodeLines[j].match(/,+/gm);
      if (commas) {
        commas = commas.join('').length;
      }
      var parens = injectedCodeLines[j].match(/\(+|\)+/gm);
      if (parens) {
        parens = parens.join('').length;
      }
      if (parens === 2) {
        for (var keys in functionLog) {
          if (injectedCodeLines[j].indexOf(keys) !== -1 && (functionLog[keys] === commas + 1 || functionLog[keys] === 0)) {
            var lineStore = injectedCodeLines[j];
            injectedCodeLines[j] = injectedCodeLines[j + 1];
            injectedCodeLines[j + 1] = lineStore;
            j++;
          }
        }
      }
    }
  }
  return injectedCodeLines;
};



minty.returnLineSwap = function returnLineSwap(injectedCodeLines) {
  'use strict';
  for (var i = 0; i < injectedCodeLines.length; i++) {
    if (injectedCodeLines[i].indexOf('minty.variableLog') === -1) {
      if (injectedCodeLines[i].indexOf('return') !== -1) {
        let returnStatement = injectedCodeLines[i].trim().match(/[^return](.*)/g)
          .join('')
          .replace(/\;/gm, '')
          .trim();
        if (!returnStatement) returnStatement = undefined;
        let mintyLine = injectedCodeLines[i + 1].split(',');
        let beginLine = mintyLine.slice(0, 3);
        let endLine = mintyLine.slice(3);
        for (var j in endLine) {
          if (endLine[j].indexOf(']') !== -1) {
            endLine[j] = endLine[j].replace(/\]/gm, '');
            endLine.splice(parseInt(j) + 1, 0, '"return"]');
            break;
          }
        }
        endLine[endLine.length - 1] =
          endLine[endLine.length - 1]
          .replace(/(?=\))(.*)/gm, '')
          .replace(/\r?\n|\r/g, '');
        endLine.push(` ${returnStatement});\n`);
        mintyLine = beginLine.concat(endLine).join();
        let tempLine = injectedCodeLines[i];
        injectedCodeLines[i] = mintyLine;
        injectedCodeLines[i + 1] = tempLine;
        i++;
      }
    }
  }
};



//while function or iterative loop is still 'open', bracketWatch will monitor the brackets and remove any params/variables delcared in the loop after closing
minty.bracketWatch = function bracketWatch(line, bracketMonitor, lineNumber) {
  "use strict";
  let bracketsOpen = line.replace(/[^\{]/g, '')
    .split('');
  let bracketsClose = line.replace(/[^\}]/g, '')
    .split('');
  if (bracketsOpen.length) {
    bracketMonitor[bracketMonitor.length - 1] += bracketsOpen.length;
  }
  if (bracketsClose.length) {
    bracketMonitor[bracketMonitor.length - 1] -= bracketsClose.length;
  }
  while (bracketMonitor[bracketMonitor.length - 1] <= 0 && bracketMonitor.length) {
    let subNum = bracketMonitor[bracketMonitor.length - 1];
    bracketMonitor.splice(bracketMonitor.length - 1, 1);
    if (bracketMonitor.length) bracketMonitor[bracketMonitor.length - 1] += subNum;
  }
};

//check for 'function', '=>', 'for', or 'while'
minty.functionAndLoopCheck = function functionAndLoopCheck(line) {
  return line.indexOf('function') !== -1 || line.indexOf('=>') !== -1 || line.indexOf('for') !== -1 || line.indexOf('while') !== -1;
};

//finds any parameters declared by a function
minty.findParams = function findParams(line) {
  "use strict";
  let params;
  if (line.indexOf('function') !== -1) {
    params = line.slice(line.indexOf('(') + 1, line.indexOf(')')).match(/([^\s,]+)/g);
  } else if (line.indexOf('=>') !== -1) {
    params = line.match(/(?=\()(.*)(?=\=>)/g)
      .join()
      .replace(/\(+/g, '')
      .replace(/\)+/g, '')
      .replace(/\s+/g, '')
      .split(',');
  } else if (line.indexOf('for') !== -1 || line.indexOf('while') !== -1) {
    params = minty.findVariables(line);
  }
  return params || [];
};


//finds all variables on each line. Lots of regex, a lot of room for cleanup here
minty.findVariables = function findVariables(line) {
  "use strict";
  let foundVariables = line.match(/(?=(var|const|let))(.*)/g);
  //remove var/const/let and white space from variable name
  if (foundVariables) {
    foundVariables = foundVariables.join('')
      .replace(/(const|var|let)+/gm, '')
      .replace(/\;/gm, '')
      .replace(/(?=\=)(.*)(?=\,)/gm, '')
      .replace(/(?=\=)(.*)/gm, '')
      .replace(/\s+/gm, '')
      .replace(/(?=\,)(.*)(?=\})/gm, '')
      .replace(/(?=\,)(.*)(?=\])/gm, '')
      .replace(/\]|\}/gm, '')
      .split(',');
    return foundVariables;
  }
};




//inject new code into original code depending on if any variables exist
minty.createLine = function createLine(file, injectedCodeLines, variables, line, lineNumber) {
  "use strict";
  let injectCode;
  if (variables.length) {
    injectCode = `minty.variableLog(${lineNumber}, file, log, ${JSON.stringify(variables)}, ${variables.join(", ")});\n`;
  } else if (line !== '') {
    injectCode = `minty.variableLog(${lineNumber}, file, log, [], '_mintyUndefined');\n`;
  } else {
    injectCode = '\n';

  }
  return injectedCodeLines.push(line + '\n', injectCode);
};



//finds the variable names and current value, places into output object, returnValueObject and is pushed into the final array
minty.variableLog = function variableLog(lineNumber, file, log, variables) {
  //grab all values from code
  const args = Array.prototype.slice.call(arguments, 4);
  var returnValueObject = {
    file: file,
    line: lineNumber,
    variables: {}
  };
  if (args[0] !== '_mintyUndefined') {
    for (var i in args) {
      //reference against variables array
      returnValueObject.variables[variables[i]] = args[i];
    }
  }
  //return object into results array
  return log.push(returnValueObject);
};

//find line at which an error occured
minty.errorLineFind = function errorLineFind(js, resultsArray) {
  'use strict';
  let finalLine = 0;
  if (resultsArray.length) {
    finalLine = resultsArray[resultsArray.length - 1].line;
  }
  let errLine;
  js.split('\n')
    .forEach(line => {
      if (line.indexOf('minty.variableLog') !== -1) {
        let currLine = parseInt(line.slice(18));
        if (currLine > finalLine && !errLine) errLine = currLine;
      }
    });
  return errLine;
};


//run the program, evals js after injecting monitor code, catches errors and outputs to an array
minty.run = function run(js, file) {
  'use strict';
  var log = [];
  console.log(js);
  try {
    eval(js);
  } catch (err) {
    let errLine = minty.errorLineFind(js, log);
    if (!log.length) log.push({
      file: file,
      line: errLine,
      variables: {}
    });
    log.push({
      file: file,
      line: errLine,
      variables: log[log.length - 1].variables,
      error: err.message
    });
  } finally {
    fs.mkdir(appRoot + '/minty', (err) => {
      fs.mkdir(appRoot + '/minty/file', (err) => {
        fs.readFile(file, (err, results) => {
          let output = {
            entry: file,
            log: log
          };
          output[file] = results.toString();
          fs.readFile(path.join(__dirname, '/mintyTemplates/mintyVisTemplate.js'), (err, templateResults) => {
            const logStr = JSON.stringify(output, (key, val) => {
              if (typeof val === 'function') {
                val = val.toString()
                  .split('\n');
                val.forEach((line, i) => {
                  if (line.indexOf('minty.variableLog') !== -1) {
                    val.splice(i, 1);
                  }
                });
                val = val.join('\n');
                return val;
              } else if (typeof val === 'undefined') {
                return 'undefined';
              }
              return val;
            });
            fs.writeFile(appRoot + '/minty/file/mintyVis.js', `var data = ${logStr} \n ${templateResults}`, (err) => {
              fs.createReadStream(appRoot + '/node_modules/minty/lib/mintyTemplates/index.html')
                .pipe(fs.createWriteStream(appRoot + '/minty/file/minty.html'));
            });
          });
        });
      });
    });
  }
};


minty.wrapped = function wrap(js, file, callback) {
  var minter = {};
  minter.variableLog = minty.variableLog;
  minter.findParams = minty.findParams;

  //find line at which an error occured
  minter.errorLineFind = minty.errorLineFind;

  //run the program, evals js after injecting monitor code, catches errors and outputs to an array
  minter.run = minty.run = function run(js, file) {
    'use strict';
    const args = arguments[2];
    js = js.replace(/minty+/gm, 'minter');
    var log = [];
    // console.log(js);
    try {
      const fn = eval(`(${js})`);
      fn.apply(null, args);
    } catch (err) {
      let errLine = minty.errorLineFind(js, log);
      if (!log.length) {
        log.push({
          file: file,
          line: errLine,
          variables: {}
        });
      } else {
        log.push({
          file: file,
          line: errLine,
          variables: log[log.length - 1].variables,
          error: err.message
        });
      }
    } finally {
      js = js.split('\n');
      js.forEach((line, i) => {
        if (line.indexOf('minter.variableLog') !== -1) {
          js.splice(i, 1);
        }
      });
      js = js.join('\n');
      fs.mkdir(appRoot + '/minty', (err) => {
        fs.mkdir(appRoot + '/minty/function', (err) => {
          let output = {
            entry: file,
            log: log
          };
          output[file] = js;
          fs.readFile(appRoot + '/node_modules/minty/lib/mintyTemplates/mintyVisTemplate.js', (err, templateResults) => {
            const logStr = JSON.stringify(output, (key, val) => {
              if (typeof val === 'function') {
                val = val.toString()
                  .split('\n');
                val.forEach((line, i) => {
                  if (line.indexOf('minty.variableLog') !== -1) {
                    val.splice(i, 1);
                  }
                });
                val = val.join('\n');
                return val;
              } else if (typeof val === 'undefined') {
                return 'undefined';
              }
              return val;
            });
            fs.writeFile(appRoot + '/minty/function/mintyVis.js', `var data = ${logStr} \n ${templateResults}`, (err) => {
              fs.createReadStream(appRoot + '/node_modules/minty/lib/mintyTemplates/index.html')
                .pipe(fs.createWriteStream(appRoot + '/minty/function/minty.html'));
            });
          });
        });
      });
    }
  };
  return function() {
    const args = Array.prototype.slice.call(arguments);
    minty.run.call(this, `${js}`, file, args);
  };
};

module.exports = minty;
