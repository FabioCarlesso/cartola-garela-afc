(function () {
  const STORAGE_KEY = "garela-admin-draft-v1";

  let state = null;

  function clone(o) { return JSON.parse(JSON.stringify(o)); }

  function loadState() {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      try { return JSON.parse(raw); } catch (e) { /* ignore */ }
    }
    return clone(DATA);
  }

  function persist() {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  }

  function val(id, def) {
    const el = document.getElementById(id);
    if (!el) return def;
    if (el.type === "number") {
      const n = Number(el.value);
      return Number.isFinite(n) ? n : def;
    }
    return el.value;
  }

  function setVal(id, v) {
    const el = document.getElementById(id);
    if (el) el.value = v == null ? "" : v;
  }

  function buildWinnerOptions() {
    const opts = ['<option value="">— nenhum —</option>'];
    state.participantes.forEach(p => {
      const label = p.apelido ? `${p.nome} (${p.apelido})` : p.nome;
      opts.push(`<option value="${escapeAttr(p.nome)}">${escapeAttr(label)}</option>`);
    });
    return opts.join("");
  }

  function refreshWinnerSelects() {
    const html = buildWinnerOptions();
    document.querySelectorAll("[id^='win-']").forEach(sel => {
      const current = sel.value;
      sel.innerHTML = html;
      sel.value = current;
    });
  }

  function fillForm() {
    setVal("cfg-ano", state.ano);
    setVal("cfg-liga", state.liga);
    setVal("cfg-inscricao", state.inscricao);
    setVal("cfg-pix", state.pix);
    setVal("cfg-link-cartola", (state.links && state.links.ligaCartola) || "");
    setVal("cfg-link-whatsapp", (state.links && state.links.whatsapp) || "");
    setVal("cfg-link-planilha", (state.links && state.links.planilha) || "");

    state.ganhadores = state.ganhadores || { campeonato: {}, turno1: {}, turno2: {} };

    const grupos = [
      ["camp", "campeonato"],
      ["t1", "turno1"],
      ["t2", "turno2"]
    ];
    grupos.forEach(([pref, chave]) => {
      const p = (state.premiacao && state.premiacao[chave]) || {};
      for (let i = 1; i <= 4; i++) {
        setVal(`prem-${pref}-${i}`, p[String(i)] || 0);
      }
    });

    refreshWinnerSelects();
    grupos.forEach(([pref, chave]) => {
      const g = (state.ganhadores && state.ganhadores[chave]) || {};
      for (let i = 1; i <= 4; i++) {
        setVal(`win-${pref}-${i}`, g[String(i)] || "");
      }
    });

    renderParticipantes();
    updatePreview();
  }

  function readForm() {
    state.ano = val("cfg-ano", state.ano);
    state.liga = val("cfg-liga", state.liga);
    state.inscricao = val("cfg-inscricao", state.inscricao);
    state.pix = val("cfg-pix", state.pix);
    state.links = state.links || {};
    state.links.ligaCartola = val("cfg-link-cartola", "");
    state.links.whatsapp = val("cfg-link-whatsapp", "");
    state.links.planilha = val("cfg-link-planilha", "");

    const grupos = [
      ["camp", "campeonato"],
      ["t1", "turno1"],
      ["t2", "turno2"]
    ];
    state.premiacao = state.premiacao || {};
    state.ganhadores = state.ganhadores || {};
    grupos.forEach(([pref, chave]) => {
      const out = {};
      for (let i = 1; i <= 4; i++) {
        const v = val(`prem-${pref}-${i}`, 0);
        if (v > 0) out[String(i)] = v;
      }
      state.premiacao[chave] = out;

      const winners = {};
      for (let i = 1; i <= 4; i++) {
        const v = val(`win-${pref}-${i}`, "");
        if (v) winners[String(i)] = v;
      }
      state.ganhadores[chave] = winners;
    });
  }

  function renderParticipantes() {
    const tbody = document.querySelector("#tabela-admin tbody");
    tbody.innerHTML = "";
    state.participantes.forEach((p, idx) => {
      const tr = document.createElement("tr");
      tr.innerHTML = `
        <td><input type="text" data-i="${idx}" data-k="nome" value="${escapeAttr(p.nome || "")}"></td>
        <td><input type="text" data-i="${idx}" data-k="apelido" value="${escapeAttr(p.apelido || "")}"></td>
        <td><input type="text" data-i="${idx}" data-k="time" value="${escapeAttr(p.time || "")}"></td>
        <td><input type="text" data-i="${idx}" data-k="manager" value="${escapeAttr(p.manager || "")}"></td>
        <td><input type="number" data-i="${idx}" data-k="pago" value="${Number(p.pago || 0)}"></td>
        <td><button class="remove-btn" data-remove="${idx}" title="Remover">×</button></td>
      `;
      tbody.appendChild(tr);
    });
    refreshWinnerSelects();
  }

  function escapeAttr(s) {
    return String(s).replace(/[&<>"']/g, c => ({
      "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;"
    }[c]));
  }

  function onTableInput(e) {
    const t = e.target;
    const i = t.dataset.i;
    const k = t.dataset.k;
    if (i == null || !k) return;
    const idx = Number(i);
    if (t.type === "number") {
      state.participantes[idx][k] = Number(t.value) || 0;
    } else {
      state.participantes[idx][k] = t.value;
    }
    persist();
    updatePreview();
  }

  function onTableClick(e) {
    const idx = e.target.dataset.remove;
    if (idx == null) return;
    state.participantes.splice(Number(idx), 1);
    persist();
    renderParticipantes();
    updatePreview();
  }

  function onAdd() {
    state.participantes.push({ nome: "", apelido: "", time: "", manager: "", pago: 0 });
    persist();
    renderParticipantes();
    updatePreview();
  }

  function onFormInput() {
    readForm();
    persist();
    updatePreview();
  }

  // --- Serialização para data.js ---
  function serialize() {
    const lines = [];
    lines.push("// Fonte da verdade da liga Cartola #Garela_afc.");
    lines.push("// Edite via admin.html → Exportar → cole aqui → commit no GitHub.");
    lines.push("");
    lines.push("const DATA = {");
    lines.push(`  ano: ${Number(state.ano)},`);
    lines.push(`  liga: ${JSON.stringify(state.liga)},`);
    lines.push(`  inscricao: ${Number(state.inscricao)},`);
    lines.push(`  pix: ${JSON.stringify(state.pix)},`);
    lines.push(`  links: {`);
    lines.push(`    planilha: ${JSON.stringify(state.links.planilha || "")},`);
    lines.push(`    whatsapp: ${JSON.stringify(state.links.whatsapp || "")},`);
    lines.push(`    ligaCartola: ${JSON.stringify(state.links.ligaCartola || "")}`);
    lines.push(`  },`);
    lines.push(`  premiacao: {`);
    ["campeonato", "turno1", "turno2"].forEach((chave, i, arr) => {
      const obj = state.premiacao[chave] || {};
      const inner = Object.entries(obj)
        .sort((a, b) => Number(a[0]) - Number(b[0]))
        .map(([k, v]) => `"${k}": ${Number(v)}`)
        .join(", ");
      const sep = i < arr.length - 1 ? "," : "";
      lines.push(`    ${chave}: { ${inner} }${sep}`);
    });
    lines.push(`  },`);
    lines.push(`  ganhadores: {`);
    ["campeonato", "turno1", "turno2"].forEach((chave, i, arr) => {
      const obj = (state.ganhadores && state.ganhadores[chave]) || {};
      const inner = Object.entries(obj)
        .filter(([, v]) => v)
        .sort((a, b) => Number(a[0]) - Number(b[0]))
        .map(([k, v]) => `"${k}": ${JSON.stringify(v)}`)
        .join(", ");
      const sep = i < arr.length - 1 ? "," : "";
      lines.push(`    ${chave}: { ${inner} }${sep}`);
    });
    lines.push(`  },`);
    lines.push(`  participantes: [`);
    state.participantes.forEach((p, i) => {
      const sep = i < state.participantes.length - 1 ? "," : "";
      const obj = {
        nome: p.nome || "",
        apelido: p.apelido || "",
        time: p.time || "",
        manager: p.manager || "",
        pago: Number(p.pago || 0)
      };
      lines.push(`    ${JSON.stringify(obj)}${sep}`);
    });
    lines.push(`  ]`);
    lines.push(`};`);
    lines.push("");
    return lines.join("\n");
  }

  function updatePreview() {
    document.getElementById("preview").value = serialize();
  }

  function toast(msg) {
    const t = document.getElementById("toast");
    t.textContent = msg;
    t.classList.add("show");
    clearTimeout(toast._t);
    toast._t = setTimeout(() => t.classList.remove("show"), 2000);
  }

  function onExportar() {
    const txt = serialize();
    navigator.clipboard.writeText(txt)
      .then(() => toast("data.js copiado!"))
      .catch(() => {
        const p = document.getElementById("preview");
        p.select();
        document.execCommand("copy");
        toast("data.js copiado!");
      });
  }

  function onBaixar() {
    const blob = new Blob([serialize()], { type: "application/javascript" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "data.js";
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }

  function onRecarregar() {
    if (!confirm("Descartar edições locais e recarregar do data.js?")) return;
    localStorage.removeItem(STORAGE_KEY);
    state = clone(DATA);
    fillForm();
    toast("Recarregado do data.js");
  }

  function onLimpar() {
    if (!confirm("Limpar rascunho local? (Os dados do data.js permanecem intactos)")) return;
    localStorage.removeItem(STORAGE_KEY);
    state = clone(DATA);
    fillForm();
    toast("Rascunho local limpo");
  }

  function bind() {
    document.querySelectorAll("#cfg-ano,#cfg-liga,#cfg-inscricao,#cfg-pix,#cfg-link-cartola,#cfg-link-whatsapp,#cfg-link-planilha,[id^='prem-']")
      .forEach(el => el.addEventListener("input", onFormInput));
    document.querySelectorAll("[id^='win-']").forEach(el => el.addEventListener("change", onFormInput));
    document.querySelector("#tabela-admin").addEventListener("input", onTableInput);
    document.querySelector("#tabela-admin").addEventListener("click", onTableClick);
    document.getElementById("btn-add").addEventListener("click", onAdd);
    document.getElementById("btn-exportar").addEventListener("click", onExportar);
    document.getElementById("btn-editar-github").addEventListener("click", function () {
      window.open("https://github.com/FabioCarlesso/cartola-garela-afc/edit/main/data.js", "_blank");
    });
    document.getElementById("btn-baixar").addEventListener("click", onBaixar);
    document.getElementById("btn-recarregar").addEventListener("click", onRecarregar);
    document.getElementById("btn-limpar").addEventListener("click", onLimpar);
  }

  function initTheme() {
    const btn = document.getElementById("btn-tema");
    const html = document.documentElement;
    const update = () => {
      btn.textContent = html.getAttribute("data-theme") === "dark" ? "☀️" : "🌙";
    };
    update();
    btn.addEventListener("click", () => {
      const dark = html.getAttribute("data-theme") === "dark";
      html.setAttribute("data-theme", dark ? "light" : "dark");
      localStorage.setItem("theme", dark ? "light" : "dark");
      update();
    });
  }

  function init() {
    state = loadState();
    fillForm();
    bind();
    initTheme();
  }

  document.addEventListener("DOMContentLoaded", init);
})();
