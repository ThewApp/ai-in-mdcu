import { createHmac, randomBytes } from "node:crypto";
import got from "got";
import {
  GOOGLE_CLIENT_ID,
  GOOGLE_CLIENT_SECRET,
  DISCORD_GUILD_ID,
  DISCORD_ROLE_ID_MDCU,
  DISCORD_BOT_TOKEN,
} from "../src/env";
import got_discord from "../src/got_discord";
import { response_html } from "../src/utils";

async function handle_callback(event, code, state) {
  const splittedState = state.split(";");

  // Double Submit Cookie to prevent oauth CSRF
  // cookie_token is randomly generated
  // state_token is an encrypted cookie_token
  try {
    const cookie_token = event.headers.cookie
      .split(";")
      .find((cookie) => cookie.startsWith("token=")).split("=")[1];
    const state_token = splittedState[1];
    const hmac = createHmac("sha256", DISCORD_BOT_TOKEN);
    const encrypted_token = hmac.update(cookie_token).digest("hex")
    if (encrypted_token !== state_token) {
      return {
        statusCode: 401,
        body: "Token doesn't match",
      };
    }
  } catch (e) {
    return {
      statusCode: 401,
      body: "Error while checking token",
    };
  }

  const userId = splittedState[0];

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

  const discordResponse = await got_discord.put(
    `guilds/${DISCORD_GUILD_ID}/members/${userId}/roles/${DISCORD_ROLE_ID_MDCU}`,
    {
      headers: {
        "X-Audit-Log-Reason": `Verified Google ${jwtPayload["email"]}`,
      },
    }
  );

  if (!discordResponse.ok) {
    return {
      statusCode: discordResponse.statusCode,
      body: "Error discord api",
    };
  }

  return response_html(`<p>
      Successfully verified with Google account!<br />This window can be closed.
    </p>`, {
    headers: {
      "Set-Cookie": `token=; Secure; HttpOnly`,
    },
  })
}

async function handle_start(event, userId, interactionToken) {
  // Check interactionToken is an encrypted userId
  const hmac1 = createHmac("sha256", DISCORD_BOT_TOKEN);
  const encrypted_userId = hmac1.update(userId).digest("hex")
  if (encrypted_userId !== interactionToken) {
    return {
      statusCode: 401,
      body: "Token doesn't match",
    };
  }

  const discordResponse = await got_discord.get(`users/${userId}`, {
    responseType: "json",
  });

  if (!discordResponse.ok) {
    return {
      statusCode: discordResponse.statusCode,
      body: "Error discord user api",
    };
  }

  // Token to prevent oauth CSRF
  const token = randomBytes(64).toString("hex");
  const hmac2 = createHmac("sha256", DISCORD_BOT_TOKEN);
  const encrypted_token = hmac2.update(token).digest("hex")

  return response_html(`
    <a href="https://accounts.google.com/o/oauth2/v2/auth?client_id=${GOOGLE_CLIENT_ID}&redirect_uri=https://${event.headers.host}/api/verify-google&response_type=code&scope=openid%20email&state=${userId};${encrypted_token}&hd=docchula.com">
      Verify discord user <strong>"${discordResponse.body.username}\#${discordResponse.body.discriminator}"</strong> with Google account
    </a>`, {
    headers: {
      "Set-Cookie": `token=${token}; Secure; HttpOnly`,
    },
  })
}

export const handler = async (event, _context) => {
  const code = event.queryStringParameters.code;
  const state = event.queryStringParameters.state;
  if (code && state) {
    return handle_callback(event, code, state);
  }

  const user = event.queryStringParameters.user;
  const token = event.queryStringParameters.token;
  if (user && token) {
    return handle_start(event, user, token);
  }

  return {
    statusCode: 403,
  };
};
