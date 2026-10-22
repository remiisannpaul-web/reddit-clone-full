import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import request from 'supertest';
import { ApiGatewayModule } from '../src/api-gateway.module';

jest.mock('../../../lib/auth', () => ({
  auth: {
    api: {
      getSession: jest.fn().mockResolvedValue(null),
    },
  },
}));

jest.mock('@nestjs/axios', () => {
  const { Module } = require('@nestjs/common');

  class HttpService {}
  class HttpModule {}
  Module({ providers: [HttpService], exports: [HttpService] })(HttpModule);

  return { HttpModule, HttpService };
});

describe('ApiGatewayController (e2e)', () => {
  let app: INestApplication;

  beforeEach(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [ApiGatewayModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    await app.init();
  });

  afterEach(async () => {
    await app.close();
  });

  it('/ (GET)', () => {
    return request(app.getHttpServer())
      .get('/')
      .expect(200)
      .expect('Hello World!');
  });
});
