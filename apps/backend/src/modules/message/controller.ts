import {
    Body,
    Controller,
    Get,
    Inject,
    Param,
    Post,
    HttpServerResponse,
    httpError,
} from '@midwayjs/core';
import type { Context } from '@midwayjs/koa';
import { MessageService } from './service';
import type { MessageCreateInput, MessageUpdateInput } from './service';
import type { MessageResponseIdInput } from '@repo/shared';

@Controller('/message')
export class MessageController {
    @Inject()
    messageService!: MessageService;

    @Inject()
    ctx: Context;

    /**
     * Create a new message
     * @param body - Message data
     */
    @Post('/create')
    async create(@Body() body: MessageCreateInput) {
        const message = await this.messageService.create(body);
        return new HttpServerResponse(this.ctx).json(message);
    }

    /**
     * Get all messages
     */
    @Get('/')
    async findAll() {
        const result = await this.messageService.findAll();
        return new HttpServerResponse(this.ctx).json(result);
    }

    /**
     * Get message by id
     * @param id - Message id
     */
    @Get('/:id')
    async findById(@Param('id') id: string) {
        const message = await this.messageService.findById(id);
        if (!message) {
            throw new httpError.NotFoundError('Message not found');
        }
        return new HttpServerResponse(this.ctx).json(message);
    }

    /**
     * Update message by id
     * @param id - Message id
     * @param body - Update data
     */
    @Post('/update/:id')
    async updateById(
        @Param('id') id: string,
        @Body() body: MessageUpdateInput
    ) {
        const message = await this.messageService.updateById(id, body);
        if (!message) {
            throw new httpError.NotFoundError('Message not found');
        }
        return new HttpServerResponse(this.ctx).json(message);
    }

    /**
     * Delete message by id
     * @param id - Message id
     */
    @Post('/delete/:id')
    async deleteById(@Param('id') id: string) {
        const message = await this.messageService.deleteById(id);
        if (!message) {
            throw new httpError.NotFoundError('Message not found');
        }
        return new HttpServerResponse(this.ctx).json({ success: true });
    }

    /**
     * Update previous_response_id
     * @param id - Message id
     * @param body - Response id data
     */
    @Post('/response/:id')
    async updateResponseId(
        @Param('id') id: string,
        @Body() body: MessageResponseIdInput
    ) {
        const message = await this.messageService.updateResponseId(id, body);
        if (!message) {
            throw new httpError.NotFoundError('Message not found');
        }
        return new HttpServerResponse(this.ctx).json(message);
    }
}
