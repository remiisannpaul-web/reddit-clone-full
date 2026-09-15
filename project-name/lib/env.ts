import path from 'node:path';
import dotenv from 'dotenv';

// Resolve configuration from this package, independent of the launch directory.
const packageRoot = path.resolve(
  __dirname,
  __dirname.includes(`${path.sep}dist${path.sep}`) ? '../..' : '..',
);
dotenv.config({ path: path.join(packageRoot, '.env.local'), quiet: true });
dotenv.config({ path: path.join(packageRoot, '.env'), quiet: true });
// Compatibility with the existing shared development configuration.
dotenv.config({ path: path.join(packageRoot, '../.env.local'), quiet: true });
