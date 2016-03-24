//1. are buttons appended
//2. is codemirror appended
//3. do tds start as undefined
//4. how to test if last button and first does what its supposed to
//5. need dummmy data
//6. test if file loads

const Browser = require('zombie');
const expect = require('expect');
console.log(__dirname.slice(0, -4) +'minty/file/minty.html')
describe('Minty Tests', () => {
  const browser = new Browser();

  before(done => {
    browser.visit('file://' + __dirname.slice(0, -4) + 'minty/file/minty.html', done);
  });

  it('has a button called first', () => {
    browser.assert.element('button#first');
  });

  it('has a button called last', () => {
    browser.assert.element('button#last');
  });

  it('has a button called forward', () => {
    browser.assert.element('button#forward');
  });

  it('has a button called back', () => {
    browser.assert.element('button#back');
  });

  it('has ace editor', () => {
    browser.assert.element('div.ace_editor');
  });

  it('has text in the ace editor', () => {
    var text = browser.queryAll('.ace_line');
  });

});
