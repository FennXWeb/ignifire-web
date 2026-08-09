import fs from 'node:fs/promises';
import path from 'node:path';

const output = path.resolve('dist');
await fs.rm(output, { recursive: true, force: true });
await fs.mkdir(output, { recursive: true });
await Promise.all(['index.html', 'styles.css', 'client.js', 'health', 'health.json'].map(file => fs.copyFile(path.resolve(file), path.join(output, file))));
console.log('Ignifire for Web built in dist/.');
