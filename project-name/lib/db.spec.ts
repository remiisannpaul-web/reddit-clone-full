import type { Pool } from 'pg';

jest.mock('./env', () => ({}));

describe('database pool configuration', () => {
  const originalMax = process.env.DB_POOL_MAX;

  afterEach(() => {
    if (originalMax === undefined) delete process.env.DB_POOL_MAX;
    else process.env.DB_POOL_MAX = originalMax;
  });

  function loadPool(): Pool {
    let pool: Pool;
    jest.isolateModules(() => {
      pool = require('./db').db;
    });
    return pool!;
  }

  it('defaults to ten connections with bounded connection acquisition', async () => {
    delete process.env.DB_POOL_MAX;
    const pool = loadPool();

    expect(pool.options).toMatchObject({
      max: 10,
      idleTimeoutMillis: 30_000,
      connectionTimeoutMillis: 5_000,
    });
    await pool.end();
  });

  it('uses the configured connection limit', async () => {
    process.env.DB_POOL_MAX = '3';
    const pool = loadPool();

    expect(pool.options.max).toBe(3);
    await pool.end();
  });

  it.each(['0', '-1', '1.5', 'invalid', '', 'Infinity'])(
    'rejects an invalid connection limit: %j',
    (value) => {
      process.env.DB_POOL_MAX = value;

      expect(loadPool).toThrow('DB_POOL_MAX must be a positive integer');
    },
  );
});
