import { unlink } from 'node:fs/promises';
import { join } from 'node:path';

import packageJson from '../package.json';
import { SITE_URL } from '../app/metadata';

const output = join(import.meta.dir, '..', '.output', 'public');
const maps = await Array.fromAsync(
  new Bun.Glob('_nuxt/**/*.js.map').scan({ cwd: output }),
);
const token = process.env.ROLLBAR_SERVER_TOKEN;

if (maps.length === 0) {
  throw new Error('No production source maps were generated');
}

try {
  if (!token) throw new Error('ROLLBAR_SERVER_TOKEN is required');

  for (const relativePath of maps) {
    const form = new FormData();
    const mapPath = join(output, relativePath);
    const minifiedUrl = new URL(
      relativePath.replace(/\.map$/, ''),
      SITE_URL,
    ).href.replace(/^https?:/, '');

    form.append('access_token', token);
    form.append('version', packageJson.version);
    form.append('minified_url', minifiedUrl);
    form.append(
      'source_map',
      Bun.file(mapPath),
      relativePath.split('/').at(-1),
    );

    const response = await fetch('https://api.rollbar.com/api/1/sourcemap', {
      method: 'POST',
      body: form,
      signal: AbortSignal.timeout(15_000),
    });

    if (!response.ok) {
      throw new Error(
        `Rollbar rejected ${relativePath}: ${response.status} ${await response.text()}`,
      );
    }

    console.log(`Uploaded ${relativePath}`);
  }
} finally {
  await Promise.all(maps.map((path) => unlink(join(output, path))));
}
