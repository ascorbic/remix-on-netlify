// const { createRequestHandler } = require("@remix-run/architect");
var node = require("@remix-run/node");

node.installGlobals();

const { createRequestHandler } = require("./handler");

exports.handler = createRequestHandler({
  build: require("./build"),
});
