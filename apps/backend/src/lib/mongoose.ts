import { Provide, Init, Destroy, Scope, ScopeEnum } from '@midwayjs/core';
import mongoose from 'mongoose';
import { Config } from '@midwayjs/core';

@Provide()
@Scope(ScopeEnum.Singleton)
export class MongooseConnection {
    @Config('mongoose')
    mongooseConfig: { uri: string };

    @Init()
    async init() {
        try {
            console.log('[Mongoose] Connecting to:', this.mongooseConfig.uri);
            await mongoose.connect(this.mongooseConfig.uri);
            console.log('[Mongoose] Connected successfully');

            // Handle connection events
            mongoose.connection.on('error', (err) => {
                console.error('[Mongoose] Connection error:', err);
            });

            mongoose.connection.on('disconnected', () => {
                console.warn('[Mongoose] Disconnected');
            });
        } catch (error) {
            console.error('[Mongoose] Connection failed:', error);
            throw error;
        }
    }

    @Destroy()
    async destroy() {
        await mongoose.disconnect();
        console.log('[Mongoose] Disconnected');
    }

    getConnection() {
        return mongoose.connection;
    }
}

export default mongoose;
