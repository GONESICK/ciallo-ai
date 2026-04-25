import mongoose from 'mongoose';
import { Schema, Model } from 'mongoose';

export interface MessageDoc {
    id: string;
    title?: string;
    isAutoTitle?: boolean;
    previous_response_id?: string;
    updatedAt?: string;
    createdAt?: string;
}

const MessageSchema = new Schema<MessageDoc>(
    {
        title: String,
        isAutoTitle: {
            type: Boolean,
            default: true,
        },
        previous_response_id: String,
    },
    {
        timestamps: true,
        toJSON: {
            virtuals: true,
            transform(_, ret) {
                ret.id = ret._id.toString();
                ret.updatedAt = new Date(ret.updatedAt).toLocaleString(
                    'zh-CN',
                    {
                        hour12: false,
                    }
                );
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

export const Message: Model<MessageDoc> =
    (mongoose.models.Message as Model<MessageDoc>) ||
    mongoose.model<MessageDoc>('Message', MessageSchema);
