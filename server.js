/**
 * server.js
 * Servidor Express que:
 * - Serve os arquivos estáticos (frontend).
 * - Recebe denúncias via POST /api/report (FormData com fotos opcionais).
 * - Salva as denúncias em ./db/reports.json
 * - Fornece página de visualização /report/:id
 * - Gera QR Code para o link público (dataURL)
 *
 * RODAR:
 * npm install
 * node server.js
 *
 * Para expor publicamente (compartilhar link/QR), usar ngrok: ngrok http 3000
 */

const express = require('express');
const bodyParser = require('body-parser');
const multer = require('multer');         // para upload de fotos
const path = require('path');
const fs = require('fs');
const { v4: uuidv4 } = require('uuid');
const QRCode = require('qrcode');
const cors = require('cors');

const app = express();
const PORT = process.env.PORT || 3000;

// Pastas necessárias
const UPLOAD_DIR = path.join(__dirname, 'uploads');
const DB_DIR = path.join(__dirname, 'db');
const DB_FILE = path.join(DB_DIR, 'reports.json');

// Assegura diretórios
if (!fs.existsSync(UPLOAD_DIR)) fs.mkdirSync(UPLOAD_DIR);
if (!fs.existsSync(DB_DIR)) fs.mkdirSync(DB_DIR);
if (!fs.existsSync(DB_FILE)) fs.writeFileSync(DB_FILE, '[]', 'utf8');

// Config Express
app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// Servir arquivos estáticos (index.html, script.js, style.css)
app.use(express.static(__dirname));

// Config multer para salvar uploads (fotos)
const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, UPLOAD_DIR),
  filename: (req, file, cb) => {
    // salvamos com uuid + extensão original (para evitar colisão)
    const ext = path.extname(file.originalname);
    cb(null, `${uuidv4()}${ext}`);
  }
});
const upload = multer({ storage });

// --- Endpoint: criar denúncia ---
// Aceita FormData (fields + fotos[]). Retorna { id, viewUrl, qrcodeDataUrl }
app.post('/api/report', upload.array('fotos', 6), (req, res) => {
  try {
    // Campos esperados:
    // type, local, data, hora_inicio, hora_fim, descricao, num_veiculos, placas, contato, consent_forward
    const body = req.body;
    const files = req.files || [];

    // Monta objeto da denúncia, adicionando metadados
    const id = uuidv4();
    const timestamp = new Date().toISOString();

    const report = {
      id,
      created_at: timestamp,
      tipo: body.type || 'não informado',
      // Campos principais
      local: body.local || '',
      data: body.data || '',
      hora_inicio: body.hora_inicio || '',
      hora_fim: body.hora_fim || '',
      descricao: body.descricao || '',
      numero_veiculos: body.num_veiculos || '',
      placas: body.placas ? body.placas.split(',').map(p => p.trim()).filter(Boolean) : [],
      contato: body.contato || '',
      consentimento_encaminhar: body.consent_forward === 'true' || false,
      // arquivos salvos
      fotos: files.map(f => `/uploads/${path.basename(f.path)}`)
    };

    // Leitura do DB e append
    const dbRaw = fs.readFileSync(DB_FILE, 'utf8');
    const db = JSON.parse(dbRaw);
    db.push(report);
    fs.writeFileSync(DB_FILE, JSON.stringify(db, null, 2), 'utf8');

    // Gera URL de visualização (local) e QR code (dataURL)
    const host = req.get('host'); // localhost:3000 (ou quando em ngrok: xxxx.ngrok.io)
    const protocol = req.protocol;
    const viewUrl = `${protocol}://${host}/report/${id}`;

    QRCode.toDataURL(viewUrl).then(qrDataUrl => {
      res.json({ ok: true, id, viewUrl, qrDataUrl });
    }).catch(err => {
      console.error('Erro gerando QR:', err);
      res.json({ ok: true, id, viewUrl, qrDataUrl: null });
    });

  } catch (err) {
    console.error('Erro em /api/report', err);
    res.status(500).json({ ok: false, error: 'Erro interno' });
  }
});

// --- Endpoint: visualizar denúncia (HTML simples) ---
app.get('/report/:id', (req, res) => {
  const id = req.params.id;
  const dbRaw = fs.readFileSync(DB_FILE, 'utf8');
  const db = JSON.parse(dbRaw);
  const rep = db.find(r => r.id === id);
  if (!rep) {
    return res.status(404).send('<h3>Denúncia não encontrada</h3>');
  }

  // Monta HTML simples (pode ser estilizado / exportado)
  let fotosHtml = '';
  if (rep.fotos && rep.fotos.length) {
    fotosHtml = rep.fotos.map(p => `<div style="margin:8px;"><img src="${p}" style="max-width:300px; border:1px solid #ccc"></div>`).join('');
  }

  // Gera QR (dataURL novamente)
  const host = req.get('host');
  const protocol = req.protocol;
  const url = `${protocol}://${host}/report/${id}`;

  QRCode.toDataURL(url).then(qr => {
    res.send(`
      <html>
        <head><meta charset="utf-8"><title>Fiscabot - Denúncia ${rep.id}</title></head>
        <body style="font-family:Arial;padding:20px">
          <h2>Denúncia: ${rep.tipo}</h2>
          <p><b>ID:</b> ${rep.id}</p>
          <p><b>Criada em:</b> ${rep.created_at}</p>
          <p><b>Local:</b> ${rep.local}</p>
          <p><b>Data:</b> ${rep.data} &nbsp; <b>Início:</b> ${rep.hora_inicio} &nbsp; <b>Fim:</b> ${rep.hora_fim}</p>
          <p><b>Descrição:</b> ${rep.descricao}</p>
          <p><b>Número de veículos (aprox):</b> ${rep.numero_veiculos}</p>
          <p><b>Placas (se houver):</b> ${rep.placas.join(', ')}</p>
          <p><b>Contato fornecido:</b> ${rep.contato || 'não informado'}</p>
          <div><b>Fotos/video (se houver):</b>${fotosHtml}</div>
          <div style="margin-top:20px">
            <h4>QR Code para este relatório</h4>
            <img src="${qr}" alt="QR Code"/>
          </div>
          <div style="margin-top:20px">
            <button onclick="window.print()">Imprimir / Salvar PDF</button>
          </div>
        </body>
      </html>
    `);
  }).catch(err => {
    res.status(500).send('Erro gerando visualização');
  });
});

// --- Servir uploads estaticamente ---
app.use('/uploads', express.static(UPLOAD_DIR));

// --- Endpoint opcional para gerar QR genérico (ex: /qrcode?url=...) ---
app.get('/qrcode', async (req, res) => {
  const url = req.query.url || `${req.protocol}://${req.get('host')}`;
  try {
    const dataUrl = await QRCode.toDataURL(url);
    res.send(`<h3>Escaneie o QR</h3><img src="${dataUrl}" />`);
  } catch (err) {
    res.status(500).send('Erro gerando QR');
  }
});

// Inicia servidor
app.listen(PORT, () => {
  console.log(`Fiscabot rodando em http://localhost:${PORT}`);
  console.log(`Acesse / para o chat demo; /qrcode para gerar QR de root; /report/:id para visualizar denúncias.`);
});
