import {
  Request,
  createRequestHandler as createNodeRequestHandler,
  installGlobals,
} from "@remix-run/node";
import { stringify } from "querystring";

installGlobals();

function createRemixRequest(req) {
  console.log({ req });
  const host = req.headers["x-forwarded-host"] || req.headers.host;
  const proto = req.headers["x-forwarded-proto"] || "http";
  const query = stringify(req.multiValueQueryStringParameters);
  const url = new URL(
    `${req.path}${query ? "?" : ""}${query}`,
    `${proto}://${host}`
  );
  let body;
  if (req.body && req.httpMethod !== "get" && req.httpMethod !== "head") {
    body = req.isBase64Encoded
      ? Buffer.from(req.body, "base64").toString()
      : req.body;
  }

  if (req.cookies) {
    req.headers.cookie = req.cookies.join(";");
  }

  return new Request(url.toString(), {
    method: req.httpMethod,
    headers: req.headers,
    body,
  });
}

export function createRequestHandler({ build, mode = process.env.NODE_ENV }) {
  const handleRequest = createNodeRequestHandler(build, mode);
  return async (req) => {
    const response = await handleRequest(createRemixRequest(req));
    return {
      statusCode: response.status,
      headers: Object.fromEntries(response.headers),
      body: await response.text(),
    };
  };
}
