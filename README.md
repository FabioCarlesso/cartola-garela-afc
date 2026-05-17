# Cartola #Garela_afc

Site estático para gerenciar a liga anual do Cartola FC com os amigos: lista de participantes, status de pagamento, premiação e aviso pronto pro WhatsApp.

Substitui a [planilha do Drive](https://bit.ly/garela2026) que era usada antes.

## Uso

### Ver os dados (qualquer pessoa)
Abrir `index.html` no navegador (ou acessar a URL do GitHub Pages).

### Editar os dados (admin)
1. Abrir `admin.html` no navegador (clique duplo no arquivo, ou via Pages)
2. Editar configurações da liga, premiação e participantes. Mudanças ficam salvas no `localStorage` automaticamente.
3. Clicar em **📋 Exportar data.js** — o conteúdo vai pro clipboard
4. No GitHub, abrir [`data.js`](data.js), editar, colar o conteúdo, commit
5. GitHub Pages atualiza em ~30 segundos

## Estrutura

```
index.html      → página pública
admin.html      → tela de edição
data.js         → fonte da verdade (participantes, configurações)
app.js          → lógica da página pública
admin.js        → lógica do admin (CRUD + export)
styles.css      → estilo compartilhado
planejamento.md → documento de planejamento
```

Sem build, sem dependências. Roda direto em `file://`.

## Virada de ano

1. Copiar `data.js` atual para `archive/{ano}.js`
2. Limpar pagamentos no admin, atualizar ano, exportar e commitar
