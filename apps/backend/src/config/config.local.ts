import { MidwayConfig } from '@midwayjs/core';

export default {
    mongoose: {
        uri: process.env.MONGO_URI,
    },
} as MidwayConfig;
