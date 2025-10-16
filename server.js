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
  console.error("❌ ERRO: SUPABASE_URL e SUPABASE_KEY não definidos.");
  process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

// valida DD/MM/YYYY
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

// normaliza hora para HH:MM:SS
function normalizeTime(h) {
  if (!h) return null;
  // aceita "HH:MM" ou "HH:MM:SS"
  const regexHM = /^([01]\d|2[0-3]):([0-5]\d)$/;
  const regexHMS = /^([01]\d|2[0-3]):([0-5]\d):([0-5]\d)$/;
  if (regexHMS.test(h)) return h;
  if (regexHM.test(h)) return h + ":00";
  return null;
}

const regexHora = /^([01]\d|2[0-3]):([0-5]\d)(:[0-5]\d)?$/;

app.get("/health", (_, res) => res.json({ status: "ok", time: new Date().toISOString() }));

app.post("/denuncia", async (req, res) => {
  try {
    console.log("Recebido /denuncia:", req.body);
    // Desestruture campos possíveis (se não enviados, serão undefined)
    const {
      tipo, local, bairro, referencia, nome_local, endereco,
      data_evento, dia_semana, hora_inicio, hora_fim, observacoes
    } = req.body;

    // Validação mínima: tipo e local (ou outros, conforme sua regra)
    if (!tipo || !local || !data_evento || !hora_inicio || !hora_fim) {
      return res.status(400).json({ success: false, message: "Campos obrigatórios faltando. Verifique tipo, local, data_evento, hora_inicio, hora_fim." });
    }

    if (!validarDataDDMMYYYY(data_evento)) {
      return res.status(400).json({ success: false, message: "Formato de data inválido. Use DD/MM/YYYY." });
    }
    const dataIso = ddmmyyyyToIso(data_evento);

    // normaliza horas
    const hInicio = normalizeTime(hora_inicio);
    const hFim = normalizeTime(hora_fim);
    if (!hInicio || !hFim) {
      return res.status(400).json({ success: false, message: "Formato de hora inválido. Use HH:MM ou HH:MM:SS." });
    }

    // monta payload com os campos do seu schema
    const payload = {
      tipo,
      local,
      bairro: bairro || null,
      referencia: referencia || null,
      nome_local: nome_local || null,
      endereco: endereco || null,
      data_evento: dataIso,       // date
      dia_semana: dia_semana || null,
      hora_inicio: hInicio,       // time
      hora_fim: hFim,             // time
      observacoes: observacoes || null
      // NOT sending created_at - DB default will handle it
    };

    const { data, error } = await supabase
      .from("denuncias")
      .insert([payload]);

    if (error) {
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
