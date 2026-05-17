# Cartola #Garela_afc — Planejamento

Migração da planilha do Google Drive para um site estático estilo [prompt-finction](https://fabiocarlesso.github.io/prompt-finction/), hospedado no GitHub Pages.

## Objetivo

Substituir a planilha `https://bit.ly/garela2026` por uma página simples onde:

- Você (admin único) gerencia participantes e pagamentos
- Os amigos da liga veem o status sem precisar abrir a planilha
- O aviso do WhatsApp é gerado automaticamente com os valores corretos

## Decisões

| Tópico | Decisão |
|---|---|
| Audiência | Admin único (você edita, resto só vê) |
| Hospedagem | GitHub Pages, repo novo `cartola-garela-afc` |
| Stack | HTML + CSS + JS puro, sem build, sem framework |
| Dados | `data.js` versionado no repo (não `data.json`, pra rodar em `file://` sem servidor) |
| Integração Cartola | Não. A pontuação fica no próprio Cartola FC. |
| Multi-ano | Pasta `archive/` com snapshots por ano |

## Estrutura de arquivos

```
cartola-garela-afc/
├── index.html             # view pública: tabela + premiação + botão WhatsApp
├── admin.html             # sua tela de edição
├── data.js                # fonte da verdade (const DATA = {...})
├── css/
│   └── styles.css         # estilo compartilhado
├── js/
│   ├── app.js             # lógica da view pública (render, cálculos, copy)
│   └── admin.js           # lógica do admin (CRUD, localStorage, export)
├── docs/
│   └── planejamento.md    # este arquivo
├── archive/
│   └── 2025.js            # snapshots de anos anteriores (quando aplicável)
└── README.md
```

## Modelo de dados

Refletindo o que a planilha 2026 realmente tem (4 campos por participante + premiação subdividida por colocação):

`data.js`:

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
  // Premiação fixa em reais por colocação (não percentual).
  // A planilha hoje trabalha assim e os totais variam com o N de participantes.
  premiacao: {
    campeonato: { "1": 400, "2": 280, "3": 130, "4": 30 },
    turno1:     { "1": 140, "2": 100, "3": 40 },
    turno2:     { "1": 140, "2": 100, "3": 40 }
  },
  participantes: [
    {
      nome: "Fábio N. Carlesso",
      apelido: "Fabinho",
      time: "Timao NUTS",
      manager: "Sir. Fábio Carlesso",
      pago: 100
    }
    // ... etc
  ]
};
```

**Status** é derivado automaticamente de `pago` vs `inscricao`:
- `pago === 0` → pendente
- `0 < pago < inscricao` → parcial
- `pago >= inscricao` → pago

**Por que valores fixos em vez de percentual?** A planilha atual usa valores absolutos por colocação. Manter assim evita quebrar a regra que o grupo já conhece. Os totais (60/20/20) viram conferência, não fonte da verdade.

## Telas

### `index.html` (pública)

1. **Cabeçalho** — nome da liga, ano, links (Cartola, WhatsApp, planilha legada)
2. **Card de premiação** mostra as 3 categorias com valores por colocação:
   - **Campeonato**: 1º R$400 • 2º R$280 • 3º R$130 • 4º R$30
   - **1º Turno**: 1º R$140 • 2º R$100 • 3º R$40
   - **2º Turno**: 1º R$140 • 2º R$100 • 3º R$40
   - Plus: total arrecadado vs. esperado (`pagos × 100 / total × 100`)
3. **Tabela de participantes** — Nome real • Apelido • Time • Manager (Cartola) • Status (✅ pago / 🟡 parcial / ❌ pendente) • Valor pago
4. **Botão "📋 Copiar aviso do WhatsApp"** — gera o texto exato do aviso atual, já com Pix/links/valores embutidos a partir de `data.js`

### `admin.html` (sua tela)

1. **Configurações da liga** — ano, valor inscrição, distribuição %, Pix, links (campos editáveis)
2. **Tabela editável de participantes** — adicionar/remover linha, editar nome, marcar pago, ajustar valor
3. **Persistência local** — toda edição salva em `localStorage` automaticamente, pra não perder se fechar o navegador
4. **Botões**:
   - **📋 Exportar `data.js`** — copia o arquivo pronto pro clipboard, você cola no GitHub e commita
   - **🔄 Recarregar do `data.js`** — descarta edições locais
   - **🗑️ Limpar rascunho local**

## Fluxo de atualização

1. Você abre `admin.html` (do repo clonado ou direto do GitHub Pages)
2. Edita o que precisa — `localStorage` segura o rascunho
3. Clica em **Exportar `data.js`**
4. Vai em `github.com/.../cartola-garela-afc`, edita `data.js`, cola, commita
5. GitHub Pages atualiza em ~30s; participantes veem o `index.html` novo

## Aviso do WhatsApp — template

Texto que o botão de copy vai gerar, montado dinamicamente a partir do `data.js`:

```
Cartola FC - {ano}
- Link da liga -> {links.ligaCartola ou links.planilha}
- Pessoal, entrem no cartola e procurem pela liga #Garela_afc
- Na liga utilizamos a pontuação normal do cartola (considerando a pontuação do capitão 1.5x)
- Basicamente serão {inscricao} reais de inscrição
- Sendo {distribuicao.campeonato},00 para premiação do campeonato e {distribuicao.turno1} para cada turno
- Assim que todos tiverem pago, definimos as premiações
- Pagamento: Pix {pix}
- Dúvidas: Grupo do whatsapp "Cartola #Garela_afc" -> {links.whatsapp}
```

## Migração inicial

1. Abrir a planilha atual
2. Abrir `admin.html` local
3. Adicionar manualmente os ~10-20 participantes e status atual
4. Exportar `data.js`, commitar como versão inicial
5. Avisar no grupo do WhatsApp o novo link (e manter a planilha como referência histórica, sem editar mais)

## Virada de ano

Quando começar 2027:

1. Copiar `data.js` atual para `archive/2026.js`
2. Resetar `data.js` (limpar participantes, atualizar `ano`)
3. Opcional: dropdown no `index.html` pra ver anos anteriores

## Fora de escopo (intencionalmente)

- API do Cartola FC (não-oficial, quebra)
- Autenticação / múltiplos admins
- Notificações automáticas
- Histórico de pagamentos com datas
- Upload de comprovantes

Se algum desses virar necessidade real depois, repensar a stack (provavelmente Firebase/Supabase).

## Próximos passos

1. ✅ Aprovar este planejamento
2. Criar `index.html`, `styles.css`, `data.js` de exemplo
3. Criar `admin.html` + `admin.js`
4. Migrar dados da planilha 2026 atual
5. Criar repo no GitHub, habilitar Pages, fazer push
6. Atualizar link no grupo do WhatsApp
