import { All, BadGatewayException, Controller, Req, Res } from '@nestjs/common';
import type { Request, Response } from 'express';

const excludedHeaders = new Set([
  'connection',
  'content-length',
  'content-encoding',
  'forwarded',
  'host',
  'keep-alive',
  'proxy-authenticate',
  'proxy-authorization',
  'te',
  'trailer',
  'transfer-encoding',
  'upgrade',
  'x-forwarded-host',
  'x-forwarded-port',
  'x-forwarded-proto',
]);

@Controller()
export class AuthProxyController {
  private readonly authServerUrl =
    process.env.NEXT_AUTH_URL ?? 'http://localhost:3000';

  @All('api/auth/{*path}')
  async proxyAuthRequest(
    @Req() request: Request<Record<string, string>, unknown, unknown>,
    @Res() response: Response,
  ): Promise<void> {
    const headers = new Headers();
    for (const [name, value] of Object.entries(request.headers)) {
      if (value !== undefined && !excludedHeaders.has(name)) {
        headers.set(name, Array.isArray(value) ? value.join(', ') : value);
      }
    }

    const method = request.method.toUpperCase();
    const body =
      method === 'GET' || method === 'HEAD' || request.body === undefined
        ? undefined
        : JSON.stringify(request.body);
    let upstream: globalThis.Response;
    try {
      upstream = await fetch(new URL(request.originalUrl, this.authServerUrl), {
        method,
        headers,
        body,
        redirect: 'manual',
        signal: AbortSignal.timeout(15_000),
      });
    } catch (error) {
      if (error instanceof Error) {
        throw new BadGatewayException('Authentication service is unavailable', {
          cause: error,
        });
      }
      throw error;
    }

    response.status(upstream.status);
    for (const [name, value] of upstream.headers) {
      if (!excludedHeaders.has(name) && name !== 'set-cookie') {
        response.setHeader(name, value);
      }
    }
    const cookies = upstream.headers.getSetCookie();
    if (cookies.length > 0) {
      response.setHeader('set-cookie', cookies);
    }

    response.end(Buffer.from(await upstream.arrayBuffer()));
  }
}
