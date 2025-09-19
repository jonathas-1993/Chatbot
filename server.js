import express from "express";
import bodyParser from "body-parser";
import cors from "cors";
import { createClient } from "@supabase/supabase-js";

const app = express();
app.use(cors());
app.use(bodyParser.json());
app.use(express.static("public"));

// 🔑 Variáveis de ambiente (Render → Environment Variables)
const SUPABASE_URL = process.env.SUPABASE_URL;
const SUPABASE_KEY = process.env.SUPABASE_KEY;

// Cliente do Supabase
const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

// Função util para converter "dd/mm/aaaa" → "aaaa-mm-dd"
function converterData(dataBR) {
  const [dia, mes, ano] = dataBR.split("/");
  return `${ano}-${mes}-${dia}`;
}

// Endpoint para salvar denúncia
app.post("/denuncia", async (req, res) => {
  try {
    let {
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

    // converter data para formato ISO
    if (data_evento && data_evento.includes("/")) {
      data_evento = converterData(data_evento);
    }

    const { data, error } = await supabase
      .from("denuncias")
      .insert([{
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
      }]);

    if (error) throw error;

    res.json({ success: true, message: "Denúncia registrada com sucesso!" });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// Porta dinâmica (Render usa process.env.PORT)
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`✅ Fiscabot rodando na porta ${PORT}`));
