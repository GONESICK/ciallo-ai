import {
    Configuration,
    App,
    CommonJSFileDetector,
    Inject,
} from '@midwayjs/core';
import * as koa from '@midwayjs/koa';
import * as validation from '@midwayjs/validation';
import * as info from '@midwayjs/info';
import * as axios from '@midwayjs/axios';
import { join } from 'path';
// import { DefaultErrorFilter } from './filter/default.filter';
// import { NotFoundFilter } from './filter/notfound.filter';
import { ReportMiddleware } from './middleware/report.middleware';
import cors from '@koa/cors';
import * as dotenv from 'dotenv';
import { MongooseConnection } from './lib/mongoose';

const env = process.env.NODE_ENV;
dotenv.config({
    path: `.env.${env}`,
    override: true,
});

@Configuration({
    imports: [
        koa,
        validation,
        axios,
        {
            component: info,
            enabledEnvironment: ['local'],
        },
    ],
    importConfigs: [join(__dirname, './config')],
    detector: new CommonJSFileDetector(),
})
export class MainConfiguration {
    @App('koa')
    app: koa.Application;

    @Inject()
    mongooseConnection: MongooseConnection;

    async onReady() {
        // add cors middleware
        this.app.useMiddleware([
            cors({
                origin: '*',
                credentials: true,
                allowMethods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
                allowHeaders: ['Content-Type', 'Authorization', 'Accept'],
            }),
        ]);
        // add middleware
        this.app.useMiddleware([ReportMiddleware]);
        // add filter
        // this.app.useFilter([NotFoundFilter, DefaultErrorFilter]);
    }
}
