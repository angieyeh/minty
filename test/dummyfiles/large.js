"use strict";

var one, two = 2, three = 1;
var four = 2, five;
var seven = {a: 1, b: 2};
var six = [1,2,3,4];

 //what should we do if var test = 'shoot'

for(let i = 0; i < 10; i++) {
  console.log(i)
}

for(var j = 0; j < 5; j++) {
  j += j;
}

function fn(a, b, c) {
  console.log(a,b,c);
  function fn2(d,e,f) {
    console.log('what!');
    var bus = 'slow';
  }
  fn2(4,5,6);
  var car = 'toyota';
}


fn(1,2,3);


[1,2,3].forEach(val => {
  console.log(val);
});

[1,2,3].forEach((val, i) => {
  console.log(val);
});

var checkThis = function() {
  console.log('hello there my friend');
};


var k = 10;

while(k !== 3) {
  console.log(k);
  k--;
}

checkThis();


function stuff(whats, that) {
  return whats + that;
}


stuff(1, 2);

/*
* here is another comment
* with some stuff
* shoot */
let what = 'what';

console.log(that)
var test = "hello";
test += " buddy";

const hello = 'hi';
