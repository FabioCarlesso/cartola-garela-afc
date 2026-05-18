# Cartola #Garela_afc

Site estático para gerenciar a liga anual do Cartola FC com os amigos: lista de participantes, status de pagamento, premiação e aviso pronto pro WhatsApp.

Substitui a [planilha do Drive](https://bit.ly/garela2026) que era usada antes.

## Links

| | |
|---|---|
| Página pública | https://fabiocarlesso.github.io/cartola-garela-afc/ |
| Admin (edição) | https://fabiocarlesso.github.io/cartola-garela-afc/admin.html |
| Grupo WhatsApp | https://bit.ly/garelaWhatsapp |
| Planilha (legado) | https://bit.ly/garela2026 |
| Repositório | https://github.com/FabioCarlesso/cartola-garela-afc |
| Actions | https://github.com/FabioCarlesso/cartola-garela-afc/actions |

## Funcionalidades

- **Página pública** com:
  - Tabela de participantes (nome, apelido, time, manager, status de pagamento)
  - Card de premiação por colocação (Campeonato, 1º Turno, 2º Turno)
  - Resumo de arrecadação (arrecadado, esperado, progresso, nº de pagos)
  - Botão para copiar o aviso do WhatsApp já formatado com os dados atuais

- **Tela de admin** com:
  - Edição inline de configurações da liga (ano, inscrição, Pix, links)
  - Edição da premiação por colocação
  - CRUD da lista de participantes
  - Persistência automática em `localStorage` (não perde o rascunho ao fechar)
  - Exportação do `data.js` para clipboard ou download
  - Preview ao vivo do `data.js` gerado

- **Deploy automático** via GitHub Actions a cada push em `main`

## Como usar

### Como participante (apenas visualizar)
Acesse https://fabiocarlesso.github.io/cartola-garela-afc/ e veja o status atualizado.

### Como admin (Fabio) — atualizar dados

1. Abra https://fabiocarlesso.github.io/cartola-garela-afc/admin.html
2. Faça as edições (configurações, premiação, marcar pagamentos, etc.) — tudo é salvo em `localStorage` automaticamente
3. Clique em **📋 Exportar data.js** — o conteúdo vai para o clipboard
4. No GitHub, abra [`data.js`](https://github.com/FabioCarlesso/cartola-garela-afc/edit/main/data.js), apague o conteúdo, cole o novo e commit
5. O GitHub Actions roda o deploy em ~10s e o site atualiza

> **Dica**: alternativamente, use o botão **⬇️ Baixar data.js** para baixar o arquivo e fazer upload via `git`.

## Estrutura do projeto

```
cartola-garela-afc/
├── index.html                  # página pública (entry point)
├── admin.html                  # tela de edição
├── data.js                     # fonte da verdade (participantes, configs, premiação)
├── css/
│   └── styles.css              # estilo compartilhado
├── js/
│   ├── app.js                  # lógica da página pública
│   └── admin.js                # lógica do admin (CRUD + export)
├── docs/
│   └── planejamento.md         # planejamento e decisões de design
├── .github/
│   └── workflows/
│       └── deploy.yml          # GitHub Actions: deploy do Pages
├── README.md
└── .gitignore
```

**Sem build, sem dependências.** HTML/CSS/JS puro. Abre direto em `file://`.

## Modelo de dados (`data.js`)

```js
const DATA = {
  ano: 2026,
  liga: "Cartola #Garela_afc",
  inscricao: 100,
  pix: "45999111224 (Fabio Nami Carlesso)",
  links: {
    planilha: "https://bit.ly/garela2026",
    whatsapp: "https://bit.ly/garelaWhatsapp",
    ligaCartola: ""
  },
  premiacao: {
    campeonato: { "1": 400, "2": 280, "3": 130, "4": 30 },
    turno1:     { "1": 140, "2": 100, "3": 40 },
    turno2:     { "1": 140, "2": 100, "3": 40 }
  },
  participantes: [
    { nome: "Fábio N. Carlesso", apelido: "Fabinho", time: "Timao NUTS", manager: "Sir. Fábio Carlesso", pago: 100 },
    // ...
  ]
};
```

**Status de pagamento** é derivado automaticamente:
- `pago === 0` → **pendente**
- `0 < pago < inscricao` → **parcial**
- `pago >= inscricao` → **pago**

## Desenvolvimento local

Como não há build, basta abrir o arquivo no navegador:

```bash
# Clone
git clone git@github.com:FabioCarlesso/cartola-garela-afc.git
cd cartola-garela-afc

# Abrir no navegador
xdg-open index.html       # Linux
open index.html           # macOS
start index.html          # Windows
```

> Não precisa de servidor local — os dados vivem em `data.js` (não `.json`), portanto carrega via `<script>` sem problemas de CORS no `file://`.

### Validação rápida de sintaxe

```bash
node --check data.js
node --check js/app.js
node --check js/admin.js
```

## CI/CD — GitHub Actions

O workflow `.github/workflows/deploy.yml` faz o deploy do GitHub Pages a cada push em `main`:

- Trigger: `push` em `main` ou `workflow_dispatch` (manual)
- Sem build — upload do diretório raiz como artifact
- Deploy via `actions/deploy-pages@v4`
- Concorrência: 1 deploy por vez na branch `main`
- Forçado a rodar em Node.js 24 (`FORCE_JAVASCRIPT_ACTIONS_TO_NODE24=true`) para antecipar a obrigatoriedade de junho/2026

Tempo médio de deploy: ~10s.

## Virada de ano

No início de cada temporada:

1. Copiar o `data.js` atual para `archive/{ano}.js` (ex.: `archive/2026.js`)
2. Editar `data.js`:
   - Atualizar `ano`
   - Zerar `pago` de todos os participantes (ou refazer a lista)
   - Revisar valores de `premiacao` se necessário
3. Commitar e fazer push — o site atualiza sozinho

## Fora de escopo (intencional)

- Integração com API do Cartola FC (não oficial, quebra com frequência)
- Autenticação ou múltiplos admins
- Notificações automáticas
- Histórico de pagamentos com datas e comprovantes

Se algum desses virar necessidade real, repensar a stack (Firebase/Supabase, por exemplo).

## Histórico

- **2026**: Migração da planilha do Google Drive para este site estático.

---

Veja também: [`docs/planejamento.md`](docs/planejamento.md) para o planejamento completo e justificativas de design.
