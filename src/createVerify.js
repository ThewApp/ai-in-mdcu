import got from "got";
import { DISCORD_BOT_TOKEN, DISCORD_CHANNEL_ID_VERIFY } from "./env";

export default async function createVerify() {
  const messages = await got
    .get(
      `https://discord.com/api/v10/channels/${DISCORD_CHANNEL_ID_VERIFY}/messages`,
      {
        headers: {
          Authorization: `Bot ${DISCORD_BOT_TOKEN}`,
        },
      }
    )
    .json();

  const messagesId = messages.map((message) => message.id);

  if (messagesId.length === 1) {
    await got
      .delete(
        `https://discord.com/api/v10/channels/${DISCORD_CHANNEL_ID_VERIFY}/messages/${messagesId[0]}`,
        {
          headers: {
            Authorization: `Bot ${DISCORD_BOT_TOKEN}`,
          },
        }
      )
      .catch((err) => console.log(err.response.body));
  } else if (messagesId.length > 1) {
    await got
      .post(
        `https://discord.com/api/v10/channels/${DISCORD_CHANNEL_ID_VERIFY}/messages/bulk-delete`,
        {
          headers: {
            Authorization: `Bot ${DISCORD_BOT_TOKEN}`,
          },
          json: {
            messages: messagesId,
          },
        }
      )
      .catch((err) => console.log(err.response.body));
  }

  await got
    .post(
      `https://discord.com/api/v10/channels/${DISCORD_CHANNEL_ID_VERIFY}/messages`,
      {
        json: {
          content: "Verify your identity to see member-only channels.",
          components: [
            {
              type: 1,
              components: [
                {
                  type: 2,
                  label: "Start verification process",
                  style: 1,
                  custom_id: "verify",
                },
              ],
            },
          ],
        },
        headers: {
          Authorization: `Bot ${DISCORD_BOT_TOKEN}`,
        },
      }
    )
    .catch((err) => console.log(err.response.body));
}
