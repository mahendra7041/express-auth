import { NextFunction, Request, Response } from "express";
import crypto from "crypto";
import qs from "qs";

export function signedRouteVerify(
  req: Request,
  res: Response,
  next: NextFunction
) {
  const currentUrl = req.protocol + "://" + req.get("host") + req.originalUrl;
  const [path, queryParamsString] = currentUrl.split("?");
  const queryObject = <{ expires: string; [key: string]: string }>(
    qs.parse(queryParamsString)
  );
  const expires = queryObject.expires;
  const signature = queryObject.signature;

  if (!signature || !expires) {
    return res.redirect(`${queryObject.failedRedirect}?error=bad_request`);
  }

  delete queryObject["signature"];

  const params = qs.stringify(queryObject);

  let url = `${path}`;
  if (params) {
    url += `?${params}`;
  }

  const hmac = crypto.createHmac(
    "sha256",
    process.env.APP_KEY ? process.env.APP_KEY : "secret"
  );
  const newSignature = hmac.update(url).digest("hex");

  if (
    !crypto.timingSafeEqual(
      Buffer.from(signature, "hex"),
      Buffer.from(newSignature, "hex")
    )
  ) {
    return res.redirect(`${queryObject.failedRedirect}?error=bad_request`);
  }

  if (+expires < Date.now()) {
    return res.redirect(`${queryObject.failedRedirect}?error=link_expired`);
  }

  next();
}
