import { MidwayConfig } from '@midwayjs/core';
import joi from '@midwayjs/validation-joi';

export default {
    // use for cookie sign key, should change to your own and keep security
    keys: '1776327059083_3394',
    dsKey: process.env.VOLC_API_KEY || '',
    mongoose: {
        uri: process.env.MONGO_URI,
    },
    koa: {
        port: 7001,
        versioning: {
            enable: true,
            prefix: 'v',
        },
    },
    cors: {
        origin: '*',
        credentials: true,
        allowMethods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
        allowHeaders: ['Content-Type', 'Authorization', 'Accept'],
    },
    validation: {
        validators: {
            joi,
        },
    },
} as MidwayConfig;
