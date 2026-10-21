/* ==========================================================================
   Мои финансы — логика приложения
   Модули в одном файле: хранение, периоды, расчёты, графики, бюджет,
   операции (добавление / правка / удаление), экспорт и импорт.
   ========================================================================== */
(() => {
  "use strict";

  /* ---------- Константы и справочники ---------- */
  const KEYS = {
    transactions: "personal-expenses-v1", // тот же ключ, что и в первой версии — старые данные сохраняются
    budget: "personal-expenses-budget-v1",
    theme: "personal-expenses-theme-v1",
    period: "personal-expenses-period-v1"
  };

  const CATEGORIES = {
    expense: [
      { name: "Продукты", emoji: "🛒", color: "#5b8def" },
      { name: "Транспорт", emoji: "🚌", color: "#f5a524" },
      { name: "Жильё", emoji: "🏠", color: "#8b5cf6" },
      { name: "Здоровье", emoji: "💊", color: "#ef6f8a" },
      { name: "Развлечения", emoji: "🎬", color: "#ec6ccf" },
      { name: "Покупки", emoji: "🛍️", color: "#2fb9a3" },
      { name: "Образование", emoji: "📚", color: "#4cc2ff" },
      { name: "Связь", emoji: "📱", color: "#9aa5ff" },
      { name: "Другое", emoji: "✨", color: "#8d94b0" }
    ],
    income: [
      { name: "Зарплата", emoji: "💼", color: "#0f9d70" },
      { name: "Подработка", emoji: "⚡", color: "#2fb9a3" },
      { name: "Подарок", emoji: "🎁", color: "#ec6ccf" },
      { name: "Стипендия", emoji: "🎓", color: "#5b8def" },
      { name: "Инвестиции", emoji: "📈", color: "#f5a524" },
      { name: "Другое", emoji: "✨", color: "#8d94b0" }
    ]
  };

  const CATEGORY_META = {};
  Object.values(CATEGORIES).flat().forEach(c => { if (!CATEGORY_META[c.name]) CATEGORY_META[c.name] = c; });
  const metaOf = name => CATEGORY_META[name] || { name, emoji: "•", color: "#8d94b0" };
  const categoryNames = type => CATEGORIES[type].map(c => c.name);

  const LIMITS = { description: 70, amount: 1000000000 };
  const PAGE_SIZE = 10;
  const PERIODS = ["week", "month", "year", "all"];
  const PREV_LABEL = { week: "прошлой неделей", month: "прошлым месяцем", year: "прошлым годом" };

  const TIPS = [
    "Записывайте расходы сразу — так бюджет получается точнее.",
    "Откладывайте 10–20% дохода в начале месяца, а не в конце.",
    "Сравнивайте месяцы: график покажет, где траты растут.",
    "Крупную покупку лучше отложить на 2–3 дня — желание часто проходит.",
    "Задайте лимит на месяц: это самый простой способ не выйти из бюджета.",
    "Небольшие регулярные траты за год складываются в заметную сумму."
  ];

  /* ---------- Вспомогательные функции ---------- */
  const $ = selector => document.querySelector(selector);
  const $$ = selector => Array.from(document.querySelectorAll(selector));
  const reduceMotion = typeof window.matchMedia === "function" && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const pad = n => String(n).padStart(2, "0");
  const iso = d => `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
  const parseISO = s => { const [y, m, d] = s.split("-").map(Number); return new Date(y, m - 1, d); };
  const todayISO = () => iso(new Date());
  const isValidDate = s => typeof s === "string" && /^\d{4}-\d{2}-\d{2}$/.test(s) && iso(parseISO(s)) === s;
  const sumBy = (list, type) => list.reduce((sum, t) => t.type === type ? sum + t.amount : sum, 0);
  const capitalize = s => s.charAt(0).toUpperCase() + s.slice(1);
  const newId = () => `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;

  function safeText(value) {
    return String(value).replace(/[&<>"']/g, ch => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[ch]));
  }

  function money(value) {
    const n = Math.round(value);
    return (n < 0 ? "−" : "") + new Intl.NumberFormat("ru-RU", { maximumFractionDigits: 0 }).format(Math.abs(n)) + " ₸";
  }

  function signedMoney(value) {
    return (value > 0 ? "+" : "") + money(value);
  }

  function compact(v) {
    if (v >= 1e6) return (v / 1e6).toFixed(1).replace(".", ",").replace(",0", "") + " млн";
    if (v >= 1e3) return Math.round(v / 1e3) + " тыс";
    return String(Math.round(v));
  }

  function niceMax(v) {
    if (!(v > 0)) return 1000;
    const exp = Math.pow(10, Math.floor(Math.log10(v)));
    const f = v / exp;
    const nf = f <= 1 ? 1 : f <= 2 ? 2 : f <= 4 ? 4 : f <= 8 ? 8 : 10;
    return nf * exp;
  }

  function formatDate(dateString) {
    const [y, m, d] = dateString.split("-");
    return `${d}.${m}.${y}`;
  }

  function dayLabel(dateStr) {
    const now = new Date();
    if (dateStr === iso(now)) return "Сегодня";
    const yesterday = new Date(now.getFullYear(), now.getMonth(), now.getDate() - 1);
    if (dateStr === iso(yesterday)) return "Вчера";
    const d = parseISO(dateStr);
    const opts = { day: "numeric", month: "long" };
    if (d.getFullYear() !== now.getFullYear()) opts.year = "numeric";
    return `${d.toLocaleDateString("ru-RU", opts)} · ${d.toLocaleDateString("ru-RU", { weekday: "long" })}`;
  }

  function icon(id) {
    return `<svg class="ico" aria-hidden="true"><use href="#i-${id}"/></svg>`;
  }

  /* ---------- Хранилище ---------- */
  function isValidTransaction(item) {
    return item && typeof item === "object" &&
      typeof item.id === "string" && item.id &&
      (item.type === "income" || item.type === "expense") &&
      typeof item.description === "string" &&
      Number.isFinite(item.amount) && item.amount > 0 &&
      typeof item.category === "string" &&
      isValidDate(item.date);
  }

  function readJSON(key, fallback) {
    try {
      const raw = localStorage.getItem(key);
      return raw === null ? fallback : JSON.parse(raw);
    } catch (error) {
      return fallback;
    }
  }

  function loadTransactions() {
    const stored = readJSON(KEYS.transactions, []);
    return Array.isArray(stored) ? stored.filter(isValidTransaction) : [];
  }

  function loadBudget() {
    const value = readJSON(KEYS.budget, null);
    return Number.isInteger(value) && value > 0 && value <= LIMITS.amount ? value : null;
  }

  function writeStorage(key, value) {
    try {
      if (value === null) localStorage.removeItem(key);
      else localStorage.setItem(key, typeof value === "string" ? value : JSON.stringify(value));
      return true;
    } catch (error) {
      showToast("Не удалось сохранить данные. Проверьте настройки браузера.");
      return false;
    }
  }

  const saveTransactions = () => writeStorage(KEYS.transactions, transactions);
  const saveBudget = () => writeStorage(KEYS.budget, budget);

  /* ---------- Состояние ---------- */
  let transactions = loadTransactions();
  let budget = loadBudget();
  let period = (() => { try { const p = localStorage.getItem(KEYS.period); return PERIODS.includes(p) ? p : "month"; } catch (e) { return "month"; } })();
  let showAll = false;
  let editingId = null;
  let toastTimer;
  let dynamicsData = [];
  let dynamicsWidth = 0;
  let dynamicsHeight = 0;

  const form = $("#transactionForm");
  const dialog = $("#transactionDialog");

  /* ---------- Периоды ---------- */
  function getRange(p, offset = 0) {
    const now = new Date();
    const t = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    if (p === "week") {
      const to = new Date(t.getFullYear(), t.getMonth(), t.getDate() - 7 * offset);
      const from = new Date(to.getFullYear(), to.getMonth(), to.getDate() - 6);
      return { from: iso(from), to: iso(to) };
    }
    if (p === "month") {
      return { from: iso(new Date(t.getFullYear(), t.getMonth() - offset, 1)), to: iso(new Date(t.getFullYear(), t.getMonth() - offset + 1, 0)) };
    }
    if (p === "year") {
      const y = t.getFullYear() - offset;
      return { from: `${y}-01-01`, to: `${y}-12-31` };
    }
    return null;
  }

  const inRange = (t, range) => !range || (t.date >= range.from && t.date <= range.to);
  const periodTransactions = (offset = 0) => { const r = getRange(period, offset); return transactions.filter(t => inRange(t, r)); };

  function periodTitle() {
    const now = new Date();
    if (period === "month") return capitalize(now.toLocaleDateString("ru-RU", { month: "long", year: "numeric" }).replace(/\s?г\.$/, ""));
    if (period === "year") return `${now.getFullYear()} год`;
    if (period === "week") {
      const r = getRange("week");
      const f = d => parseISO(d).toLocaleDateString("ru-RU", { day: "numeric", month: "short" }).replace(".", "");
      return `Последние 7 дней: ${f(r.from)} – ${f(r.to)}`;
    }
    return "За всё время";
  }

  /* ---------- Анимированные числа ---------- */
  function animateMoney(el, to, formatter = money) {
    const from = typeof el._value === "number" ? el._value : 0;
    el._value = to;
    if (el._raf && typeof cancelAnimationFrame === "function") cancelAnimationFrame(el._raf);
    if (reduceMotion || from === to || typeof requestAnimationFrame !== "function") {
      el.textContent = formatter(to);
      return;
    }
    const start = performance.now();
    const duration = 550;
    const step = now => {
      const p = Math.min(1, (now - start) / duration);
      const eased = 1 - Math.pow(1 - p, 3);
      el.textContent = formatter(Math.round(from + (to - from) * eased));
      if (p < 1) el._raf = requestAnimationFrame(step);
      else el.textContent = formatter(to);
    };
    el._raf = requestAnimationFrame(step);
  }

  /* ---------- Сводка ---------- */
  function setDelta(el, current, previous, kind) {
    el.className = "delta";
    if (period === "all") { el.textContent = "За всё время"; return; }
    if (!previous) {
      el.textContent = current ? "Нет данных за прошлый период" : "Нет операций";
      return;
    }
    const pct = Math.round((current - previous) / previous * 100);
    if (pct === 0) { el.textContent = `Без изменений к ${PREV_LABEL[period]}`; return; }
    const good = kind === "income" ? pct > 0 : pct < 0;
    el.classList.add(good ? "good" : "bad");
    el.textContent = `${pct > 0 ? "↑" : "↓"} ${Math.abs(pct)}% к ${PREV_LABEL[period]}`;
  }

  function renderSummary() {
    const all = transactions;
    const current = periodTransactions();
    const income = sumBy(current, "income");
    const expense = sumBy(current, "expense");
    const total = sumBy(all, "income") - sumBy(all, "expense");

    animateMoney($("#balanceValue"), total);
    $("#balanceFoot").textContent = period === "all" ? "Доходы минус расходы за всё время" : `За период: ${signedMoney(income - expense)}`;
    animateMoney($("#incomeValue"), income);
    animateMoney($("#expenseValue"), expense);

    if (period === "all") {
      setDelta($("#incomeDelta"), income, 0, "income");
      setDelta($("#expenseDelta"), expense, 0, "expense");
    } else {
      const prev = periodTransactions(1);
      setDelta($("#incomeDelta"), income, sumBy(prev, "income"), "income");
      setDelta($("#expenseDelta"), expense, sumBy(prev, "expense"), "expense");
    }

    const savings = $("#savingsValue");
    const foot = $("#savingsFoot");
    if (income > 0) {
      const rate = Math.round((income - expense) / income * 100);
      savings.textContent = `${rate}%`;
      foot.textContent = rate >= 20 ? "Отличный результат" : rate >= 0 ? "Есть куда расти" : "Расходы превышают доходы";
    } else {
      savings.textContent = "—";
      foot.textContent = "Нет доходов за период";
    }
  }

  function renderSparkline() {
    const host = $("#heroSpark");
    if (!host) return;
    const DAYS = 30;
    const now = new Date();
    const keys = [];
    for (let k = DAYS - 1; k >= 0; k--) keys.push(iso(new Date(now.getFullYear(), now.getMonth(), now.getDate() - k)));
    let running = 0;
    const net = new Map();
    transactions.forEach(t => {
      const v = t.type === "income" ? t.amount : -t.amount;
      if (t.date < keys[0]) running += v;
      else net.set(t.date, (net.get(t.date) || 0) + v);
    });
    const series = keys.map(k => (running += net.get(k) || 0));
    const min = Math.min(...series);
    const max = Math.max(...series);
    if (!transactions.length || min === max) { host.innerHTML = ""; return; }
    const W = 220, H = 64, pad2 = 6;
    const x = i => pad2 + (W - pad2 * 2) * i / (series.length - 1);
    const y = v => pad2 + (H - pad2 * 2) * (1 - (v - min) / (max - min));
    const pts = series.map((v, i) => [x(i), y(v)]);
    let line = `M${pts[0][0].toFixed(1)},${pts[0][1].toFixed(1)}`;
    for (let i = 1; i < pts.length; i++) {
      const [x0, y0] = pts[i - 1];
      const [x1, y1] = pts[i];
      const mx = ((x0 + x1) / 2).toFixed(1);
      line += `C${mx},${y0.toFixed(1)} ${mx},${y1.toFixed(1)} ${x1.toFixed(1)},${y1.toFixed(1)}`; // плавные ступени
    }
    const last = series.length - 1;
    host.innerHTML = `<svg viewBox="0 0 ${W} ${H}" preserveAspectRatio="none" aria-hidden="true">
      <defs><linearGradient id="gSpark" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#fff" stop-opacity=".35"/><stop offset="1" stop-color="#fff" stop-opacity="0"/></linearGradient></defs>
      <path d="${line}L${x(last)},${H}L${x(0)},${H}Z" fill="url(#gSpark)"/>
      <path class="spark-line" d="${line}" fill="none" stroke="#fff" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" vector-effect="non-scaling-stroke"/>
    </svg><span class="spark-dot" style="left:${(x(last) / W * 100).toFixed(2)}%;top:${(y(series[last]) / H * 100).toFixed(2)}%"></span><span class="spark-cap">30 дней</span>`;
  }

  /* ---------- График по месяцам ---------- */
  function lastMonths(count) {
    const now = new Date();
    const result = [];
    for (let k = count - 1; k >= 0; k--) {
      const d = new Date(now.getFullYear(), now.getMonth() - k, 1);
      result.push({
        key: `${d.getFullYear()}-${pad(d.getMonth() + 1)}`,
        short: d.toLocaleDateString("ru-RU", { month: "short" }).replace(".", ""),
        long: capitalize(d.toLocaleDateString("ru-RU", { month: "long", year: "numeric" }).replace(/\s?г\.$/, "")),
        current: k === 0
      });
    }
    return result;
  }

  function barPath(x, y, w, h, r) {
    const rr = Math.min(r, w / 2, h);
    return `M${x},${y + h}V${y + rr}Q${x},${y} ${x + rr},${y}H${x + w - rr}Q${x + w},${y} ${x + w},${y + rr}V${y + h}Z`;
  }

  function renderDynamics(animate = true) {
    const box = $("#dynamicsChart");
    box.classList.toggle("no-anim", !animate);
    const W = Math.max(300, Math.round(box.clientWidth) || 600);
    const H = Math.max(270, Math.round(box.clientHeight) || 270);
    dynamicsWidth = W;
    dynamicsHeight = H;
    const m = { l: 48, r: 6, t: 14, b: 30 };
    const months = lastMonths(6);
    const data = months.map(x => ({ ...x, income: 0, expense: 0 }));
    const index = new Map(data.map((d, i) => [d.key, i]));
    transactions.forEach(t => {
      const i = index.get(t.date.slice(0, 7));
      if (i !== undefined) data[i][t.type] += t.amount;
    });
    dynamicsData = data;

    const hasData = data.some(d => d.income || d.expense);
    const max = niceMax(Math.max(...data.flatMap(d => [d.income, d.expense])));
    const pw = W - m.l - m.r;
    const ph = H - m.t - m.b;
    const gw = pw / data.length;
    const bw = Math.max(8, Math.min(26, gw * 0.26));
    const gap = Math.max(3, bw * 0.18);
    const y = v => m.t + ph - (v / max) * ph;

    let grid = "";
    for (let i = 0; i <= 4; i++) {
      const v = max * i / 4;
      grid += `<line x1="${m.l}" x2="${W - m.r}" y1="${y(v)}" y2="${y(v)}" ${i === 0 ? "" : 'stroke-dasharray="3 5"'}/><text x="${m.l - 10}" y="${y(v) + 4}" text-anchor="end">${compact(v)}</text>`;
    }

    let bars = "";
    let labels = "";
    data.forEach((d, i) => {
      const cx = m.l + gw * i + gw / 2;
      const hi = d.income ? Math.max(3, d.income / max * ph) : 0;
      const he = d.expense ? Math.max(3, d.expense / max * ph) : 0;
      const delay = i * 60;
      bars += `<g class="bar-group" data-i="${i}">
        ${d.current ? `<rect class="month-band" x="${m.l + gw * i + 4}" y="${m.t - 6}" width="${gw - 8}" height="${ph + 12}" rx="14"/>` : ""}
        <rect class="chart-hit" x="${m.l + gw * i}" y="${m.t}" width="${gw}" height="${ph}"/>
        ${hi ? `<path class="bar bar-income" d="${barPath(cx - bw - gap / 2, m.t + ph - hi, bw, hi, 7)}" style="animation-delay:${delay}ms"/>` : ""}
        ${he ? `<path class="bar bar-expense" d="${barPath(cx + gap / 2, m.t + ph - he, bw, he, 7)}" style="animation-delay:${delay + 40}ms"/>` : ""}
      </g>`;
      labels += `<text x="${cx}" y="${H - 8}" text-anchor="middle" class="${d.current ? "is-current" : ""}">${safeText(d.short)}</text>`;
    });

    const empty = hasData ? "" : `<text x="${W / 2}" y="${m.t + ph / 2}" text-anchor="middle" style="fill:var(--muted);font:500 13px var(--font)">Добавьте операции, чтобы увидеть динамику</text>`;

    box.innerHTML = `<svg viewBox="0 0 ${W} ${H}" aria-hidden="true">
      <defs>
        <linearGradient id="gInc" x1="0" y1="0" x2="0" y2="1"><stop offset="0" style="stop-color:var(--green)"/><stop offset="1" style="stop-color:var(--green);stop-opacity:.45"/></linearGradient>
        <linearGradient id="gExp" x1="0" y1="0" x2="0" y2="1"><stop offset="0" style="stop-color:var(--red)"/><stop offset="1" style="stop-color:var(--red);stop-opacity:.45"/></linearGradient>
      </defs>
      <g class="chart-grid">${grid}</g>${bars}<g class="chart-x">${labels}</g>${empty}</svg><div class="chart-tip" id="chartTip"></div>`;

    box.setAttribute("aria-label", "Доходы и расходы по месяцам. " + data.map(d => `${d.long}: доходы ${money(d.income)}, расходы ${money(d.expense)}`).join("; "));
  }

  function bindDynamicsTooltip() {
    const box = $("#dynamicsChart");
    const show = event => {
      const group = event.target.closest(".bar-group");
      const tip = $("#chartTip");
      if (!group || !tip) return hide();
      const d = dynamicsData[Number(group.dataset.i)];
      if (!d) return hide();
      tip.innerHTML = `<b>${safeText(d.long)}</b><div><i style="background:var(--green)"></i>Доходы: ${money(d.income)}</div><div><i style="background:var(--red)"></i>Расходы: ${money(d.expense)}</div>`;
      const rect = box.getBoundingClientRect();
      const x = Math.min(Math.max(event.clientX - rect.left, 70), rect.width - 70);
      tip.style.left = `${x}px`;
      tip.style.top = `${event.clientY - rect.top - 10}px`;
      tip.classList.add("show");
    };
    const hide = () => { const tip = $("#chartTip"); if (tip) tip.classList.remove("show"); };
    box.addEventListener("pointermove", show);
    box.addEventListener("pointerdown", show);
    box.addEventListener("pointerleave", hide);
  }

  /* ---------- Кольцевая диаграмма ---------- */
  function renderDonut() {
    const expenses = periodTransactions().filter(t => t.type === "expense");
    const total = expenses.reduce((s, t) => s + t.amount, 0);
    const totals = {};
    expenses.forEach(t => { totals[t.category] = (totals[t.category] || 0) + t.amount; });
    const sorted = Object.entries(totals).sort((a, b) => b[1] - a[1]);

    const shortPeriod = { week: "7 дней", month: capitalize(new Date().toLocaleDateString("ru-RU", { month: "long" })), year: `${new Date().getFullYear()} год`, all: "всё время" };
    $("#donutSubtitle").textContent = `Распределение по категориям · ${shortPeriod[period]}`;

    const R = 58;
    const C = 2 * Math.PI * R;
    let segments = "";
    let acc = 0;
    sorted.forEach(([name, amount], i) => {
      const len = amount / total * C;
      const gap = sorted.length > 1 ? Math.min(3, len * 0.3) : 0;
      const dash = Math.max(0.5, len - gap);
      segments += `<circle class="seg" data-i="${i}" cx="75" cy="75" r="${R}" stroke="${metaOf(name).color}" stroke-dasharray="${dash} ${C - dash}" stroke-dashoffset="${-acc}"/>`;
      acc += len;
    });

    const centerTotal = total >= 1e6 ? `${compact(total)} ₸` : money(total);
    $("#donutChart").classList.remove("has-hover");
    $("#donutChart").innerHTML = `<svg viewBox="0 0 150 150" aria-hidden="true"><circle class="ring-bg" cx="75" cy="75" r="${R}"/>${segments}</svg>
      <div class="donut-center"><span>Расходы</span><strong>${centerTotal}</strong></div>`;

    const legend = $("#categoryReport");
    if (!sorted.length) {
      legend.innerHTML = '<li class="report-empty">Здесь появится распределение расходов по категориям после добавления операций.</li>';
      return;
    }
    legend.innerHTML = sorted.map(([name, amount], i) => {
      const meta = metaOf(name);
      const percent = Math.round(amount / total * 100);
      return `<li data-i="${i}"><i class="dot" style="background:${meta.color}"></i><span class="legend-name">${meta.emoji} ${safeText(name)}</span><span class="legend-val">${money(amount)}<small>${percent}%</small></span></li>`;
    }).join("");
  }

  function bindDonutHover() {
    const donut = $("#donutChart");
    const legend = $("#categoryReport");
    const set = (i, on) => {
      donut.classList.toggle("has-hover", on);
      $$("#donutChart .seg").forEach(s => s.classList.toggle("is-hover", on && s.dataset.i === String(i)));
      $$("#categoryReport li").forEach(l => l.classList.toggle("is-hover", on && l.dataset.i === String(i)));
    };
    legend.addEventListener("mouseover", e => { const li = e.target.closest("li[data-i]"); if (li) set(li.dataset.i, true); });
    legend.addEventListener("mouseleave", () => set(-1, false));
    donut.addEventListener("mouseover", e => { const s = e.target.closest(".seg"); if (s) set(s.dataset.i, true); });
    donut.addEventListener("mouseleave", () => set(-1, false));
  }

  /* ---------- Бюджет ---------- */
  function renderBudget() {
    const now = new Date();
    const range = getRange("month");
    const spent = sumBy(transactions.filter(t => inRange(t, range)), "expense");
    const monthName = capitalize(now.toLocaleDateString("ru-RU", { month: "long" }));
    $("#budgetSubtitle").textContent = `Расходы за ${monthName.toLowerCase()} · лимит на месяц`;
    $("#budgetEditLabel").textContent = budget ? "Изменить" : "Задать лимит";
    const body = $("#budgetBody");

    if (!budget) {
      body.innerHTML = `<div class="budget-empty">Лимит не задан. Установите сумму — и мы покажем, сколько осталось и сколько можно тратить в день.<br><br><strong style="color:var(--ink)">Потрачено в этом месяце: ${money(spent)}</strong></div>`;
      return;
    }

    const rawPct = spent / budget * 100;
    const pct = Math.min(100, Math.round(rawPct));
    const state = spent > budget ? "over" : rawPct >= 80 ? "warn" : "ok";
    const remaining = budget - spent;
    const daysLeft = new Date(now.getFullYear(), now.getMonth() + 1, 0).getDate() - now.getDate() + 1;

    let hint;
    if (state === "over") hint = `Лимит превышен на <strong>${money(spent - budget)}</strong>. Постарайтесь сократить траты до конца месяца.`;
    else if (remaining === 0) hint = "Лимит исчерпан полностью.";
    else hint = `${state === "warn" ? "Осталось немного. " : ""}Можно тратить около <strong>${money(Math.floor(remaining / daysLeft))}</strong> в день до конца месяца (дней: ${daysLeft}).`;

    body.innerHTML = `<div class="budget-top"><span class="budget-spent">${money(spent)}</span><span class="budget-of">из ${money(budget)}</span></div>
      <div class="progress ${state === "ok" ? "" : state}" role="progressbar" aria-valuemin="0" aria-valuemax="100" aria-valuenow="${pct}"><span style="width:${pct}%"></span></div>
      <div class="budget-meta"><span>Использовано <strong>${Math.round(rawPct)}%</strong></span><span>${remaining >= 0 ? "Осталось" : "Перерасход"} <strong>${money(Math.abs(remaining))}</strong></span></div>
      <div class="budget-hint ${state}">${hint}</div>`;
  }

  /* ---------- Список операций ---------- */
  function getFiltered() {
    const query = $("#searchInput").value.trim().toLocaleLowerCase("ru");
    const type = $("#typeFilter").value;
    const category = $("#categoryFilter").value;
    const sort = $("#sortSelect").value;
    const range = getRange(period);
    const list = transactions.filter(t =>
      inRange(t, range) &&
      (type === "all" || t.type === type) &&
      (category === "all" || t.category === category) &&
      `${t.description} ${t.category}`.toLocaleLowerCase("ru").includes(query)
    );
    const byId = (a, b) => b.id.localeCompare(a.id);
    const sorters = {
      "date-desc": (a, b) => b.date.localeCompare(a.date) || byId(a, b),
      "date-asc": (a, b) => a.date.localeCompare(b.date) || byId(b, a),
      "amount-desc": (a, b) => b.amount - a.amount || byId(a, b),
      "amount-asc": (a, b) => a.amount - b.amount || byId(a, b)
    };
    return list.sort(sorters[sort] || sorters["date-desc"]);
  }

  function txRow(t, withDate) {
    const meta = metaOf(t.category);
    const sign = t.type === "income" ? "+" : "−";
    return `<div class="tx-row" data-id="${safeText(t.id)}">
      <div class="tx-avatar" style="background:${meta.color}22" aria-hidden="true">${meta.emoji}</div>
      <div class="tx-main">
        <div class="tx-title" title="${safeText(t.description)}">${safeText(t.description)}</div>
        <div class="tx-meta"><span class="pill"><i style="background:${meta.color}"></i>${safeText(t.category)}</span>${withDate ? `<span>${formatDate(t.date)}</span>` : ""}</div>
      </div>
      <div class="tx-amount ${t.type}">${sign}${money(t.amount)}</div>
      <div class="tx-actions">
        <button class="icon-btn is-edit" type="button" data-edit="${safeText(t.id)}" aria-label="Изменить: ${safeText(t.description)}" title="Изменить">${icon("pencil")}</button>
        <button class="icon-btn is-danger" type="button" data-delete="${safeText(t.id)}" aria-label="Удалить: ${safeText(t.description)}" title="Удалить">${icon("trash")}</button>
      </div>
    </div>`;
  }

  function renderTransactions() {
    const filtered = getFiltered();
    const visible = showAll ? filtered : filtered.slice(0, PAGE_SIZE);
    const grouped = $("#sortSelect").value.startsWith("date");
    let html = "";

    if (grouped) {
      const days = new Map();
      visible.forEach(t => { if (!days.has(t.date)) days.set(t.date, []); days.get(t.date).push(t); });
      days.forEach((items, date) => {
        const net = sumBy(items, "income") - sumBy(items, "expense");
        html += `<div class="tx-day"><span>${safeText(dayLabel(date))}</span><span>${signedMoney(net)}</span></div>`;
        html += items.map(t => txRow(t, false)).join("");
      });
    } else {
      html = visible.map(t => txRow(t, true)).join("");
    }
    $("#transactionsList").innerHTML = html;

    const none = filtered.length === 0;
    const noData = transactions.length === 0;
    $("#emptyState").hidden = !none;
    $("#emptyDemoButton").hidden = !noData;
    $("#emptyAddButton").hidden = false;
    if (none) {
      $("#emptyTitle").textContent = noData ? "Пока нет операций" : "Ничего не найдено";
      $("#emptyText").textContent = noData
        ? "Добавьте первый доход или расход — или загрузите пример данных, чтобы посмотреть, как всё работает."
        : "Попробуйте изменить период, фильтры или поисковый запрос.";
    }

    $("#transactionsSubtitle").textContent = periodTitle();
    $("#listCount").textContent = filtered.length ? `Показано ${visible.length} из ${filtered.length}` : "";
    const more = $("#showAllButton");
    more.hidden = filtered.length <= PAGE_SIZE;
    more.textContent = showAll ? "Свернуть список" : `Показать все (${filtered.length})`;
  }

  /* ---------- Общая отрисовка ---------- */
  function renderPeriodUI() {
    $$(".period button").forEach(b => b.setAttribute("aria-selected", String(b.dataset.period === period)));
    $("#periodSubtitle").textContent = `${periodTitle()} — контролируйте деньги и принимайте решения увереннее.`;
  }

  function render() {
    renderPeriodUI();
    renderSummary();
    renderSparkline();
    renderDynamics();
    renderDonut();
    renderBudget();
    renderTransactions();
  }

  /* ---------- Диалог операции ---------- */
  function currentType() {
    return form.querySelector('input[name="type"]:checked').value;
  }

  function renderChips(type, selected) {
    const names = categoryNames(type);
    const value = names.includes(selected) ? selected : names[0];
    $("#categoryChips").innerHTML = CATEGORIES[type].map(c =>
      `<label class="chip"><input type="radio" name="category" value="${safeText(c.name)}"${c.name === value ? " checked" : ""}><span>${c.emoji} ${safeText(c.name)}</span></label>`
    ).join("");
  }

  function selectedCategory() {
    const el = form.querySelector('input[name="category"]:checked');
    return el ? el.value : "";
  }

  function openDialog(options = {}) {
    const tx = options.id ? transactions.find(t => t.id === options.id) : null;
    editingId = tx ? tx.id : null;
    form.reset();
    const type = tx ? tx.type : (options.type || "expense");
    form.querySelector(`input[name="type"][value="${type}"]`).checked = true;
    renderChips(type, tx ? tx.category : "");
    $("#date").max = todayISO();
    $("#date").value = tx ? tx.date : todayISO();
    $("#description").value = tx ? tx.description : "";
    $("#amount").value = tx ? String(tx.amount) : "";
    $("#formError").textContent = "";
    $("#dialogEyebrow").textContent = tx ? "Редактирование" : "Новая запись";
    $("#dialogTitle").textContent = tx ? "Изменить операцию" : "Добавить операцию";
    $("#submitButton").textContent = tx ? "Сохранить изменения" : "Сохранить";
    if (!dialog.open) dialog.showModal();
    $("#amount").focus();
  }

  function validateForm(data) {
    if (!data.description || data.description.length > LIMITS.description) return `Введите описание длиной до ${LIMITS.description} символов.`;
    if (!Number.isFinite(data.amount) || !Number.isInteger(data.amount) || data.amount <= 0 || data.amount > LIMITS.amount) return "Сумма должна быть целым числом от 1 до 1 000 000 000 ₸.";
    if (!categoryNames(data.type).includes(data.category)) return "Выберите корректную категорию.";
    if (!isValidDate(data.date)) return "Укажите корректную дату.";
    if (data.date > todayISO()) return "Дата не может быть в будущем.";
    return "";
  }

  function onSubmitTransaction(event) {
    event.preventDefault();
    const amountRaw = $("#amount").value.trim();
    const data = {
      id: editingId || newId(),
      type: currentType(),
      description: $("#description").value.trim(),
      amount: amountRaw === "" ? NaN : Number(amountRaw),
      category: selectedCategory(),
      date: $("#date").value
    };
    const error = validateForm(data);
    if (error) { $("#formError").textContent = error; return; }

    const wasEditing = Boolean(editingId);
    if (wasEditing) transactions = transactions.map(t => t.id === data.id ? data : t);
    else transactions.push(data);
    saveTransactions();
    render();
    dialog.close();

    const outside = !inRange(data, getRange(period));
    if (outside) showToast(`${wasEditing ? "Изменения сохранены" : "Операция добавлена"}, но дата вне выбранного периода — переключитесь на «Всё время».`);
    else showToast(wasEditing ? "Изменения сохранены." : data.type === "income" ? "Доход добавлен." : "Расход добавлен.");
  }

  /* ---------- Подтверждение ---------- */
  function ask({ title, text, ok, danger = true }) {
    const dlg = $("#confirmDialog");
    $("#confirmTitle").textContent = title;
    $("#confirmText").textContent = text;
    const okBtn = $("#confirmOk");
    okBtn.textContent = ok;
    okBtn.className = `btn ${danger ? "btn-danger" : "btn-primary"}`;
    $("#confirmIcon").classList.toggle("neutral", !danger);
    return new Promise(resolve => {
      let settled = false;
      const onClose = () => finish(false);
      const finish = value => {
        if (settled) return;
        settled = true;
        okBtn.onclick = null;
        $("#confirmCancel").onclick = null;
        dlg.removeEventListener("close", onClose);
        if (dlg.open) dlg.close();
        resolve(value);
      };
      okBtn.onclick = () => finish(true);
      $("#confirmCancel").onclick = () => finish(false);
      dlg.addEventListener("close", onClose);
      dlg.showModal();
    });
  }

  /* ---------- Тост ---------- */
  function showToast(message) {
    const toast = $("#toast");
    toast.textContent = message;
    toast.classList.add("show");
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => toast.classList.remove("show"), 3200);
  }

  /* ---------- Экспорт / импорт ---------- */
  function download(name, content, mime) {
    const blob = new Blob([content], { type: mime });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = name;
    document.body.appendChild(a);
    a.click();
    a.remove();
    setTimeout(() => URL.revokeObjectURL(url), 1500);
  }

  function csvCell(value) {
    let s = String(value);
    if (/^[=+\-@\t\r]/.test(s)) s = "'" + s; // защита от внедрения формул в Excel
    return /[";\n\r]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
  }

  function exportCsv() {
    if (!transactions.length) { showToast("Пока нечего экспортировать."); return; }
    const rows = [["Дата", "Тип", "Категория", "Описание", "Сумма, ₸"].join(";")];
    [...transactions].sort((a, b) => b.date.localeCompare(a.date)).forEach(t => {
      rows.push([formatDate(t.date), t.type === "income" ? "Доход" : "Расход", csvCell(t.category), csvCell(t.description), t.amount].join(";"));
    });
    download(`finance-${todayISO()}.csv`, "﻿" + rows.join("\r\n"), "text/csv;charset=utf-8");
    showToast("Файл CSV сохранён.");
  }

  function exportJson() {
    const payload = { app: "uchet-lichnyh-rashodov", version: 2, exportedAt: new Date().toISOString(), budget, transactions };
    download(`finance-backup-${todayISO()}.json`, JSON.stringify(payload, null, 2), "application/json");
    showToast("Резервная копия сохранена.");
  }

  function normalizeImported(item) {
    if (!item || typeof item !== "object") return null;
    const type = item.type === "income" || item.type === "expense" ? item.type : null;
    if (!type) return null;
    const amount = Number(item.amount);
    const description = typeof item.description === "string" ? item.description.trim().slice(0, LIMITS.description) : "";
    if (!description || !Number.isInteger(amount) || amount <= 0 || amount > LIMITS.amount || !isValidDate(item.date)) return null;
    const category = categoryNames(type).includes(item.category) ? item.category : "Другое";
    const id = typeof item.id === "string" && item.id && item.id.length < 80 ? item.id : newId();
    return { id, type, description, amount, category, date: item.date };
  }

  async function importJson(file) {
    try {
      const text = await file.text();
      const parsed = JSON.parse(text);
      const list = Array.isArray(parsed) ? parsed : Array.isArray(parsed && parsed.transactions) ? parsed.transactions : null;
      if (!list) throw new Error("format");
      const known = new Set(transactions.map(t => t.id));
      let added = 0;
      let skipped = 0;
      list.forEach(raw => {
        const item = normalizeImported(raw);
        if (!item || known.has(item.id)) { skipped++; return; }
        known.add(item.id);
        transactions.push(item);
        added++;
      });
      if (!Array.isArray(parsed) && !budget && Number.isInteger(parsed.budget) && parsed.budget > 0 && parsed.budget <= LIMITS.amount) {
        budget = parsed.budget;
        saveBudget();
      }
      saveTransactions();
      render();
      $("#dataDialog").close();
      showToast(added ? `Импортировано операций: ${added}${skipped ? ` (пропущено: ${skipped})` : ""}.` : "Новых операций в файле не найдено.");
    } catch (error) {
      showToast("Не удалось прочитать файл. Нужна резервная копия в формате JSON.");
    } finally {
      $("#importFile").value = "";
    }
  }

  /* ---------- Демонстрационные данные ---------- */
  function mulberry32(seed) {
    return function () {
      seed |= 0; seed = seed + 0x6D2B79F5 | 0;
      let t = Math.imul(seed ^ seed >>> 15, 1 | seed);
      t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t;
      return ((t ^ t >>> 14) >>> 0) / 4294967296;
    };
  }

  function buildDemo() {
    const rnd = mulberry32(2026);
    const pick = list => list[Math.floor(rnd() * list.length)];
    const between = (a, b) => Math.max(100, Math.round((a + rnd() * (b - a)) / 100) * 100);
    const count = (a, b) => a + Math.floor(rnd() * (b - a + 1));
    const day = () => 1 + Math.floor(rnd() * 28);
    const today = todayISO();
    const out = [];
    let n = 0;
    const add = (type, description, amount, category, y, m, d) => {
      const date = iso(new Date(y, m, Math.min(d, new Date(y, m + 1, 0).getDate())));
      if (date > today) return;
      out.push({ id: `demo-${Date.now().toString(36)}-${++n}`, type, description, amount, category, date });
    };
    const now = new Date();
    for (let k = 5; k >= 0; k--) {
      const base = new Date(now.getFullYear(), now.getMonth() - k, 1);
      const y = base.getFullYear();
      const m = base.getMonth();
      add("income", "Зарплата", 450000, "Зарплата", y, m, 5);
      if (rnd() > 0.4) add("income", "Подработка: проект", between(50000, 90000), "Подработка", y, m, 18);
      if (rnd() > 0.8) add("income", "Подарок на день рождения", between(15000, 30000), "Подарок", y, m, 22);
      add("expense", "Аренда квартиры", 140000, "Жильё", y, m, 3);
      add("expense", "Мобильная связь", 4500, "Связь", y, m, 10);
      add("expense", "Домашний интернет", 5500, "Связь", y, m, 11);
      for (let i = count(8, 10); i > 0; i--) add("expense", pick(["Супермаркет", "Продукты на неделю", "Овощи и фрукты", "Рынок", "Хлеб и молоко"]), between(3000, 12000), "Продукты", y, m, day());
      for (let i = count(5, 7); i > 0; i--) add("expense", pick(["Такси", "Проезд", "Такси домой", "Пополнение карты"]), between(600, 3500), "Транспорт", y, m, day());
      add("expense", "Заправка", between(8000, 14000), "Транспорт", y, m, day());
      for (let i = count(2, 3); i > 0; i--) add("expense", pick(["Кино", "Кафе с друзьями", "Подписка на музыку", "Боулинг"]), between(2500, 11000), "Развлечения", y, m, day());
      if (rnd() > 0.5) add("expense", "Аптека", between(3000, 9000), "Здоровье", y, m, day());
      if (rnd() > 0.45) add("expense", pick(["Одежда", "Обувь", "Товары для дома"]), between(12000, 38000), "Покупки", y, m, day());
      if (rnd() > 0.8) add("expense", "Онлайн-курс", 25000, "Образование", y, m, day());
    }
    return out;
  }

  async function loadDemo() {
    if (transactions.length) {
      const ok = await ask({ title: "Добавить пример данных?", text: "Демонстрационные записи будут добавлены к вашим операциям. Их можно удалить по одной или через «Очистить всё».", ok: "Добавить", danger: false });
      if (!ok) return;
    }
    transactions.push(...buildDemo());
    if (!budget) { budget = 330000; saveBudget(); }
    saveTransactions();
    render();
    if ($("#dataDialog").open) $("#dataDialog").close();
    showToast("Пример данных загружен.");
  }

  async function clearAll() {
    const ok = await ask({ title: "Очистить все данные?", text: "Будут удалены все операции и лимит бюджета. Это действие нельзя отменить — сначала можно сделать резервную копию.", ok: "Удалить всё" });
    if (!ok) return;
    transactions = [];
    budget = null;
    saveTransactions();
    saveBudget();
    render();
    $("#dataDialog").close();
    showToast("Все данные удалены.");
  }

  /* ---------- Тема ---------- */
  function applyTheme(theme, persist) {
    document.documentElement.setAttribute("data-theme", theme);
    const toggle = $("#themeToggle");
    toggle.setAttribute("aria-pressed", String(theme === "dark"));
    $(".theme-label").textContent = theme === "dark" ? "Светлая тема" : "Тёмная тема";
    if (persist) writeStorage(KEYS.theme, theme);
  }

  /* ---------- Навигация по разделам ---------- */
  function bindScrollSpy() {
    const sections = ["overview", "analytics", "transactions"].map(id => document.getElementById(id));
    const links = $$(".nav-link[data-section]");
    let ticking = false;
    const update = () => {
      ticking = false;
      let current = sections[0].id;
      sections.forEach(s => { if (s.getBoundingClientRect().top <= 180) current = s.id; });
      if (window.innerHeight + window.scrollY >= document.body.scrollHeight - 4) current = sections[sections.length - 1].id;
      links.forEach(l => l.classList.toggle("active", l.dataset.section === current));
    };
    window.addEventListener("scroll", () => { if (!ticking) { ticking = true; requestAnimationFrame(update); } }, { passive: true });
    update();
  }

  /* ---------- Подписки на события ---------- */
  function bindEvents() {
    // Добавление
    ["#addTopButton", "#emptyAddButton", "#fabButton"].forEach(sel => $(sel).addEventListener("click", () => openDialog()));
    $("#closeDialog").addEventListener("click", () => dialog.close());
    $("#cancelButton").addEventListener("click", () => dialog.close());
    form.addEventListener("submit", onSubmitTransaction);
    form.querySelectorAll('input[name="type"]').forEach(input => input.addEventListener("change", () => renderChips(currentType(), selectedCategory())));
    $("#description").addEventListener("input", () => { $("#formError").textContent = ""; });
    $("#amount").addEventListener("input", () => { $("#formError").textContent = ""; });

    // Период
    $$(".period button").forEach(button => button.addEventListener("click", () => {
      period = button.dataset.period;
      showAll = false;
      writeStorage(KEYS.period, period);
      render();
    }));

    // Фильтры
    $("#searchInput").addEventListener("input", () => { showAll = false; renderTransactions(); });
    ["#typeFilter", "#categoryFilter", "#sortSelect"].forEach(sel => $(sel).addEventListener("change", () => { showAll = false; renderTransactions(); }));
    $("#showAllButton").addEventListener("click", () => { showAll = !showAll; renderTransactions(); });

    // Действия над операциями
    $("#transactionsList").addEventListener("click", async event => {
      const editBtn = event.target.closest("[data-edit]");
      if (editBtn) { openDialog({ id: editBtn.dataset.edit }); return; }
      const delBtn = event.target.closest("[data-delete]");
      if (!delBtn) return;
      const tx = transactions.find(t => t.id === delBtn.dataset.delete);
      if (!tx) return;
      const ok = await ask({ title: "Удалить операцию?", text: `«${tx.description}» на ${money(tx.amount)} будет удалена без возможности восстановления.`, ok: "Удалить" });
      if (!ok) return;
      transactions = transactions.filter(t => t.id !== tx.id);
      saveTransactions();
      render();
      showToast("Операция удалена.");
    });

    // Бюджет
    const budgetDialog = $("#budgetDialog");
    $("#budgetEditButton").addEventListener("click", () => {
      $("#budgetAmount").value = budget ? String(budget) : "";
      $("#budgetError").textContent = "";
      $("#budgetClear").hidden = !budget;
      budgetDialog.showModal();
      $("#budgetAmount").focus();
    });
    $("#budgetForm").addEventListener("submit", event => {
      event.preventDefault();
      const raw = $("#budgetAmount").value.trim();
      const value = raw === "" ? NaN : Number(raw);
      if (!Number.isInteger(value) || value <= 0 || value > LIMITS.amount) {
        $("#budgetError").textContent = "Введите целое число от 1 до 1 000 000 000 ₸.";
        return;
      }
      budget = value;
      saveBudget();
      renderBudget();
      budgetDialog.close();
      showToast("Лимит бюджета сохранён.");
    });
    $("#budgetClear").addEventListener("click", () => {
      budget = null;
      saveBudget();
      renderBudget();
      budgetDialog.close();
      showToast("Лимит убран.");
    });

    // Данные
    $("#navData").addEventListener("click", () => $("#dataDialog").showModal());
    $("#exportCsv").addEventListener("click", exportCsv);
    $("#exportJson").addEventListener("click", exportJson);
    $("#importJson").addEventListener("click", () => $("#importFile").click());
    $("#importFile").addEventListener("change", event => { const file = event.target.files[0]; if (file) importJson(file); });
    $("#loadDemo").addEventListener("click", loadDemo);
    $("#emptyDemoButton").addEventListener("click", loadDemo);
    $("#clearAll").addEventListener("click", clearAll);

    // Закрытие диалогов
    $$("[data-close]").forEach(button => button.addEventListener("click", () => document.getElementById(button.dataset.close).close()));
    $$("dialog").forEach(dlg => dlg.addEventListener("click", event => {
      if (event.target !== dlg) return;
      const r = dlg.getBoundingClientRect();
      if (event.clientX < r.left || event.clientX > r.right || event.clientY < r.top || event.clientY > r.bottom) dlg.close();
    }));

    // Тема
    $("#themeToggle").addEventListener("click", () => applyTheme(document.documentElement.getAttribute("data-theme") === "dark" ? "light" : "dark", true));

    // Горячие клавиши
    document.addEventListener("keydown", event => {
      if (event.ctrlKey || event.metaKey || event.altKey) return;
      const tag = (event.target.tagName || "").toLowerCase();
      if (["input", "textarea", "select"].includes(tag) || event.target.isContentEditable) return;
      if (document.querySelector("dialog[open]")) return;
      if (event.code === "KeyN") { event.preventDefault(); openDialog(); }
      else if (event.key === "/" || event.code === "Slash") { event.preventDefault(); $("#searchInput").focus(); }
    });

    // Перерисовка графика при изменении ширины
    const box = $("#dynamicsChart");
    if (typeof ResizeObserver === "function") {
      new ResizeObserver(() => {
        if (Math.abs(box.clientWidth - dynamicsWidth) > 2 || Math.abs(Math.max(270, box.clientHeight) - dynamicsHeight) > 2) renderDynamics(false);
      }).observe(box);
    }

    bindDynamicsTooltip();
    bindDonutHover();
    bindScrollSpy();
  }

  /* ---------- Инициализация ---------- */
  function buildCategoryFilter() {
    const names = Array.from(new Set([...categoryNames("expense"), ...categoryNames("income")]));
    $("#categoryFilter").innerHTML = '<option value="all">Все категории</option>' + names.map(n => `<option value="${safeText(n)}">${safeText(metaOf(n).emoji)} ${safeText(n)}</option>`).join("");
  }

  function init() {
    const hour = new Date().getHours();
    $("#greeting").textContent = hour < 5 ? "Доброй ночи" : hour < 12 ? "Доброе утро" : hour < 18 ? "Добрый день" : "Добрый вечер";
    const dayOfYear = Math.floor((new Date() - new Date(new Date().getFullYear(), 0, 0)) / 864e5);
    $("#tipText").textContent = TIPS[dayOfYear % TIPS.length];
    applyTheme(document.documentElement.getAttribute("data-theme") === "dark" ? "dark" : "light", false);
    buildCategoryFilter();
    bindEvents();
    render();
  }

  init();
})();
