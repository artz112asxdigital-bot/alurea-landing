// Servidor Node/Express: serve o build do React e uma pequena API de conteúdo.
import express from 'express';
import compression from 'compression';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { content } from '../src/content.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const dist = path.resolve(__dirname, '../dist');
const app = express();
const PORT = process.env.PORT || 3001;

app.disable('x-powered-by');
app.use(compression());

app.get('/api/health', (_req, res) => res.json({ ok: true }));
app.get('/api/content', (_req, res) => res.json(content));

app.use(
  express.static(dist, {
    setHeaders(res, file) {
      if (/\/assets\//.test(file.replace(/\\/g, '/'))) {
        res.setHeader('Cache-Control', 'public, max-age=31536000, immutable');
      }
    },
  })
);

app.get('*', (_req, res) => res.sendFile(path.join(dist, 'index.html')));

app.listen(PORT, () => console.log(`Alurea rodando em http://localhost:${PORT}`));
