import { createHmac } from "node:crypto";
import { response } from "../utils";
import { DISCORD_BOT_TOKEN } from "../env";

export default function handleVerify(event, body) {
  const userId = body.member.user.id
  const hmac = createHmac("sha256", DISCORD_BOT_TOKEN);
  const token = hmac.update(userId).digest("hex");

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
              url: `https://${event.headers.host}/api/verify-google?user=${userId}&token=${token}`,
            },
          ],
        },
      ],
    },
  });
}
