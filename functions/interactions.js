import { verifyKey } from "discord-interactions";
import { DISCORD_PUBLIC_KEY } from "../src/env";
import { response } from "../src/utils";
import handleVerify from "../src/interactions/verify";

function verify(event) {
  const signature = event.headers["x-signature-ed25519"];
  const timestamp = event.headers["x-signature-timestamp"];
  const isValidRequest = verifyKey(
    event.body,
    signature,
    timestamp,
    DISCORD_PUBLIC_KEY
  );
  return isValidRequest;
}

function handleMessage(event, body) {
  if (body.data.custom_id === "verify") {
    return handleVerify(event, body);
  }
}

export const handler = async (event, _context) => {
  const isValidRequest = verify(event);
  if (!isValidRequest) {
    return {
      statusCode: 401,
      body: "Bad request signature",
    };
  }
  const body = JSON.parse(event.body);
  if (body.type === 1) {
    return response({ type: 1 });
  }
  if (body.type === 3) {
    return handleMessage(event, body);
  }
};
