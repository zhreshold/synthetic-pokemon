var THREE = require("three-js")();
var fs = require('fs');
var path = require('path');
var jsdom = require("jsdom")
const { JSDOM } = jsdom;
const dom = new JSDOM(`<!DOCTYPE html><p>Hello world</p>`);
console.log(dom.window.document.querySelector("p").textContent); // "Hello world"
global.document = dom.window.document;
global.XMLHttpRequest = require("xmlhttprequest").XMLHttpRequest;

var load = function (name) {
  var jfile;
  if (name == "pikachu") {
    jfile = "./pikachu/pikachu-pokemon-go.json"
  } else {
    throw "Unknown pokemon".concat(name);
  }
  loader = new THREE.ObjectLoader();
  jfile = path.resolve(__dirname, jfile);
  console.log(jfile);
  var json = JSON.parse(fs.readFileSync(jfile));
  var ret;
  loader.parse(json, function (obj) {
      ret = obj;
  });
  console.log("Loaded.")
  return ret;
}

module.exports.load = load;
