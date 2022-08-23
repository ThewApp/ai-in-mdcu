import got, { Options } from 'got';
import { DISCORD_BOT_TOKEN } from "./env"

const options = new Options({
    prefixUrl: 'https://discord.com/api/v10',
    headers: {
        Authorization: `Bot ${DISCORD_BOT_TOKEN}`,
    },
    throwHttpErrors: false,
});

export default got.extend(options);
