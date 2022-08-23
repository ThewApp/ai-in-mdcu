import { DISCORD_CHANNEL_ID_VERIFY } from "../env";
import got_discord from "../got_discord";

export default async function createVerify() {
  const messages = await got_discord
    .get(`channels/${DISCORD_CHANNEL_ID_VERIFY}/messages`)
    .json();

  const messagesId = messages.map((message) => message.id);

  if (messagesId.length === 1) {
    await got_discord
      .delete(`channels/${DISCORD_CHANNEL_ID_VERIFY}/messages/${messagesId[0]}`);
  } else if (messagesId.length > 1) {
    await got_discord
      .post(`channels/${DISCORD_CHANNEL_ID_VERIFY}/messages/bulk-delete`, {
        json: {
          messages: messagesId,
        },
      });
  }

  await got_discord
    .post(`channels/${DISCORD_CHANNEL_ID_VERIFY}/messages`, {
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
    })
}
