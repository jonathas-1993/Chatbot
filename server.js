// server.js
import express from "express";
import cors from "cors";
import bodyParser from "body-parser";
import { createClient } from "@supabase/supabase-js";
import dotenv from "dotenv";

dotenv.config();

const app = express();
app.use(cors());
app.use(bodyParser.json());
app.use(express.static("public"));

// 🔗 Conexão Supabase
const SUPABASE_URL = process.env.SUPABASE_URL;
const SUPABASE_KEY = process.env.SUPABASE_KEY;

if (!SUPABASE_URL || !SUPABASE_KEY) {
  console.error("❌ ERRO: SUPABASE_URL e SUPABASE_KEY não definidos.");
  process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

// 🩺 Health Check
app.get("/health", (_, res) => res.json({ status: "ok", time: new Date().toISOString() }));

// 📝 Rota de denúncia
app.post("/denuncia", async (req, res) => {
  try {
    const { tipo, local, data_evento, hora_inicio, hora_fim, observacoes } = req.body;

    if (!tipo || !local || !data_evento || !hora_inicio || !hora_fim) {
      return res.status(400).json({ success: false, message: "Campos obrigatórios faltando." });
    }

    const { data, error } = await supabase
      .from("denuncias")
      .insert([{
        tipo,
        local,
        data_evento,
        hora_inicio,
        hora_fim,
        observacoes: observacoes || null,
        criado_em: new Date().toISOString()
      }]);

    if (error) {
      console.error("Erro Supabase:", error);
      return res.status(500).json({ success: false, message: "Erro ao salvar denúncia." });
    }

    res.json({ success: true, message: "Denúncia registrada!", data });
  } catch (err) {
    console.error("Erro servidor:", err);
    res.status(500).json({ success: false, message: "Erro interno do servidor." });
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`🚦 Fiscabot ativo na porta ${PORT}`));
