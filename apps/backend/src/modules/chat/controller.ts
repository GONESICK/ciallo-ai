import {
    Body,
    Get,
    Controller,
    Inject,
    Post,
    httpError,
    HttpServerResponse,
    Query,
} from '@midwayjs/core';
import type { Context } from '@midwayjs/koa';
import { ChatService } from './service';
import { MessageService } from '../message/service';
import type { Message } from '@repo/shared';

@Controller('/chat')
export class ChatController {
    @Inject()
    chatService!: ChatService;
    @Inject()
    messageService!: MessageService;
    @Inject()
    ctx!: Context;

    private streamControllers = new Map<string, AbortController>();

    /**
     * 流式聊天接口 - 返回 SSE 格式
     * @param body - 包含 messages 的请求体
     */
    @Post('/stream-sse')
    async stream(@Body() body: any): Promise<void> {
        const messages = body?.messages || [];
        if (!messages || messages.length === 0) {
            throw new httpError.BadRequestError('messages is required');
        }
        // 存储用户信息
        await this.handleUserMessage(messages, body.sessionId);

        let assistantContent = '';
        const res = this.ctx.res;
        // 正确的 Koa SSE 处理方式：设置状态和响应头，然后禁用自动响应
        this.ctx.status = 200;
        this.ctx.type = 'text/event-stream; charset=utf-8';
        this.ctx.set('Cache-Control', 'no-cache');
        this.ctx.set('Connection', 'keep-alive');
        this.ctx.set('X-Accel-Buffering', 'no');
        this.ctx.respond = false;

        try {
            await this.chatService.requestAi(messages, async (chunk) => {
                const result = this.handleStreamChunk(res, chunk);
                if (result === '[DONE]') {
                    // 最后更新日期
                    // this.sendUpdate(res, { updated_at: Date.now() });
                    this.sendEvent(res, 'done', {});

                    try {
                        // 发送标题
                        await this.sendTitle(
                            res,
                            body.sessionId,
                            messages[messages.length - 1].content,
                            assistantContent
                        );
                    } catch (err) {
                        console.error('title failed', err);
                        // ❗可以什么都不做（你说的没问题）
                    } finally {
                        res.end(); // ✅ 一定要关
                    }

                    // ✅ 这里可以存数据库
                    this.chatService.createMessage(body.sessionId, {
                        id: null,
                        role: 'assistant',
                        status: 'done',
                        type: 'message',
                        content: [
                            {
                                type: 'text',
                                text: assistantContent,
                            },
                        ],
                    });
                    // 结束流
                    res.end();
                    return;
                }
                if (result && result !== '[DONE]') {
                    assistantContent += result;
                }
            });
        } catch (error) {
            console.error('Error in stream:', error);
            if (!res.writableEnded) {
                res.write('data: [ERROR]\n\n');
                res.end();
            }
        }
    }

    async handleUserMessage(messages: any[], sessionId: string) {
        // ✅ 1. 先存用户消息
        await this.chatService.createMessage(sessionId, {
            id: null,
            role: 'user',
            type: 'message',
            content: messages[messages.length - 1].content,
            status: 'done',
        });
    }

    /**
     * 处理来自 AI 服务的流数据
     * @param res - Node.js response 对象
     * @param chunk - 数据块
     */
    private handleStreamChunk(res: any, chunk: Buffer | string): string {
        try {
            const data = chunk.toString();
            let fullText = '';
            if (data === '[DONE]') {
                return '[DONE]';
            }
            // Parse SSE format from AI API
            const lines = data.split('\n');
            for (const line of lines) {
                if (line.trim() === '') continue;

                if (line.startsWith('data: ')) {
                    const jsonStr = line.replace('data: ', '').trim();
                    try {
                        const json = JSON.parse(jsonStr);
                        const content =
                            json?.choices?.[0]?.delta?.content || '';
                        if (content) {
                            fullText += content; // ✅ 累加
                        }
                        res.write(`event: message\ndata: ${jsonStr}\n\n`);
                    } catch {
                        // 忽略解析错误
                    }
                }
            }
            return fullText;
        } catch (_) {
            if (!res.writableEnded) {
                res.write('data: [ERROR]\n\n');
                res.end();
            }
        }
    }

    /**
     * Send custom SSE event
     * @param res - Node.js response object
     * @param eventName - Event name (e.g., 'message', 'update', 'title')
     * @param data - Event data (object or string)
     */
    sendEvent(
        res: { write: (data: string) => void },
        eventName: string,
        data: object | string
    ): void {
        const dataStr = typeof data === 'string' ? data : JSON.stringify(data);
        res.write(`event: ${eventName}\ndata: ${dataStr}\n\n`);
    }

    /**
     * Send update event
     * @param res - Node.js response object
     * @param data - Update data
     */
    sendUpdate(
        res: { write: (data: string) => void },
        data: object | string
    ): void {
        this.sendEvent(res, 'update', data);
    }

    @Post('/sse')
    async createChat(
        @Body()
        body: {
            sessionId: string;
            input: Message[];
            previous_response_id: string;
        }
    ): Promise<any> {
        const { sessionId, input, previous_response_id } = body;
        const MAX_CHARS = 8000; // 最大字数限制
        let assistant = '';
        let prd = null;
        let exceeded = false;
        this.chatService.createMessage(sessionId, input[input.length - 1]);
        const sse = new HttpServerResponse(this.ctx).sse();
        const _this = this;
        const controller = this.chatService.createResponseStream(
            input,
            sessionId,
            previous_response_id,
            {
                onmessage(e) {
                    if (exceeded) return; // 已超限，忽略后续消息

                    if (e.event) {
                        sse.send({ event: e.event, data: e.data });
                        if (e.event === 'response.output_text.delta') {
                            assistant += e.data;
                            // 检查字数限制
                            if (assistant.length > MAX_CHARS) {
                                exceeded = true;
                                sse.send({
                                    event: 'error',
                                    data: {
                                        message: `回复字数超过限制(${MAX_CHARS}字)`,
                                    },
                                });
                                controller.abort();
                                sse.end();
                                return;
                            }
                        }
                        if (e.event === 'response.created') {
                            prd = JSON.parse(e.data).response.id;
                            _this.saveResponseId(sessionId, prd);
                        }
                    } else {
                        sse.send({ data: e.data });
                    }
                },
                onclose() {
                    if (exceeded) return; // 已超限，不执行后续逻辑
                    try {
                        _this
                            .sseSendTitle(
                                sse,
                                sessionId,
                                input,
                                assistant,
                                previous_response_id
                            )
                            .then(() => {
                                sse.end();
                            });
                    } catch (_) {
                        // 忽略关闭错误
                    }
                },
                onerror(err) {
                    if (exceeded) return; // 已超限，忽略错误
                    if (err) {
                        sse.sendError(err);
                        controller?.abort();
                        sse.end();
                    }
                },
            }
        );

        this.streamControllers.set(sessionId, controller);

        sse.on('close', () => {
            console.log('SSE connection closed, aborting fetch request');
            controller.abort();
            this.streamControllers.delete(sessionId);
        });

        return sse;
    }

    /**
     * Send title event
     * @param res - Node.js response object
     * @param {string} userMsg - 用户的消息
     * @param {string} assistantMsg - AI的消息
     */
    async sendTitle(
        res: { write: (data: string) => void },
        sessionId: string,
        userMsg: unknown[],
        assistantMsg: string
    ): Promise<void> {
        // 1️⃣ 后端快速判断（避免 AI 请求）
        const session = await this.messageService.findById(sessionId);
        if (!session.isAutoTitle) return;
        const userMsgText = this.extractTextContent(userMsg);
        const shortAssistant = assistantMsg.slice(0, 100);
        const prompt = `
            请为以下对话生成一个简洁标题：

            要求：
            - 10~15字
            - 准确概括主题
            - 不要标点
            - 不要解释

            用户：${userMsgText}
            助手：${shortAssistant}

            标题：
            `;
        await new Promise<string>((resolve, reject) => {
            this.chatService.requestAiJson(
                [
                    {
                        role: 'user',
                        content: prompt,
                    },
                ],
                (message: any) => {
                    try {
                        const result = message?.choices?.[0]?.message?.content;
                        resolve(result);
                    } catch (err) {
                        reject(err);
                    }
                }
            );
        });

        // const doc = await this.messageService.updateById(sessionId, {
        //     title: title,
        // });
        // if (doc) {
        //     this.sendEvent(res, 'title', title);
        // }
    }

    /**
     * Send title event
     * @param res - Node.js response object
     * @param {string} userMsg - 用户的消息
     * @param {string} assistantMsg - AI的消息
     */
    async sseSendTitle(
        sse: ReturnType<HttpServerResponse<Context>['sse']>,
        sessionId: string,
        userMsg: unknown[],
        assistantMsg: string,
        previous_response_id: string
    ): Promise<void> {
        // 1️⃣ 后端快速判断（避免 AI 请求）
        const session = await this.messageService.findById(sessionId);
        if (!session.isAutoTitle) return;
        const userMsgText = this.extractTextContent(userMsg);
        const shortAssistant = assistantMsg.slice(0, 100);
        const prompt = `
            请为以下对话生成一个简洁标题：

            要求：
            - 10~15字
            - 准确概括主题
            - 不要标点
            - 不要解释

            用户：${userMsgText}
            助手：${shortAssistant}

            标题：
            `;
        const title = await new Promise<string>((resolve, reject) => {
            this.chatService.requestAiJson(
                [
                    {
                        role: 'user',
                        content: prompt,
                    },
                ],
                (message: any) => {
                    try {
                        const result = message?.choices?.[0]?.message?.content;
                        resolve(result);
                    } catch (err) {
                        reject(err);
                    }
                }
            );
        });
        const doc = await this.messageService.updateById(sessionId, {
            title,
            previous_response_id,
        });
        if (doc) {
            sse.send({ event: 'title', data: { title } });
        }
    }

    saveResponseId(sessionId: string, previous_response_id: string) {
        this.messageService.updateResponseIdById(sessionId, {
            previous_response_id,
        });
    }

    extractTextContent(content: any[]): string {
        if (!Array.isArray(content)) return '';

        return content
            .map((item) => {
                if (item.type === 'text') {
                    return item.text;
                }

                if (item.type === 'image') {
                    return item.detail
                        ? `[图片: ${item.detail}]`
                        : '[用户上传了一张图片]';
                }

                return '';
            })
            .filter(Boolean)
            .join('\n');
    }

    // @Post('/message/create')
    // async createMessage(@Body() body: MessageItem) {
    //     const res = await this.chatService.createMessage(body);
    //     return new HttpServerResponse(this.ctx).json(res);
    // }

    @Get('/message/getDetail')
    async getMessagesById(@Query() query: { id: string }) {
        const sessionId = query.id;
        const res = await this.chatService.findMessagesBySessionId(sessionId);
        return new HttpServerResponse(this.ctx).json(res);
    }
}
