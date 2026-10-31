import { MongoMemoryServer } from 'mongodb-memory-server';
import { NestFactory } from '@nestjs/core';
import { spawn } from 'node:child_process';
import { fileURLToPath } from 'node:url';

const mongo = await MongoMemoryServer.create();
process.env.MONGO_URI = mongo.getUri();
process.env.MONGO_DB_NAME = 'autohub_browser_test';
const { AppModule } = await import('../dist/app.module.js');
const app = await NestFactory.create(AppModule, { logger: ['error', 'warn'] });
app.enableCors({ origin: 'http://127.0.0.1:5174' });
await app.listen(3001, '127.0.0.1');
const frontend = fileURLToPath(new URL('../../frontend/', import.meta.url));
const vite = spawn(process.execPath, ['node_modules/vite/bin/vite.js', '--host', '127.0.0.1', '--port', '5174', '--strictPort'], {
    cwd: frontend, env: { ...process.env, VITE_API_URL: 'http://127.0.0.1:3001' }, stdio: 'inherit', windowsHide: true,
});
let stopping = false;
async function stop() {
    if (stopping) return;
    stopping = true;
    vite.kill();
    await app.close();
    await mongo.stop();
    process.exit(0);
}
process.on('SIGTERM', stop);
process.on('SIGINT', stop);
vite.on('exit', stop);
