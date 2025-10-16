# 🚦 Fiscabot – DETRAN-AM

Assistente automatizado para registro de denúncias relacionadas à fiscalização de trânsito, desenvolvido com Node.js e Supabase, e hospedado na plataforma Render. O sistema coleta, valida e armazena dados estruturados sobre ocorrências como aglomerações irregulares ("rolezinhos"), uso indevido de som automotivo em adegas e estacionamento irregular.

🔗 [Acessar chatbot em produção](https://chatbot-ytei.onrender.com/)

---

## 📁 Estrutura do Projeto


fiscabot/
│── package.json
│── server.js
│── public/
│ ├── index.html
│ ├── fiscabot.png
│ └── (opcional) style.css


---

## ⚙️ Tecnologias Utilizadas

- **Node.js + Express** – Backend e roteamento HTTP
- **Supabase (PostgreSQL)** – Armazenamento de dados estruturados
- **Render** – Hospedagem com deploy contínuo via GitHub
- **HTML/CSS/JavaScript Vanilla** – Interface do usuário
- **SpeechRecognition API** – Entrada de voz (voz para texto)
- **SpeechSynthesis API** – Respostas faladas (texto para voz)

---

## 🤖 Funcionalidades

### Fluxo de atendimento interativo

1. Denúncia de aglomeração ("Rolezinho")
2. Denúncia de adega com som automotivo
3. Denúncia de estacionamento irregular
4. Encerramento do atendimento

### Coleta estruturada de dados

- Local, bairro e ponto de referência
- Data do evento (validação no formato DD/MM/AAAA)
- Horário de início e término (validação no formato HH)
- Campo opcional para observações
- Confirmação dos dados antes do envio
- Validação automática no navegador
- Armazenamento em tempo real no Supabase
- Interface responsiva e leve
- Suporte a entrada por voz 🎙️ e resposta falada 🔊
- Feedback visual de sucesso ou erro no envio

---

## 🗄️ Estrutura da Tabela no Supabase

```sql
create table public.denuncias (
  id bigint generated always as identity primary key,
  tipo text not null,
  local text,
  bairro text,
  referencia text,
  nome_local text,
  endereco text,
  data_evento date,
  dia_semana text,
  hora_inicio time,
  hora_fim time,
  observacoes text,
  created_at timestamp with time zone default timezone('utc'::text, now())
);

🚀 Deploy no Render
O projeto está hospedado na plataforma Render com integração contínua ao GitHub. A cada push na branch principal, o serviço executa automaticamente o build e o deploy.
Configuração do serviço
- Build Command: npm install
- Start Command: node server.js
- Porta: 3000 (padrão Render)
Variáveis de ambiente
Definidas diretamente no painel do Render:
- SUPABASE_URL
- SUPABASE_KEY

💻 Execução Local
git clone https://github.com/seu-usuario/fiscabot.git
cd fiscabot
npm install
node server.js

git clone https://github.com/seu-usuario/fiscabot.git
cd fiscabot
npm install
node server.js

Acesse em: http://localhost:3000

👤 Autor
Jonathas Tavares Neves
Engenheiro de Controle e Automação – UEA
Doutorando em Engenharia Elétrica – UFAM
Atuação em desenvolvimento de soluções Web3, Inteligência Artificial e Internet das Coisas
