# 🚦 Fiscabot – DETRAN-AM

Assistente de fiscalização para registro de denúncias via chat.  
Projeto demo integrado ao **Supabase** (banco de dados) e **Render** (deploy).

---

## 📁 Estrutura do Projeto

fiscabot/
│── package.json
│── server.js
│── public/
│ ├── index.html
│ ├── style.css
│ └── fiscabot.png

yaml
Copiar código

---

## ⚙️ Tecnologias Utilizadas

- Node.js + Express → backend
- Supabase → banco de dados PostgreSQL
- Render → deploy do app
- SpeechSynthesis API → voz no navegador
- HTML/CSS/JS → interface do chatbot

---

## 🛠️ Configuração Local

1. **Clonar o repositório**  
   ```bash
   git clone https://github.com/seu-usuario/fiscabot.git
   cd fiscabot
Instalar dependências

bash
Copiar código
npm install
Configurar variáveis de ambiente
Crie um arquivo .env na raiz:

ini
Copiar código
SUPABASE_URL=https://xxxxx.supabase.co
SUPABASE_KEY=eyJhbGciOiJ...
PORT=3000
Rodar localmente

bash
Copiar código
npm start
Abra http://localhost:3000

🗄️ Banco de Dados (Supabase)
Crie a tabela denuncias:

sql
Copiar código
create table denuncias (
  id bigint generated always as identity primary key,
  tipo text not null,
  local text,
  bairro text,
  referencia text,
  nome_local text,
  endereco text,
  data_evento text,
  dia_semana text,
  hora_inicio text,
  hora_fim text,
  observacoes text,
  created_at timestamp default now()
);
🚀 Deploy no Render
Suba o código para o GitHub.

No Render:

New Web Service → conectar ao repositório

Build Command: npm install

Start Command: node server.js

Adicione variáveis de ambiente em Settings → Environment Variables:

SUPABASE_URL

SUPABASE_KEY

🤖 Funcionalidades
Chat interativo para registrar denúncias:

Rolezinho 🎶

Adega 🍻

Estacionamento irregular 🚗 (encaminha para outro canal)

Coleta de informações:

Local, bairro, referência

Data, dia da semana

Horário de início/fim

Observações

Salva automaticamente no Supabase

Feedback visual e de voz

Tela encerra após denúncia concluída

🔊 Integração com Voz
O bot lê as mensagens usando a API nativa do navegador.
Funciona em navegadores modernos (Chrome, Edge, Safari).

📌 Próximos Passos
 Integração com modelo de IA (ex: GPT) para respostas inteligentes

 Painel administrativo para listar denúncias

 Suporte a geolocalização (Google Maps API)

 Melhorar interface com Tailwind/React

