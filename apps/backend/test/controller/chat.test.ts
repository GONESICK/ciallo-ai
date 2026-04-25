import { createApp, close, createHttpRequest } from '@midwayjs/mock';
import { Framework } from '@midwayjs/koa';

describe('test/controller/chat.test.ts', () => {
  let app;

  beforeAll(async () => {
    app = await createApp<Framework>({
      appDir: process.cwd()
    });
  });

  afterAll(async () => {
    await close(app);
  });

  it('should create app successfully', () => {
    expect(app).toBeDefined();
  });

  it('should POST /chat/stream with invalid request', async () => {
    const result = await createHttpRequest(app)
      .post('/chat/stream')
      .send({});

    expect(result.status).toBe(400);
  });

  it('should POST /chat/stream with empty messages', async () => {
    const result = await createHttpRequest(app)
      .post('/chat/stream')
      .send({ messages: [] });

    expect(result.status).toBe(400);
  });


});
