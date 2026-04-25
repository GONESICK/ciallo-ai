import { Provide, Config, Inject } from '@midwayjs/core';
import { HttpService } from '@midwayjs/axios';
import { createParser, EventSourceMessage } from 'eventsource-parser';
import { Detail } from './dto';
// import type { MessageItem } from './dto';
import type { Message } from '@repo/shared';
import { buildInput, createBlockAssembler } from '@repo/shared';

@Provide()
export class ChatService {
    @Config('dsKey')
    dsKey: string;

    @Inject()
    HttpService: HttpService;

    private init: boolean = false;

    async requestAi(
        messages: Record<string, any>[],
        cb: (data: string) => void
    ) {
        const apiKey = this.dsKey;
        if (this.init) {
            await new Promise((r) =>
                setTimeout(() => {
                    r(true);
                }, 100)
            );
        }
        return new Promise((resolve, reject) => {
            this.HttpService.request({
                url: 'https://ark.cn-beijing.volces.com/api/v3/chat/completions',
                method: 'post',
                headers: {
                    Authorization: `Bearer ${apiKey}`,
                },
                responseType: 'stream',
                data: {
                    stream: true,
                    model: 'doubao-seed-2-0-pro-260215',
                    thinking: {
                        type: 'disabled',
                    },
                    messages,
                },
            })
                .then((res) => {
                    this.init = true;
                    console.log(res);
                    res.data.on('data', (chunk) => {
                        cb(chunk);
                    });
                    res.data.on('end', () => {
                        cb('[DONE]');
                        resolve(null);
                    });
                    res.data.on('error', (err) => {
                        reject(err);
                    });
                })
                .catch((err) => {
                    console.error('requestDeepSeek error:', err);
                    reject(err);
                });
        });
    }
    // 直接返回，不需要流
    async requestAiJson(
        messages: Record<string, any>[],
        cb: (data: string) => void
    ) {
        const apiKey = this.dsKey;
        return new Promise((resolve, reject) => {
            this.HttpService.request({
                url: 'https://ark.cn-beijing.volces.com/api/v3/chat/completions',
                method: 'post',
                headers: {
                    Authorization: `Bearer ${apiKey}`,
                },
                data: {
                    model: 'doubao-seed-2-0-pro-260215',
                    thinking: {
                        type: 'disabled',
                    },
                    messages,
                },
            })
                .then((res) => {
                    cb(res.data);
                })
                .catch((err) => {
                    console.error('requestDeepSeek error:', err);
                    reject(err);
                });
        });
    }

    createResponseStream(
        messages: Message[],
        sessionId: string,
        previous_response_id: string,
        hooks: {
            onmessage?: (ev: EventSourceMessage) => void;
            onclose?: (ev: EventSourceMessage) => void;
            onerror?: (err: Error) => void;
        }
    ): AbortController {
        const key = this.dsKey;
        const controller = new AbortController();
        const input = buildInput(messages);
        const assembler = createBlockAssembler();
        const _this = this;
        async function sendRequest() {
            try {
                const res = await fetch(
                    'https://ark.cn-beijing.volces.com/api/v3/responses',
                    {
                        method: 'POST',
                        headers: {
                            Authorization: `Bearer ${key}`,
                            'Content-Type': 'application/json',
                        },
                        signal: controller.signal,
                        body: JSON.stringify({
                            model: 'doubao-seed-2-0-pro-260215',
                            stream: true,
                            input,
                            previous_response_id,
                        }),
                    }
                );
                const reader = res.body.getReader();
                const decoder = new TextDecoder();
                const parser = createParser({
                    onEvent: (event: { event: string; data: string }) => {
                        if (event.data === '[DONE]') {
                            hooks.onclose?.(event);
                            try {
                                const last = assembler.getResult();
                                assembler.reset();
                                _this.createMessage(sessionId, {
                                    id: null,
                                    role: 'assistant',
                                    type: 'message',
                                    status: 'done',
                                    content: last,
                                });
                            } catch (error) {
                                console.error('Error parsing event1:', error);
                            }
                        } else {
                            try {
                                const temp = JSON.parse(event.data);
                                if (
                                    temp.type === 'response.output_text.delta'
                                ) {
                                    assembler.applyDelta(temp);
                                }
                            } catch (error) {
                                console.error('Error parsing event2:', error);
                            }
                            hooks.onmessage?.(event);
                        }
                    },
                    onError: (error) => {
                        hooks.onerror?.(error);
                    },
                });
                try {
                    while (true) {
                        const { done, value } = await reader.read();
                        if (done) break;
                        const chunk = decoder.decode(value, { stream: true });
                        parser.feed(chunk);
                    }
                } catch (error) {
                    hooks.onerror?.(error as Error);
                }
            } catch (error) {
                hooks.onerror?.(error as Error);
            }
        }
        sendRequest();

        return controller;
    }

    async createMessage(sessionId: string, data: Message) {
        const detail = new Detail({
            sessionId: sessionId,
            content: data.content,
            role: data.role,
            type: data.type,
            status: data.status ?? 'done',
        });
        const res = await detail.save();
        return res;
    }

    async findMessagesBySessionId(sessionId: string) {
        console.log(sessionId);
        const res = await Detail.find({ sessionId });
        return res;
    }
}
