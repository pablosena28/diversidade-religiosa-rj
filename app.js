(() => {
  "use strict";

  const DATA_URL = "data/municipios.json";
  const state = { dataset: null, groupsById: new Map() };

  const dom = {
    dataStatus: document.querySelector("#dataStatus"), dataBadge: document.querySelector("#dataBadge"), dataStatusText: document.querySelector("#dataStatusText"),
    municipalitySelect: document.querySelector("#municipalitySelect"), diversityValue: document.querySelector("#diversityValue"), dominantValue: document.querySelector("#dominantValue"), dominantShare: document.querySelector("#dominantShare"), marginValue: document.querySelector("#marginValue"), totalValue: document.querySelector("#totalValue"), compositionTitle: document.querySelector("#compositionTitle"), compositionChart: document.querySelector("#compositionChart"),
    compareA: document.querySelector("#compareA"), compareB: document.querySelector("#compareB"), compareAHeader: document.querySelector("#compareAHeader"), compareBHeader: document.querySelector("#compareBHeader"), comparisonWinner: document.querySelector("#comparisonWinner"), comparisonDifference: document.querySelector("#comparisonDifference"), comparisonBody: document.querySelector("#comparisonBody"),
    rankingSearch: document.querySelector("#rankingSearch"), rankingBody: document.querySelector("#rankingBody"),
    methodDialog: document.querySelector("#methodDialog"), methodButton: document.querySelector("#methodButton"), closeMethodButton: document.querySelector("#closeMethodButton")
  };

  const numberFormatter = new Intl.NumberFormat("pt-BR", { maximumFractionDigits: 0 });
  const percentFormatter = new Intl.NumberFormat("pt-BR", { style: "percent", minimumFractionDigits: 1, maximumFractionDigits: 1 });
  const formatIndex = value => Number(value).toLocaleString("pt-BR", { minimumFractionDigits: 3, maximumFractionDigits: 3 });
  const formatPP = value => `${(value * 100).toLocaleString("pt-BR", { minimumFractionDigits: 1, maximumFractionDigits: 1 })} p.p.`;
  const groupLabel = id => state.groupsById.get(id)?.label ?? id ?? "—";
  const getMunicipality = code => state.dataset.municipios.find(item => item.codigo_ibge === code);

  function setDataStatus(metadata) {
    const demo = Boolean(metadata.demo);
    dom.dataStatus.classList.toggle("official", !demo);
    dom.dataStatus.classList.remove("error");
    dom.dataBadge.textContent = demo ? "Dados demonstrativos" : "Dados de produção";
    dom.dataStatusText.textContent = demo
      ? "Os valores exibidos são fictícios e servem apenas para validar a interface. Substitua o CSV de demonstração pelo arquivo oficial antes de divulgar resultados."
      : `${metadata.source_label || "Fonte informada no arquivo de dados"} • ${metadata.year || ""}`;
  }

  function fillSelect(select, records) {
    select.innerHTML = records.map(item => `<option value="${item.codigo_ibge}">${item.municipio}</option>`).join("");
  }

  function renderProfile(code) {
    const item = getMunicipality(code);
    if (!item) return;
    const dominantShare = item.shares[item.dominant] ?? 0;
    dom.diversityValue.textContent = formatIndex(item.diversity_index);
    dom.dominantValue.textContent = groupLabel(item.dominant);
    dom.dominantShare.textContent = percentFormatter.format(dominantShare);
    dom.marginValue.textContent = formatPP(item.margin);
    dom.totalValue.textContent = numberFormatter.format(item.total_classificado);
    dom.compositionTitle.textContent = `Composição — ${item.municipio}`;

    const rows = state.dataset.groups
      .map(group => ({ ...group, share: item.shares[group.id] ?? 0 }))
      .sort((a, b) => b.share - a.share);

    dom.compositionChart.innerHTML = rows.map(group => `
      <div class="bar-row">
        <span class="bar-label">${group.label}</span>
        <div class="bar-track" aria-hidden="true"><div class="bar-fill" style="width:${Math.max(group.share * 100, .5)}%"></div></div>
        <span class="bar-value">${percentFormatter.format(group.share)}</span>
      </div>`).join("");
  }

  function renderComparison() {
    const a = getMunicipality(dom.compareA.value), b = getMunicipality(dom.compareB.value);
    if (!a || !b) return;
    dom.compareAHeader.textContent = a.municipio;
    dom.compareBHeader.textContent = b.municipio;
    const deltaIndex = Math.abs(a.diversity_index - b.diversity_index);
    if (deltaIndex < .0005) {
      dom.comparisonWinner.textContent = "Índices equivalentes";
      dom.comparisonDifference.textContent = "A diferença é inferior a 0,001.";
    } else {
      const winner = a.diversity_index > b.diversity_index ? a : b;
      dom.comparisonWinner.textContent = winner.municipio;
      dom.comparisonDifference.textContent = `Diferença de ${formatIndex(deltaIndex)} ponto no índice.`;
    }
    dom.comparisonBody.innerHTML = state.dataset.groups.map(group => {
      const shareA = a.shares[group.id] ?? 0, shareB = b.shares[group.id] ?? 0, diff = shareA - shareB;
      return `<tr><td>${group.label}</td><td class="numeric">${percentFormatter.format(shareA)}</td><td class="numeric">${percentFormatter.format(shareB)}</td><td class="numeric">${diff > 0 ? "+" : ""}${formatPP(diff)}</td></tr>`;
    }).join("");
  }

  function renderRanking(query = "") {
    const q = query.trim().toLocaleLowerCase("pt-BR");
    const ranking = [...state.dataset.municipios]
      .sort((a, b) => b.diversity_index - a.diversity_index)
      .map((item, index) => ({ ...item, position: index + 1 }))
      .filter(item => item.municipio.toLocaleLowerCase("pt-BR").includes(q));
    dom.rankingBody.innerHTML = ranking.length ? ranking.map(item => `
      <tr><td><span class="rank-number">${item.position}</span></td><td>${item.municipio}</td><td><span class="index-pill">${formatIndex(item.diversity_index)}</span></td><td>${groupLabel(item.dominant)}</td><td class="numeric">${formatPP(item.margin)}</td></tr>`).join("")
      : `<tr><td colspan="5">Nenhum município encontrado.</td></tr>`;
  }

  function openMethod() { dom.methodDialog.showModal(); document.body.classList.add("dialog-open"); }
  function closeMethod() { if (dom.methodDialog.open) dom.methodDialog.close(); document.body.classList.remove("dialog-open"); }

  function configureEvents() {
    dom.municipalitySelect.addEventListener("change", e => renderProfile(e.currentTarget.value));
    dom.compareA.addEventListener("change", renderComparison);
    dom.compareB.addEventListener("change", renderComparison);
    dom.rankingSearch.addEventListener("input", e => renderRanking(e.currentTarget.value));
    dom.methodButton.addEventListener("click", openMethod);
    document.querySelectorAll("[data-open-method]").forEach(button => button.addEventListener("click", openMethod));
    dom.closeMethodButton.addEventListener("click", closeMethod);
    dom.methodDialog.addEventListener("close", () => document.body.classList.remove("dialog-open"));
    dom.methodDialog.addEventListener("click", event => {
      const rect = dom.methodDialog.getBoundingClientRect();
      if (event.clientX < rect.left || event.clientX > rect.right || event.clientY < rect.top || event.clientY > rect.bottom) closeMethod();
    });
  }

  async function loadDataset() {
    try {
      const response = await fetch(DATA_URL);
      if (!response.ok) throw new Error(`HTTP ${response.status}`);
      const dataset = await response.json();
      if (!dataset || !Array.isArray(dataset.groups) || !Array.isArray(dataset.municipios) || !dataset.municipios.length) throw new Error("Estrutura de dados inválida.");
      state.dataset = dataset;
      state.groupsById = new Map(dataset.groups.map(group => [group.id, group]));
      setDataStatus(dataset.metadata || {});
      [dom.municipalitySelect, dom.compareA, dom.compareB].forEach(select => fillSelect(select, dataset.municipios));
      const first = dataset.municipios[0], second = dataset.municipios[1] ?? first;
      dom.municipalitySelect.value = first.codigo_ibge;
      dom.compareA.value = first.codigo_ibge;
      dom.compareB.value = second.codigo_ibge;
      renderProfile(first.codigo_ibge); renderComparison(); renderRanking();
    } catch (error) {
      console.error("Falha ao carregar o dataset:", error);
      dom.dataStatus.classList.add("error"); dom.dataBadge.textContent = "Erro de dados";
      dom.dataStatusText.textContent = "Não foi possível carregar data/municipios.json. Execute o projeto em um servidor local: python -m http.server 8000.";
      dom.compositionChart.innerHTML = '<p class="error-message">O painel precisa do arquivo JSON para funcionar.</p>';
    }
  }

  configureEvents();
  loadDataset();
})();
