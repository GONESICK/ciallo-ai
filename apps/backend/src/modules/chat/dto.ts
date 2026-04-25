import mongoose from 'mongoose';
import { Schema, Model } from 'mongoose';

export interface MessageItem {
    sessionId: string;
    role: string;
    content: Record<string, unknown>[];
    status: 'streaming' | 'done' | 'error';
    id?: string;
    createdAt?: string;
    updatedAt?: string;
}

const chatDetailSchema = new Schema(
    {
        sessionId: { type: String, required: true },
        content: [Schema.Types.Mixed],
        role: { type: String, required: true },
        status: {
            type: String,
            enum: ['streaming', 'done', 'error'],
            default: 'done',
        },
    },
    {
        timestamps: true,
        toJSON: {
            virtuals: true,
            transform(_, ret: any) {
                ret.id = ret._id.toString();
                ret.createdAt = new Date(ret.createdAt).toLocaleString(
                    'zh-CN',
                    {
                        hour12: false,
                    }
                );

                delete ret._id;
                delete ret.__v;
            },
        },
    }
);

export const Detail: Model<MessageItem> =
    (mongoose.models.Detail as Model<MessageItem>) ||
    mongoose.model<MessageItem>('Detail', chatDetailSchema);
