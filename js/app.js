(function () {
  const fmtBRL = (v) => v.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });

  function statusDe(participante, inscricao) {
    if (participante.pago <= 0) return "pendente";
    if (participante.pago >= inscricao) return "pago";
    return "parcial";
  }

  function renderLinks() {
    const el = document.getElementById("links");
    const links = DATA.links || {};
    const itens = [];
    if (links.ligaCartola) itens.push(`<a href="${links.ligaCartola}" target="_blank" rel="noopener">Liga no Cartola</a>`);
    if (links.whatsapp) itens.push(`<a href="${links.whatsapp}" target="_blank" rel="noopener">Grupo WhatsApp</a>`);
    if (links.planilha) itens.push(`<a href="${links.planilha}" target="_blank" rel="noopener">Planilha (legado)</a>`);
    el.innerHTML = itens.join("");
  }

  function renderHeader() {
    document.getElementById("liga-titulo").textContent = DATA.liga;
    document.getElementById("ano-subtitulo").textContent = `Temporada ${DATA.ano}`;
    document.title = `${DATA.liga} — ${DATA.ano}`;
  }

  function renderPremiacao() {
    const grid = document.getElementById("grid-premiacao");
    const blocos = [
      { titulo: "Campeonato", chave: "campeonato" },
      { titulo: "1º Turno", chave: "turno1" },
      { titulo: "2º Turno", chave: "turno2" }
    ];
    grid.innerHTML = blocos.map(({ titulo, chave }) => {
      const colocacoes = DATA.premiacao[chave] || {};
      const ganhadores = (DATA.ganhadores && DATA.ganhadores[chave]) || {};
      const total = Object.values(colocacoes).reduce((a, b) => a + Number(b || 0), 0);
      const lis = Object.entries(colocacoes)
        .sort((a, b) => Number(a[0]) - Number(b[0]))
        .map(([pos, valor]) => {
          const nome = ganhadores[pos] || "";
          const winner = nome
            ? ` <span class="winner">${escapeHtml(nome)}</span>`
            : "";
          return `<li>${pos}º — ${fmtBRL(Number(valor))}${winner}</li>`;
        })
        .join("");
      return `
        <div class="prize-block">
          <div class="title">${titulo}</div>
          <ul>${lis}</ul>
          <div class="muted" style="font-size:12px;margin-top:6px">Total: ${fmtBRL(total)}</div>
        </div>
      `;
    }).join("");
  }

  function renderTotais() {
    const totalEsperado = DATA.participantes.length * DATA.inscricao;
    const totalArrecadado = DATA.participantes.reduce((s, p) => s + Number(p.pago || 0), 0);
    const pagos = DATA.participantes.filter(p => statusDe(p, DATA.inscricao) === "pago").length;
    const pct = totalEsperado ? Math.round((totalArrecadado / totalEsperado) * 100) : 0;
    document.getElementById("totais").innerHTML = `
      <div><span class="label">Arrecadado:</span> <span class="value">${fmtBRL(totalArrecadado)}</span></div>
      <div><span class="label">Esperado:</span> <span class="value">${fmtBRL(totalEsperado)}</span></div>
      <div><span class="label">Progresso:</span> <span class="value">${pct}%</span></div>
      <div><span class="label">Pagos:</span> <span class="value">${pagos} / ${DATA.participantes.length}</span></div>
    `;
  }

  function renderTabela() {
    const tbody = document.querySelector("#tabela-participantes tbody");
    tbody.innerHTML = DATA.participantes.map(p => {
      const st = statusDe(p, DATA.inscricao);
      return `
        <tr>
          <td>${escapeHtml(p.nome)}</td>
          <td>${escapeHtml(p.apelido || "")}</td>
          <td>${escapeHtml(p.time || "")}</td>
          <td>${escapeHtml(p.manager || "")}</td>
          <td><span class="status ${st}">${st}</span></td>
          <td class="right">${fmtBRL(Number(p.pago || 0))}</td>
        </tr>
      `;
    }).join("");
  }

  function escapeHtml(s) {
    return String(s).replace(/[&<>"']/g, c => ({
      "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;"
    }[c]));
  }

  function gerarAviso() {
    const linkLiga = (DATA.links && DATA.links.ligaCartola) || (DATA.links && DATA.links.planilha) || "";
    const totalCamp = Object.values(DATA.premiacao.campeonato || {}).reduce((a, b) => a + Number(b || 0), 0);
    const totalT1 = Object.values(DATA.premiacao.turno1 || {}).reduce((a, b) => a + Number(b || 0), 0);
    return [
      `Cartola FC - ${DATA.ano}`,
      `- Link da liga -> ${linkLiga}`,
      `- Pessoal, entrem no cartola e procurem pela liga ${DATA.liga.replace(/^Cartola\s*/i, "")}`,
      `- Na liga utilizamos a pontuação normal do cartola (considerando a pontuação do capitão 1.5x)`,
      `- Basicamente serão ${DATA.inscricao} reais de inscrição`,
      `- Sendo R$${totalCamp},00 para premiação do campeonato e R$${totalT1},00 para cada turno`,
      `- Assim que todos tiverem pago, definimos as premiações`,
      `- Pagamento: Pix ${DATA.pix}`,
      `- Dúvidas: Grupo do whatsapp "${DATA.liga}" -> ${(DATA.links && DATA.links.whatsapp) || ""}`
    ].join("\n");
  }

  function renderAviso() {
    document.getElementById("aviso-texto").value = gerarAviso();
  }

  function toast(msg) {
    const t = document.getElementById("toast");
    t.textContent = msg;
    t.classList.add("show");
    clearTimeout(toast._t);
    toast._t = setTimeout(() => t.classList.remove("show"), 2000);
  }

  function copiarAviso() {
    const texto = gerarAviso();
    navigator.clipboard.writeText(texto)
      .then(() => toast("Aviso copiado!"))
      .catch(() => {
        const ta = document.getElementById("aviso-texto");
        ta.select();
        document.execCommand("copy");
        toast("Aviso copiado!");
      });
  }

  function init() {
    renderHeader();
    renderLinks();
    renderPremiacao();
    renderTotais();
    renderTabela();
    renderAviso();
    document.getElementById("btn-copiar-aviso").addEventListener("click", copiarAviso);
  }

  document.addEventListener("DOMContentLoaded", init);
})();
