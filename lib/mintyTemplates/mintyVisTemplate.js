
$(document).ready(() => {

  var indexCounter = -1,
      dataLength = data.log.length,
      watchedVariables,
      completeVariableList = {},
      declaredVariables,
      oldIndex,
      newIndex;

  data.log.forEach((elem) => {
    for (var variables in elem.variables) {
      completeVariableList[variables] = undefined;
    }
  });
  // appending variable names to the DOM - all their values start out as undefined

  for (var key in completeVariableList) {
    if (key !== 'return') {
      $('tbody').append(`<tr id=${key}></tr>`);
      $(`#${key}`)
        .append(`<td>${key}</td>`)
        .append(`<td id=${key +'val'} class="variables">undefined</td>`);
    }
  }

  declaredVariables = Object.keys(completeVariableList);


  disableBackFirstButtons(true);
  $('#step').text(`Step 0 of ${dataLength}`);
//
  $('#forward').click((e) => {
    var prevWatchedVariables;
    if (indexCounter < dataLength - 1) {
      oldIndex = indexCounter;
      indexCounter++;
      newIndex = indexCounter;
      moveLineIndicator(newIndex, oldIndex, data.log);

      disableBackFirstButtons(false);
      $('#step').text(`Step ${indexCounter+1} of ${dataLength}`);
    }

    //appending error to DOM
    if (indexCounter === dataLength - 1) {
      disableForwardLastButtons(true);
      if (data.log[indexCounter].error)
        $('#error-msg').text(`Error! - ${data.log[indexCounter].error}`).css('color', 'red');
    }



    //updating the variable values
    watchedVariables = data.log[indexCounter].variables;
    if (data.log[indexCounter]) {
      for (var key in watchedVariables) {
        if (key === 'return') appendReturnValue(watchedVariables.return);
        else updateVariables(key, watchedVariables);
      }
    }

    // console.log('before', data.log[indexCounter - 1].variables.return)


    // if user is analyzing a line of code and some of the variables are no longer on the watch list, those variables will get the value undefined


    if (indexCounter === 0) varsNoLongerOnWatchList(declaredVariables, watchedVariables, indexCounter);
    else {
      prevWatchedVariables = data.log[indexCounter - 1].variables;
      varsNoLongerOnWatchList(declaredVariables, watchedVariables, indexCounter, prevWatchedVariables);
      if (data.log[indexCounter - 1].variables.return)
        removeReturnValue();
    }
  });

  $('#back').click(() => {

    var watchedVariables,
        decVar,
        nextWatchedVariables;

    if (indexCounter > -1) {
      oldIndex = indexCounter;
      indexCounter--;
      newIndex = indexCounter;
      moveLineIndicator(newIndex, oldIndex, data.log);
      disableForwardLastButtons(false);
      $('#step').text(`Step ${indexCounter + 1} of ${dataLength}`);
    }

    //TODO: Should turn this whole if statement as a function
    if (data.log[indexCounter + 1].variables.return)
      removeReturnValue()
    //make all values revert back to undefined when the user clicks back all the way to the beginning with the back button


    if (indexCounter === -1) {
      makeValuesUndefined();
      return;
    }

    //when user clicks back, this will update the DOM with new values
    watchedVariables = data.log[indexCounter].variables;
    if (data.log[indexCounter]) {
      // console.log('indexCounter', indexCounter, 'old line:', data[oldIndex].line, 'new line:', data[newIndex].line, 'variables:', watchedVariables);
      for (var key in watchedVariables) {
        if (key === 'return') appendReturnValue(watchedVariables.return);
        else updateVariables(key, watchedVariables);
      }
    }
    // console.log(data.log[indexCounter + 1].variables.return)


    if (oldIndex === parseInt(dataLength - 1) && data.log[oldIndex].error)
      $('#error-msg').text('');

    // if user is analyzing a line of code and some of the variables are no longer on the watch list, those variables will get the value undefined

    if (indexCounter === dataLength - 1)
      varsNoLongerOnWatchList(declaredVariables, watchedVariables, indexCounter);
    else {
      nextWatchedVariables = data.log[indexCounter + 1].variables;
      varsNoLongerOnWatchList(declaredVariables, watchedVariables, indexCounter, nextWatchedVariables);

    }

  });

//make all values revert back to undefined when the user clicks first
  $('#first').click(() => {
    if (indexCounter === dataLength - 1)
      disableForwardLastButtons(false);

    oldIndex = indexCounter;
    indexCounter = -1;
    newIndex = indexCounter;
    moveLineIndicator(newIndex, oldIndex, data.log);
    makeValuesUndefined();
    $('#step').text(`Step ${indexCounter + 1} of ${dataLength}`);

    if (data.log[dataLength-1].error)
      $('#error-msg').text('');

    if (data.log[dataLength-1].variables.return)
      removeReturnValue();

  });

  //display variables and their values from the last index of the data set
  $('#last').click(() => {
    var variable,
        variableLastIndex,
        variableNamesLastIndex;
    if (indexCounter === -1)
      disableBackFirstButtons(false);

    oldIndex = indexCounter;
    indexCounter = dataLength - 1;
    newIndex = indexCounter;
    moveLineIndicator(newIndex, oldIndex, data.log);
    variablesLastIndex = data.log[indexCounter].variables;
    variableNamesLastIndex = Object.keys(variablesLastIndex);



    if (data.log[indexCounter].error)
      $('#error-msg').text(`Error! - ${data.log[indexCounter].error}`).css('color', 'red');

    if (variablesLastIndex.return)
      appendReturnValue();

    //initially this completeVariableList's variable values were all undefined
    //now im giving some of the var names its values from the last index of the log array
    variableNamesLastIndex.forEach((variable, i) => {
      completeVariableList[variable] = variablesLastIndex[variable];
    });

    $('.variables').each((i, elem) => {
      variable = completeVariableList[declaredVariables[i]];
      console.log(typeof variable, variable)
      if (variable) {
        if (variable.constructor === Array || variable.constructor === Object)
          variable = JSON.stringify(variable)
      }
      $(elem).text(`${variable}`);
    });
    disableForwardLastButtons(true);

    $('#step').text(`Step ${indexCounter + 1} of ${dataLength}`);
  });

});

//updates variables when user clicks forward or back button
//updates variables when user clicks forward or back button
function updateVariables(variable, watchedVariables) {
  $(`#${variable + 'val'}`).remove();
  if (watchedVariables[variable].constructor === Array || watchedVariables[variable].constructor === Object) {
    //i think i want to remove the children
    var stringifiedArrayOrObject = JSON.stringify(watchedVariables[variable])
    $(`#${variable}`).append(`<td id="${variable + 'val'}" class="variables">${stringifiedArrayOrObject}</td>`);
    // var handledArray = handleArrays(watchedVariables[variable], 0);
    // displayArray(handledArray, variable);
  } else
    $(`#${variable}`).append(`<td id="${variable + 'val'}" class="variables">${watchedVariables[variable]}</td>`);
}

function appendReturnValue(returnValue){
  $('#return').text('Return Value: ').append(`<span id="return-val">${returnValue}</span>`)
  $('#return-value').text(returnValue);
}

function removeReturnValue() {
  $('#return').text('');
  $('#return-value').remove();
}

function handleArrays(array, depth) {
  var flattenedArray = [];
  var flattenedObj = {};
  var howNested = [];
  function inner(array, depth) {
    var arr = [];
    array.forEach((elem) => {
      if (elem instanceof Array) arr.push("array");
      else arr.push(elem);
    });
    flattenedArray.push(depth, arr);
    if (!flattenedObj[depth]) flattenedObj[depth] = [];
    flattenedObj[depth].push(arr);

    howNested.push(depth);
    // i want to continue if the element is a number, string or variable, pretty anything not an array or object
    for (var i = 0, n = array.length; i < n; i ++) {
      if (typeof array[i] !== 'object') continue;
      if (array[i] === null) continue;
      if (array[i] instanceof Array) {
        depth ++;
        inner(array[i], depth);
      }
      depth --;
    }
  }
  inner(array, depth);
  return flattenedObj;
}

[1, [5, [7, 0], [3, [4, [], 79]]], [4, 7, [5, 9, [12, 14, []]]]]
function displayArray(nestedArrays, variable) {
  // console.log(variable, nestedArrays);
  $(`.array-table-${variable}`).remove();

  $('#main-array-table').append(
    $('<table/>', {'id': `array-table-${variable}`})
  );

  var levelsInArray = Object.keys(nestedArrays),
      index = 0;
  levelsInArray.forEach((level) => {
    nestedArrays[level].forEach((array, i) => {
      $(`#array-table-${variable}`).append(`<table class="array-table-lvl-${level + i} array-tables${level} variable-${variable}"><table/>`);
      if (array.length === 0) $(`.array-table-lvl-${level + i}.variable-${variable}`).append('<td>Empty Array</td>');

      array.forEach((elem, j) => {
        var levelOfChildrenArray = JSON.stringify(parseInt(level) + 1) + index;
        if (elem === 'array') {
          $(`.array-table-lvl-${level + i}.variable-${variable}`).append(`<td class=${levelOfChildrenArray}>${elem}</td>`)
          index++;
        }
        else $(`.array-table-lvl-${level + i}.variable-${variable}`).append(`<td>${elem}</td>`);
      });
    });
    index = 0;
  });

  styleArrayTable();
}

// function styleArrayTable(){
//   var level = 0,
//       levelHeight = 100,
//       height;
//   while ($(`.array-tables${level}`).length > 0) {
//     $(`.array-tables${level}`).each((i, elem) => {
//
//
//     });
//     level ++;
//   }
//
//
// }

function disableForwardLastButtons(value) {
  $('#forward').prop('disabled', value);
  $('#last').prop('disabled', value);
}

function disableBackFirstButtons(value) {
  $('#back').prop('disabled', value);
  $('#first').prop('disabled', value);
}

function makeValuesUndefined() {
  $('.variables').each((i, elem) => {
    if ($(elem).text() !== 'undefined')
      $(elem).text('undefined');
  });
  disableBackFirstButtons(true);
}

function varsNoLongerOnWatchList(declaredVariables, watchedVariables, index, prevOrNextWatchedVariables) {
  Object.keys(watchedVariables)
  for (var i = 0, n = declaredVariables.length; i < n; i ++) {
    declaredVar = declaredVariables[i];
    if (watchedVariables[declaredVar] === 0) return;
    if (!watchedVariables[declaredVar] && declaredVar !== 'return') {
        $(`#${declaredVar + 'val'}`).remove();
        $(`#${declaredVar}`).append(`<td id="${declaredVar + 'val'}" class="variables">undefined</td>`);
    }
  }
}
