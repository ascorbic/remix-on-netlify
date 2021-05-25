const {
  Request,
  createRequestHandler: createNodeRequestHandler,
} = require("@remix-run/node");
const { stringify } = require("querystring");
/**
 * A function that returns the value to use as `context` in route `loader` and
 * `action` functions.
 *
 * You can think of this as an escape hatch that allows you to pass
 * environment/platform-specific values through to your loader/action.
 */

/**
 * Returns a request handler for Architect that serves the response using
 * Remix.
 */
function createRequestHandler({
  build,
  getLoadContext,
  mode = process.env.NODE_ENV,
}) {
  let handleRequest = createNodeRequestHandler(build, mode);
  return async (req) => {
    let request = createRemixRequest(req);

    let loadContext =
      typeof getLoadContext === "function" ? getLoadContext(req) : undefined;
    let response = await handleRequest(request, loadContext);
    const body = await response.text();
    console.log({ response, body });
    return {
      statusCode: response.status,
      headers: Object.fromEntries(response.headers),
      body,
    };
  };
}

function createRemixRequest(req) {
  console.log({ req });
  let host = req.headers["x-forwarded-host"] || req.headers.host;

  let url = new URL(
    req.path + (stringify(req.queryStringParameters) || ""),
    `http://${host}`
  );
  console.log(url.toString());
  return new Request(url.toString(), {
    method: req.httpMethod,
    headers: req.cookies
      ? { ...req.headers, Cookie: req.cookies.join(";") }
      : req.headers,
    body:
      req.body && req.isBase64Encoded
        ? Buffer.from(req.body, "base64").toString()
        : req.body,
  });
}

exports.createRequestHandler = createRequestHandler;
