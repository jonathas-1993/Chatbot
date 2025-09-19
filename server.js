const express = require("express");
const path = require("path");
const bodyParser = require("body-parser");
const cors = require("cors");
const QRCode = require("qrcode");

const app = express();
const PORT = process.env.PORT || 3000; // Render define a porta

// Middlewares
app.use(cors());
app.use(bodyParser.json());
app.use(express.static(path.join(__dirname, "public"))); // serve index.html

// Rota de teste
app.get("/ping", (req, res) => {
  res.send("✅ Fiscabot rodando no Render!");
});

// Rota para gerar QRCode com o link do app
app.get("/qrcode", async (req, res) => {
  try {
    const url = `https://${req.headers.host}`;
    const qr = await QRCode.toDataURL(url);
    res.send(`
      <h2>📲 Acesse o Fiscabot pelo QRCode</h2>
      <img src="${qr}" />
      <p><a href="${url}" target="_blank">${url}</a></p>
    `);
  } catch (err) {
    res.status(500).send("Erro ao gerar QR Code");
  }
});

// Start do servidor
app.listen(PORT, () => {
  console.log(`🚦 Servidor Fiscabot rodando na porta ${PORT}`);
});
