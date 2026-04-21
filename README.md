# DiabeTech 🩺
### Sistema web de controle de glicemia — Diabetes Tipo 1

**Projeto de Extensão V · Análise e Desenvolvimento de Sistemas**
Desenvolvido por **Pedro Rafael Lima Dias** · Orientação: Dr. Fabrício · Belo Horizonte, 2025

---

## Estrutura do projeto

```
diabetech/
├── index.html        ← Página principal
├── css/
│   └── style.css     ← Estilos do sistema
├── js/
│   └── app.js        ← Lógica e funcionalidades
└── README.md
```

---

## Como rodar localmente

### Opção 1 — Abrir direto no navegador
Clique duas vezes no arquivo `index.html` para abrir no navegador.

### Opção 2 — Com servidor local (recomendado)
Se você tem o Node.js instalado:
```bash
npx serve .
```
Depois acesse: `http://localhost:3000`

Ou com Python:
```bash
python -m http.server 8000
```
Depois acesse: `http://localhost:8000`

---

## Como publicar no Vercel (igual ao diabetech.vercel.app)

1. Crie uma conta em [vercel.com](https://vercel.com) (é grátis)
2. Faça login e clique em **"Add New Project"**
3. Escolha **"Deploy from your computer"** ou suba via GitHub:
   - Crie um repositório no [github.com](https://github.com)
   - Suba os arquivos com Git:
     ```bash
     git init
     git add .
     git commit -m "DiabeTech - PEX V"
     git push
     ```
   - No Vercel, conecte o repositório
4. Clique em **Deploy** — pronto!

---

## Funcionalidades

- Registro de medições com valor, horário, data, momento e observação
- Alertas automáticos para hipoglicemia (<70 mg/dL) e hiperglicemia (>180 mg/dL)
- Gráfico de linha com pontos coloridos por faixa glicêmica
- Filtros de visualização: hoje, 7 dias ou todos
- Histórico em tabela com filtro por status e botão de excluir
- Painel do médico com estatísticas e observações clínicas
- Exportação do histórico em CSV
- Dados salvos localmente (localStorage) — sem precisar de servidor
- Design responsivo: funciona no celular, tablet e computador

---

## Tecnologias utilizadas

| Tecnologia | Uso |
|---|---|
| HTML5 | Estrutura das páginas |
| CSS3 | Estilização e responsividade |
| JavaScript (ES6+) | Lógica e interatividade |
| Chart.js | Gráfico de evolução glicêmica |
| localStorage | Armazenamento local dos dados |
| Google Fonts (DM Sans) | Tipografia |

---

## Faixas de referência glicêmica

| Status | Faixa |
|---|---|
| ✅ Normal | 70 – 180 mg/dL |
| 🔴 Hipoglicemia | Abaixo de 70 mg/dL |
| 🟡 Hiperglicemia | Acima de 180 mg/dL |

---

*DiabeTech · PEX V · Descomplica · 2025*
