import { Provide } from '@midwayjs/core';
import { Message } from './dto';
import { Detail } from '../chat/dto';
import type { MessageResponseIdInput } from '@repo/shared';

export interface MessageCreateInput {
    title: string;
    previous_response_id: string;
}

export interface MessageUpdateInput {
    title: string;
    previous_response_id: string;
}

@Provide()
export class MessageService {
    async create(data: MessageCreateInput) {
        const message = new Message({
            title: data.title,
        });
        return await message.save();
    }

    async findAll() {
        return await Message.find().sort({ updatedAt: -1 });
    }

    async findById(id: string) {
        return await Message.findById(id);
    }

    async updateById(id: string, data: MessageUpdateInput) {
        return await Message.findOneAndUpdate(
            {
                _id: id,
                isAutoTitle: true, // 👈 关键条件
            },
            {
                title: data.title,
                isAutoTitle: false,
            },
            {
                returnDocument: 'after',
            }
        );
    }

    async updateResponseIdById(
        id: string,
        data: Pick<MessageUpdateInput, 'previous_response_id'>
    ) {
        return await Message.findOneAndUpdate(
            {
                _id: id,
            },
            {
                previous_response_id: data.previous_response_id,
            },
            {
                returnDocument: 'after',
            }
        );
    }

    async deleteById(id: string) {
        // Delete the session first
        const session = await Message.findByIdAndDelete(id);
        if (session) {
            // Delete related chat messages by sessionId
            await Detail.deleteMany({ sessionId: id });
        }
        return session;
    }

    async updateResponseId(id: string, data: MessageResponseIdInput) {
        return await Message.findByIdAndUpdate(
            id,
            { previous_response_id: data.previous_response_id },
            { new: true }
        );
    }
}
