import express from "express";
import bodyParser from "body-parser";
import cors from "cors";
import { createClient } from "@supabase/supabase-js";

const app = express();

// Middlewares
app.use(cors());
app.use(bodyParser.json());
app.use(express.static("public")); // serve o conteúdo da pasta "public"

// 🔐 Variáveis de ambiente (Render → Environment Variables)
const SUPABASE_URL = process.env.SUPABASE_URL;
const SUPABASE_KEY = process.env.SUPABASE_KEY;

// Cliente do Supabase
const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

// 🧾 Endpoint para salvar denúncia
app.post("/denuncia", async (req, res) => {
  try {
    const {
      tipo,
      local,
      bairro,
      referencia,
      nome_local,
      endereco,
      data_evento,
      dia_semana,
      hora_inicio,
      hora_fim,
      observacoes
    } = req.body;

    const { error } = await supabase
      .from("denuncias")
      .insert([
        {
          tipo,
          local,
          bairro,
          referencia,
          nome_local,
          endereco,
          data_evento,
          dia_semana,
          hora_inicio,
          hora_fim,
          observacoes,
          created_at: new Date().toISOString()
        }
      ]);

    if (error) throw error;

    res.json({ success: true, message: "✅ Denúncia registrada com sucesso!" });
  } catch (err) {
    console.error("Erro ao salvar denúncia:", err.message);
    res.status(500).json({ success: false, error: err.message });
  }
});

// 🌐 Porta dinâmica (Render usa process.env.PORT)
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`🚦 Fiscabot rodando na porta ${PORT}`));
