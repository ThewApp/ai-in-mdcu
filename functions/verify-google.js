import got from "got";
import {
  GOOGLE_CLIENT_ID,
  GOOGLE_CLIENT_SECRET,
  DISCORD_GUILD_ID,
  DISCORD_ROLE_ID_MDCU,
  DISCORD_BOT_TOKEN,
} from "../src/env";
export const handler = async (event, _context) => {
  const code = event.queryStringParameters.code;
  const state = event.queryStringParameters.state;
  if (!code && !state) {
    return {
      statusCode: 403,
      body: "Error",
    };
  }
  const googleResponse = await got.post("https://oauth2.googleapis.com/token", {
    form: {
      code: code,
      client_id: GOOGLE_CLIENT_ID,
      client_secret: GOOGLE_CLIENT_SECRET,
      redirect_uri: `https://${event.headers.host}/api/verify-google`,
      grant_type: "authorization_code",
    },
    responseType: "json",
    throwHttpErrors: false,
  });

  if (!googleResponse.ok) {
    return {
      statusCode: googleResponse.statusCode,
      body: "Error verification with Google",
    };
  }

  const jwtPayload = JSON.parse(
    Buffer.from(googleResponse.body.id_token.split(".")[1], "base64")
  );

  const discordResponse = await got.put(
    `https://discord.com/api/v10/guilds/${DISCORD_GUILD_ID}/members/${state}/roles/${DISCORD_ROLE_ID_MDCU}`,
    {
      headers: {
        "X-Audit-Log-Reason": `Verified Google ${jwtPayload["email"]}`,
        Authorization: `Bot ${DISCORD_BOT_TOKEN}`,
      },
      throwHttpErrors: false,
    }
  );

  if (!discordResponse.ok) {
    return {
      statusCode: discordResponse.statusCode,
      body: "Error discord api",
    };
  }

  return {
    statusCode: 200,
    body: "Successfully verified with Docchula!\nThis window can be closed.",
  };
};
