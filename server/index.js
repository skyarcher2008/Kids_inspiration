const express = require('express');
const cors = require('cors');
const crypto = require('crypto');
const path = require('path');
const fs = require('fs');
const PORT = process.env.PORT || 8787;
const DATA_PATH = process.env.DATA_PATH || path.join(__dirname, 'data', 'sync.json');

const ensureDir = (filePath) => {
  fs.mkdirSync(path.dirname(filePath), { recursive: true });
};

const hashPassword = (password) => {
  return crypto.createHash('sha256').update(password).digest('hex');
};

const getPassword = (req) => {
  return req.headers['x-sync-pass'] || (req.body && req.body.password) || '';
};

const loadStore = () => {
  try {
    const raw = fs.readFileSync(DATA_PATH, 'utf-8');
    const parsed = JSON.parse(raw);
    if (parsed && typeof parsed === 'object') return parsed;
  } catch {
    // fallthrough
  }
  return { families: {} };
};

const saveStore = (store) => {
  const tempPath = `${DATA_PATH}.tmp`;
  fs.writeFileSync(tempPath, JSON.stringify(store));
  fs.renameSync(tempPath, DATA_PATH);
};

const createApp = async () => {
  ensureDir(DATA_PATH);

  const app = express();
  app.use(cors({
    origin: '*',
    allowedHeaders: ['Content-Type', 'x-sync-pass']
  }));
  app.use(express.json({ limit: '10mb' }));

  app.get('/health', (_req, res) => res.json({ ok: true }));

  app.get('/api/sync/list', async (_req, res) => {
    const store = loadStore();
    const families = Object.values(store.families || {}).map(row => ({
      familyId: row.family_id,
      lastUpdated: row.updated_at || null
    }));
    families.sort((a, b) => (b.lastUpdated || 0) - (a.lastUpdated || 0));
    return res.json({ families });
  });

  app.get('/api/sync', async (req, res) => {
    const familyId = req.query.familyId;
    if (!familyId || typeof familyId !== 'string') {
      return res.status(400).json({ error: 'missing_family_id' });
    }

    const store = loadStore();
    const row = store.families[familyId];
    if (!row) {
      return res.json({ data: null, lastUpdated: null });
    }

    const password = getPassword(req);
    if (row.password_hash) {
      const hash = hashPassword(password);
      if (hash !== row.password_hash) {
        return res.status(401).json({ error: 'invalid_password' });
      }
    }

    return res.json({ data: row.data || null, lastUpdated: row.updated_at || null });
  });

  app.post('/api/sync', async (req, res) => {
    const familyId = req.query.familyId;
    if (!familyId || typeof familyId !== 'string') {
      return res.status(400).json({ error: 'missing_family_id' });
    }

    const body = req.body || {};
    let payload = body.data ?? body;
    let updatedAt = typeof body.lastUpdated === 'number' ? body.lastUpdated : undefined;

    if (typeof payload === 'string') {
      try {
        payload = JSON.parse(payload);
      } catch {
        payload = null;
      }
    }

    if (!payload || typeof payload !== 'object') {
      return res.status(400).json({ error: 'missing_data' });
    }

    if (typeof updatedAt !== 'number' && typeof payload.lastUpdated === 'number') {
      updatedAt = payload.lastUpdated;
    }

    const password = getPassword(req);
    const store = loadStore();
    const row = store.families[familyId];
    const finalUpdatedAt = typeof updatedAt === 'number' ? updatedAt : Date.now();

    if (row) {
      if (row.password_hash) {
        const hash = hashPassword(password);
        if (hash !== row.password_hash) {
          return res.status(401).json({ error: 'invalid_password' });
        }
      }

      if (row.updated_at > finalUpdatedAt) {
        return res.status(409).json({
          error: 'out_of_date',
          data: row.data || null,
          lastUpdated: row.updated_at
        });
      }

      const nextPasswordHash = row.password_hash || (password ? hashPassword(password) : null);
      store.families[familyId] = {
        family_id: familyId,
        password_hash: nextPasswordHash,
        data: payload,
        updated_at: finalUpdatedAt
      };
      saveStore(store);
      return res.json({ ok: true, lastUpdated: finalUpdatedAt });
    }

    const passwordHash = password ? hashPassword(password) : null;
    store.families[familyId] = {
      family_id: familyId,
      password_hash: passwordHash,
      data: payload,
      updated_at: finalUpdatedAt
    };
    saveStore(store);
    return res.json({ ok: true, lastUpdated: finalUpdatedAt });
  });

  return app;
};

createApp()
  .then((app) => {
    app.listen(PORT, () => {
      console.log(`Sync server running on port ${PORT}`);
    });
  })
  .catch((err) => {
    console.error(err);
    process.exit(1);
  });
