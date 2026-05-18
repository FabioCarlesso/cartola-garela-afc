(function () {
  const FONT = "system-ui, -apple-system, 'Segoe UI', Roboto, sans-serif";

  function fmtBRL(v) {
    return Number(v).toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
  }

  function fmtDate() {
    return new Date().toLocaleDateString("pt-BR");
  }

  function truncateText(ctx, text, maxW) {
    if (ctx.measureText(text).width <= maxW) return text;
    let t = text;
    while (t.length > 1 && ctx.measureText(t + "…").width > maxW) t = t.slice(0, -1);
    return t + "…";
  }

  function rrect(ctx, x, y, w, h, r) {
    if (ctx.roundRect) {
      ctx.roundRect(x, y, w, h, r);
    } else {
      ctx.moveTo(x + r, y);
      ctx.lineTo(x + w - r, y);
      ctx.quadraticCurveTo(x + w, y, x + w, y + r);
      ctx.lineTo(x + w, y + h - r);
      ctx.quadraticCurveTo(x + w, y + h, x + w - r, y + h);
      ctx.lineTo(x + r, y + h);
      ctx.quadraticCurveTo(x, y + h, x, y + h - r);
      ctx.lineTo(x, y + r);
      ctx.quadraticCurveTo(x, y, x + r, y);
      ctx.closePath();
    }
  }

  function exportarImagem() {
    const W = 800;
    const PAD = 28;
    const COL_GAP = 12;

    const C = {
      bg:        "#0f0f0f",
      surface:   "#1c1c1c",
      border:    "#2e2e2e",
      text:      "#f0f0ec",
      muted:     "#7a7a72",
      accent:    "#e8324e",
      gold:      "#f5a623",
      silver:    "#aaaaaa",
      bronze:    "#cd7c2e",
      green:     "#34c76b",
    };

    const blocos = [
      { titulo: "Campeonato", chave: "campeonato" },
      { titulo: "1º Turno",    chave: "turno1"      },
      { titulo: "2º Turno",    chave: "turno2"      },
    ];

    const maxEntries = Math.max(
      ...blocos.map(b => Object.keys(DATA.premiacao[b.chave] || {}).length)
    );

    // Measurements
    const ACCENT_H        = 4;
    const HEADER_H        = 88;
    const SEC_GAP         = 20;
    const SEC_LABEL_H     = 24;
    const BLK_PAD_V       = 14;
    const BLK_TITLE_H     = 24;
    const BLK_TITLE_GAP   = 8;
    const BLK_ROW_H       = 28;
    const BLK_BOTTOM_GAP  = 8;
    const TOTALS_H        = 70;
    const FOOTER_H        = 40;

    const prizeBlockH =
      BLK_PAD_V + BLK_TITLE_H + BLK_TITLE_GAP + 1 +
      maxEntries * BLK_ROW_H +
      BLK_BOTTOM_GAP + BLK_PAD_V;

    const totalArrecadado = DATA.participantes.reduce((s, p) => s + Number(p.pago || 0), 0);
    const totalEsperado   = DATA.participantes.length * DATA.inscricao;
    const pagos           = DATA.participantes.filter(p => Number(p.pago || 0) >= DATA.inscricao).length;
    const pct             = totalEsperado ? Math.round((totalArrecadado / totalEsperado) * 100) : 0;

    const H =
      ACCENT_H + HEADER_H +
      SEC_GAP + SEC_LABEL_H + prizeBlockH +
      SEC_GAP + SEC_LABEL_H + TOTALS_H +
      SEC_GAP + 1 + FOOTER_H;

    const canvas = document.createElement("canvas");
    canvas.width  = W;
    canvas.height = H;
    const ctx = canvas.getContext("2d");

    let y = 0;

    // Background
    ctx.fillStyle = C.bg;
    ctx.fillRect(0, 0, W, H);

    // Accent stripe
    ctx.fillStyle = C.accent;
    ctx.fillRect(0, 0, W, ACCENT_H);
    y += ACCENT_H;

    // ── Header ──────────────────────────────────────────────────────
    ctx.fillStyle = C.surface;
    ctx.fillRect(0, y, W, HEADER_H);

    const hMid = y + HEADER_H / 2;

    ctx.fillStyle = C.text;
    ctx.font = `bold 24px ${FONT}`;
    ctx.textAlign = "left";
    ctx.textBaseline = "middle";
    ctx.fillText(DATA.liga, PAD, hMid - 13);

    ctx.fillStyle = C.muted;
    ctx.font = `15px ${FONT}`;
    ctx.fillText(`Temporada ${DATA.ano}`, PAD, hMid + 14);

    // Badge
    const BW = 112, BH = 40;
    const bx = W - PAD - BW, by = hMid - BH / 2;
    ctx.fillStyle = C.accent;
    ctx.beginPath(); rrect(ctx, bx, by, BW, BH, 6); ctx.fill();
    ctx.fillStyle = "#ffffff";
    ctx.font = `bold 11px ${FONT}`;
    ctx.textAlign = "center";
    ctx.fillText("RESULTADO", bx + BW / 2, by + 14);
    ctx.fillText("FINAL",     bx + BW / 2, by + 28);

    y += HEADER_H;

    // ── Premiação ─────────────────────────────────────────────────────
    y += SEC_GAP;

    ctx.fillStyle = C.muted;
    ctx.font = `600 10px ${FONT}`;
    ctx.textAlign = "left";
    ctx.textBaseline = "alphabetic";
    ctx.fillText("PREMIAÇÃO", PAD, y + 12);
    y += SEC_LABEL_H;

    const colW = Math.floor((W - PAD * 2 - COL_GAP * 2) / 3);
    const prizeStartY = y;

    blocos.forEach((bloco, col) => {
      const colocacoes = DATA.premiacao[bloco.chave] || {};
      const ganhadores = (DATA.ganhadores && DATA.ganhadores[bloco.chave]) || {};
      const entries    = Object.entries(colocacoes).sort((a, b) => Number(a[0]) - Number(b[0]));
      const total      = entries.reduce((s, [, v]) => s + Number(v || 0), 0);

      const cx = PAD + col * (colW + COL_GAP);
      let   cy = prizeStartY;

      ctx.fillStyle = C.surface;
      ctx.beginPath(); rrect(ctx, cx, cy, colW, prizeBlockH, 8); ctx.fill();
      ctx.strokeStyle = C.border; ctx.lineWidth = 1;
      ctx.beginPath(); rrect(ctx, cx, cy, colW, prizeBlockH, 8); ctx.stroke();

      cy += BLK_PAD_V;
      const titleMid = cy + BLK_TITLE_H / 2;

      ctx.fillStyle = C.text;
      ctx.font = `bold 13px ${FONT}`;
      ctx.textAlign = "left";
      ctx.textBaseline = "middle";
      ctx.fillText(bloco.titulo, cx + 14, titleMid);

      ctx.fillStyle = C.muted;
      ctx.font = `12px ${FONT}`;
      ctx.textAlign = "right";
      ctx.fillText(fmtBRL(total), cx + colW - 14, titleMid);

      cy += BLK_TITLE_H + BLK_TITLE_GAP;
      ctx.fillStyle = C.border;
      ctx.fillRect(cx + 14, cy, colW - 28, 1);
      cy += 1;

      const posColors = { "1": C.gold, "2": C.silver, "3": C.bronze };

      entries.forEach(([pos, valor]) => {
        const rowMid = cy + BLK_ROW_H / 2;
        const nome   = ganhadores[pos] || "—";

        // Position circle
        ctx.fillStyle = posColors[pos] || C.muted;
        ctx.beginPath();
        ctx.arc(cx + 22, rowMid, 9, 0, Math.PI * 2);
        ctx.fill();

        ctx.fillStyle = "#000";
        ctx.font = `bold 9px ${FONT}`;
        ctx.textAlign = "center";
        ctx.textBaseline = "middle";
        ctx.fillText(pos + "º", cx + 22, rowMid);

        // Name
        ctx.fillStyle = nome !== "—" ? C.text : C.muted;
        ctx.font = `${nome !== "—" ? "500" : "400"} 12px ${FONT}`;
        ctx.textAlign = "left";
        const nameMaxW = colW - 96;
        ctx.fillText(truncateText(ctx, nome, nameMaxW), cx + 38, rowMid);

        // Value
        ctx.fillStyle = C.accent;
        ctx.font = `bold 12px ${FONT}`;
        ctx.textAlign = "right";
        ctx.fillText(fmtBRL(Number(valor)), cx + colW - 14, rowMid);

        cy += BLK_ROW_H;
      });
    });

    y = prizeStartY + prizeBlockH;

    // ── Arrecadação ──────────────────────────────────────────────────
    y += SEC_GAP;

    ctx.fillStyle = C.muted;
    ctx.font = `600 10px ${FONT}`;
    ctx.textAlign = "left";
    ctx.textBaseline = "alphabetic";
    ctx.fillText("ARRECADAÇÃO", PAD, y + 12);
    y += SEC_LABEL_H;

    ctx.fillStyle = C.surface;
    ctx.beginPath(); rrect(ctx, PAD, y, W - PAD * 2, TOTALS_H, 8); ctx.fill();
    ctx.strokeStyle = C.border; ctx.lineWidth = 1;
    ctx.beginPath(); rrect(ctx, PAD, y, W - PAD * 2, TOTALS_H, 8); ctx.stroke();

    const items = [
      { label: "Arrecadado", value: fmtBRL(totalArrecadado), color: C.green  },
      { label: "Esperado",   value: fmtBRL(totalEsperado),   color: C.text   },
      { label: "Pagos",      value: `${pagos} / ${DATA.participantes.length}`, color: C.text },
      { label: "Progresso",  value: `${pct}%`, color: pct >= 100 ? C.green : C.text },
    ];

    const itemW  = (W - PAD * 2) / items.length;
    const midTot = y + TOTALS_H / 2;

    items.forEach((item, i) => {
      const ix = PAD + i * itemW + itemW / 2;

      ctx.fillStyle = C.muted;
      ctx.font = `10px ${FONT}`;
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      ctx.fillText(item.label.toUpperCase(), ix, midTot - 15);

      ctx.fillStyle = item.color;
      ctx.font = `bold 18px ${FONT}`;
      ctx.fillText(item.value, ix, midTot + 11);

      if (i < items.length - 1) {
        ctx.fillStyle = C.border;
        ctx.fillRect(PAD + (i + 1) * itemW, y + 10, 1, TOTALS_H - 20);
      }
    });

    y += TOTALS_H;

    // ── Footer ──────────────────────────────────────────────────────
    y += SEC_GAP;
    ctx.fillStyle = C.border;
    ctx.fillRect(0, y, W, 1);
    y += 1;

    const footMid = y + FOOTER_H / 2;
    ctx.textBaseline = "middle";

    ctx.fillStyle = C.muted;
    ctx.font = `11px ${FONT}`;
    ctx.textAlign = "left";
    ctx.fillText(`Gerado em ${fmtDate()}`, PAD, footMid);

    ctx.fillStyle = C.accent;
    ctx.font = `bold 12px ${FONT}`;
    ctx.textAlign = "right";
    ctx.fillText(DATA.liga, W - PAD, footMid);

    // Download
    canvas.toBlob(blob => {
      const url  = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.download = `resultado-${DATA.liga.replace(/[^\w]/g, "-")}-${DATA.ano}.png`;
      link.href = url;
      link.click();
      setTimeout(() => URL.revokeObjectURL(url), 15000);
    }, "image/png");
  }

  window.exportarImagem = exportarImagem;
})();
