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

const SUPABASE_URL = process.env.SUPABASE_URL;
const SUPABASE_KEY = process.env.SUPABASE_KEY;

if (!SUPABASE_URL || !SUPABASE_KEY) {
  console.error("❌ ERRO: SUPABASE_URL e SUPABASE_KEY não definidos. Defina as vars de ambiente.");
  process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

// Health check
app.get("/health", (_, res) => res.json({ status: "ok", time: new Date().toISOString() }));

// util: valida DD/MM/YYYY
function validarDataDDMMYYYY(str) {
  const regex = /^(\d{2})\/(\d{2})\/(\d{4})$/;
  if (!regex.test(str)) return false;
  const [d, m, y] = str.split("/").map(Number);
  const dt = new Date(y, m - 1, d);
  return dt.getFullYear() === y && dt.getMonth() === m - 1 && dt.getDate() === d;
}
function ddmmyyyyToIso(str) {
  const [d, m, y] = str.split("/");
  return `${y}-${m.padStart(2, "0")}-${d.padStart(2, "0")}`; // YYYY-MM-DD
}
const regexHora = /^([01]\d|2[0-3]):([0-5]\d)$/;

// Rota de denúncia
app.post("/denuncia", async (req, res) => {
  try {
    console.log("Recebido /denuncia:", req.body);
    const { tipo, local, data_evento, hora_inicio, hora_fim, observacoes } = req.body;

    // valida obrigatórios
    if (!tipo || !local || !data_evento || !hora_inicio || !hora_fim) {
      return res.status(400).json({ success: false, message: "Campos obrigatórios faltando." });
    }

    if (!validarDataDDMMYYYY(data_evento)) {
      return res.status(400).json({ success: false, message: "Formato de data inválido. Use DD/MM/YYYY." });
    }
    if (!regexHora.test(hora_inicio) || !regexHora.test(hora_fim)) {
      return res.status(400).json({ success: false, message: "Formato de hora inválido. Use HH:MM." });
    }

    // converte para YYYY-MM-DD para coluna date
    const dataIso = ddmmyyyyToIso(data_evento);

    // montar payload sem created_at/criado_em (deixe o DB preencher)
    const payload = {
      tipo,
      local,
      data_evento: dataIso,
      hora_inicio,
      hora_fim,
      observacoes: observacoes || null
    };

    const { data, error } = await supabase
      .from("denuncias")
      .insert([payload]);

    if (error) {
      // log detalhado do erro retornado pelo Supabase/PostgREST
      console.error("Erro Supabase:", {
        message: error.message,
        details: error.details,
        hint: error.hint,
        code: error.code
      });
      return res.status(500).json({ success: false, message: "Erro ao salvar denúncia.", error });
    }

    console.log("Inserido no Supabase:", data);
    return res.json({ success: true, message: "Denúncia registrada!", data });
  } catch (err) {
    console.error("Erro servidor:", err);
    return res.status(500).json({ success: false, message: "Erro interno do servidor.", error: err.message });
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`🚦 Fiscabot ativo na porta ${PORT}`));
