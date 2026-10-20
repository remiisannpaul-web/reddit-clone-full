import path from 'node:path';
import { existsSync, readFileSync } from 'node:fs';
import dotenv from 'dotenv';

// Resolve configuration from this package, independent of the launch directory.
function findPackageRoot() {
  let directory = __dirname;
  while (true) {
    const manifest = path.join(directory, 'package.json');
    if (existsSync(manifest)) {
      const contents: unknown = JSON.parse(readFileSync(manifest, 'utf8'));
      if (
        contents &&
        typeof contents === 'object' &&
        'name' in contents &&
        contents.name === 'project-name'
      )
        return directory;
    }
    const parent = path.dirname(directory);
    if (parent === directory)
      throw new Error('Cannot locate the backend package');
    directory = parent;
  }
}
const packageRoot = findPackageRoot();
dotenv.config({ path: path.join(packageRoot, '.env.local'), quiet: true });
dotenv.config({ path: path.join(packageRoot, '.env'), quiet: true });
// Compatibility with the existing shared development configuration.
dotenv.config({ path: path.join(packageRoot, '../.env.local'), quiet: true });
