import { verifyKey } from "discord-interactions";
import { DISCORD_PUBLIC_KEY, GOOGLE_CLIENT_ID } from "../src/env";

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

function response(data) {
  return {
    statusCode: 200,
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  };
}

function handle_message(event, body) {
  if (body.data.custom_id === "verify") {
    return response({
      type: 4,
      data: {
        content:
          "Choose your verification method.\nWe only keep your email address for verification purpose.",
        flags: 64,
        components: [
          {
            type: 1,
            components: [
              {
                type: 2,
                label: "Verify with Docchula",
                style: 5,
                url: `https://accounts.google.com/o/oauth2/v2/auth?client_id=${GOOGLE_CLIENT_ID}&redirect_uri=https://${event.headers.host}/api/verify-google&response_type=code&scope=openid%20email&state=${body.member.user.id}&hd=docchula.com`,
              },
            ],
          },
        ],
      },
    });
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
    return handle_message(event, body);
  }
};
