(function () {
"use strict";

/* ============================================================
   STATE
============================================================ */
const STATE = {
  logged: false, currentPage: "home",
  chartSymbol: "BINANCE:BTCUSDT", chartInterval: "15",
  chartWidget: null, theme: "dark",
  aiHistory: [],
};

/* ============================================================
   DOM CACHE
============================================================ */
let DOM = {};
const $ = (s, c) => (c || document).querySelector(s);
const $$ = (s, c) => Array.from((c || document).querySelectorAll(s));

function cacheDOM() {
  DOM.splash = $("#splash");
  DOM.loginScreen = $("#loginScreen");
  DOM.app = $("#app");
  DOM.particles = $("#particlesContainer");
  DOM.loginBtn = $("#loginButton");
  DOM.userInp = $("#usernameInput");
  DOM.passInp = $("#passwordInput");
  DOM.mainNav = $("#mainNav");
  DOM.mobOverlay = $("#mobOverlay");
  DOM.mobDrawer = $("#mobDrawer");
  DOM.mobNavBtns = $("#mobNavBtns");
  DOM.hamburger = $("#hamburgerBtn");
  DOM.closeMob = $("#closeMobNav");
  DOM.pages = $$(".page-section");
  DOM.tvChart = $("#tv_chart");
  DOM.symbolSelect = $("#symbolSelect");
  DOM.intvBtns = $$(".ibtn");
  DOM.pairGrid = $("#pairButtonsGrid");
  DOM.watchlistItems = $$(".watchlist-item");
  DOM.pairSearch = $("#pairSearchInput");
  DOM.toolCards = $$(".tool-card");
  DOM.modalOv = $("#modalOverlay");
  DOM.modalContent = $("#modalContent");
  DOM.modalClose = $("#modalCloseBtn");
  DOM.themeToggle = $("#themeToggle");
  DOM.toastCont = $("#toastContainer");
  DOM.ticker = $("#topBarTicker");
  DOM.subBtn = $("#navSubscribeBtn");
  DOM.contactBtn = $("#navContactBtn");
  DOM.acadGroups = $("#acadGroups");
  DOM.acadContent = $("#acadContent");
  DOM.acadInner = $("#acadInner");
  DOM.acadBack = $("#acadBack");
  DOM.pairInfoBox = $("#pairInfoBox");
}

/* ============================================================
   TOAST
============================================================ */
function toast(msg, type = "info") {
  const t = document.createElement("div");
  t.className = `toast toast-${type}`;
  t.innerHTML = `<span>${msg}</span><button class="toast-close">&times;</button>`;
  DOM.toastCont.appendChild(t);
  setTimeout(() => t.remove(), 4500);
  t.querySelector(".toast-close").addEventListener("click", () => t.remove());
}

/* ============================================================
   PARTICLES
============================================================ */
function createParticles() {
  if (!DOM.particles) return;
  for (let i = 0; i < 30; i++) {
    const p = document.createElement("div");
    p.className = "particle";
    const sz = Math.random() * 5 + 2;
    const left = Math.random() * 100;
    const dur = Math.random() * 22 + 15;
    const delay = -(Math.random() * 14);
    const op = Math.random() * 0.28 + 0.07;
    const colors = ["rgba(124,92,252,0.5)","rgba(0,229,255,0.3)","rgba(240,180,41,0.3)"];
    const color = colors[Math.floor(Math.random() * colors.length)];
    p.style.cssText = `left:${left}%;width:${sz}px;height:${sz}px;animation-duration:${dur}s;animation-delay:${delay}s;opacity:${op};background:${color};`;
    DOM.particles.appendChild(p);
  }
}

/* ============================================================
   SPLASH → LOGIN
============================================================ */
function initSplash() {
  const alreadyLoggedIn = localStorage.getItem("pand_isLoggedIn") === "true";
  setTimeout(() => {
    if (DOM.splash) {
      DOM.splash.style.transition = "opacity 0.5s ease";
      DOM.splash.style.opacity = "0";
      setTimeout(() => { if (DOM.splash) DOM.splash.remove(); }, 500);
    }
    if (alreadyLoggedIn) {
      // Skip login screen — go straight to app
      STATE.logged = true;
      if (DOM.loginScreen) DOM.loginScreen.style.display = "none";
      DOM.app.style.display = "block";
      setTimeout(() => {
        DOM.app.style.transition = "opacity 0.4s ease";
        DOM.app.style.opacity = "1";
        goToPage("home");
      }, 30);
    } else {
      if (DOM.loginScreen) {
        DOM.loginScreen.style.display = "flex";
        DOM.loginScreen.style.opacity = "0";
        setTimeout(() => { DOM.loginScreen.style.transition = "opacity 0.4s"; DOM.loginScreen.style.opacity = "1"; }, 10);
      }
    }
  }, 2000);
}

/* ============================================================
   LOGIN
============================================================ */
function initLogin() {
  DOM.loginBtn.addEventListener("click", doLogin);
  [DOM.userInp, DOM.passInp].forEach(el => el.addEventListener("keypress", e => { if (e.key === "Enter") doLogin(); }));
}

function doLogin() {
  const u = DOM.userInp.value.trim();
  const p = DOM.passInp.value.trim();
  if (u === "PAND" && p === "PAND") {
    STATE.logged = true;
    localStorage.setItem("pand_isLoggedIn", "true");
    localStorage.setItem("pand_user", JSON.stringify({ username: u, loginTime: Date.now() }));
    DOM.loginScreen.style.transition = "opacity 0.35s ease";
    DOM.loginScreen.style.opacity = "0";
    setTimeout(() => {
      DOM.loginScreen.style.display = "none";
      DOM.app.style.display = "block";
      setTimeout(() => {
        DOM.app.style.transition = "opacity 0.4s ease";
        DOM.app.style.opacity = "1";
        goToPage("home");
      }, 30);
    }, 380);
    toast("Welcome back, Trader! 🚀", "success");
  } else {
    toast("Invalid credentials. Use PAND / PAND", "error");
    DOM.passInp.value = "";
    DOM.userInp.focus();
  }
}

function doLogout() {
  STATE.logged = false;
  localStorage.removeItem("pand_isLoggedIn");
  localStorage.removeItem("pand_user");
  // Fade app out, show login
  DOM.app.style.transition = "opacity 0.35s ease";
  DOM.app.style.opacity = "0";
  setTimeout(() => {
    DOM.app.style.display = "none";
    DOM.app.style.opacity = "1";
    DOM.app.style.transition = "";
    DOM.loginScreen.style.display = "flex";
    DOM.loginScreen.style.opacity = "0";
    setTimeout(() => { DOM.loginScreen.style.transition = "opacity 0.4s"; DOM.loginScreen.style.opacity = "1"; }, 10);
    // Clear inputs
    if (DOM.userInp) DOM.userInp.value = "";
    if (DOM.passInp) DOM.passInp.value = "";
  }, 370);
  toast("Logged out successfully.", "info");
}

window.doLogout = doLogout;

/* ============================================================
   NAVIGATION
============================================================ */
function initNavigation() {
  DOM.mainNav.addEventListener("click", e => {
    const btn = e.target.closest("[data-page]");
    if (btn) { e.preventDefault(); goToPage(btn.dataset.page); }
  });
  document.addEventListener("click", e => {
    const btn = e.target.closest("[data-page]");
    if (btn && !btn.closest("#mainNav") && !btn.closest(".mob-btns")) {
      const pg = btn.dataset.page;
      if (pg) goToPage(pg);
    }
  });
  $(".footer").addEventListener("click", e => {
    const link = e.target.closest("[data-page]");
    if (link) { e.preventDefault(); goToPage(link.dataset.page); }
  });
}

function goToPage(page) {
  STATE.currentPage = page;
  DOM.pages.forEach(p => p.classList.remove("active"));
  const target = $(`#page-${page}`);
  if (target) { target.classList.add("active"); window.scrollTo({ top: 0, behavior: "smooth" }); }
  $$(".nbtn").forEach(b => b.classList.remove("active"));
  const active = $(`.nbtn[data-page="${page}"]`);
  if (active) active.classList.add("active");
  if (page === "market") setTimeout(initChart, 350);
  closeMobNav();
}

/* ============================================================
   MOBILE NAV
============================================================ */
function initMobileNav() {
  DOM.hamburger.addEventListener("click", openMob);
  DOM.closeMob.addEventListener("click", closeMobNav);
  DOM.mobOverlay.addEventListener("click", closeMobNav);
  buildMobNav();
}

function buildMobNav() {
  DOM.mobNavBtns.innerHTML = "";
  $$(".nav-links .nbtn").forEach(btn => {
    const nb = document.createElement("button");
    nb.className = "nbtn";
    nb.dataset.page = btn.dataset.page;
    nb.innerHTML = btn.innerHTML;
    nb.addEventListener("click", () => { goToPage(btn.dataset.page); closeMobNav(); });
    DOM.mobNavBtns.appendChild(nb);
  });
}

function openMob() { DOM.mobDrawer.classList.add("open"); DOM.mobOverlay.classList.add("open"); }
function closeMobNav() { DOM.mobDrawer.classList.remove("open"); DOM.mobOverlay.classList.remove("open"); }

/* ============================================================
   TRADINGVIEW CHART
============================================================ */
let chartAttempts = 0;
function initChart() {
  const el = DOM.tvChart;
  if (!el) return;
  el.innerHTML = "";
  if (typeof TradingView === "undefined") {
    chartAttempts++;
    if (chartAttempts >= 6) {
      el.innerHTML = '<div style="padding:24px;color:var(--red);text-align:center;"><i class="fa-solid fa-triangle-exclamation"></i> Chart failed to load. Please refresh the page.</div>';
      return;
    }
    setTimeout(initChart, 600);
    return;
  }
  chartAttempts = 0;
  try {
    if (STATE.chartWidget) { try { STATE.chartWidget.remove(); } catch(e){} STATE.chartWidget = null; }
    STATE.chartWidget = new TradingView.widget({
      container_id: "tv_chart",
      symbol: STATE.chartSymbol,
      interval: STATE.chartInterval,
      theme: STATE.theme === "dark" ? "dark" : "light",
      style: "1", locale: "en",
      toolbar_bg: "#0d1325",
      enable_publishing: false,
      hide_side_toolbar: false,
      allow_symbol_change: true,
      studies: ["RSI@tv-basicstudies", "MASimple@tv-basicstudies"],
      autosize: true, withdateranges: true,
    });
  } catch (e) {
    el.innerHTML = `<div style="padding:24px;color:var(--red);text-align:center;">Chart error: ${e.message}</div>`;
  }
}

function initChartControls() {
  if (DOM.symbolSelect) {
    DOM.symbolSelect.addEventListener("change", e => { STATE.chartSymbol = e.target.value; initChart(); updateWatchlist(); });
  }
  DOM.intvBtns.forEach(btn => {
    btn.addEventListener("click", () => {
      DOM.intvBtns.forEach(b => b.classList.remove("active"));
      btn.classList.add("active");
      STATE.chartInterval = btn.dataset.interval;
      initChart();
    });
  });
  if (DOM.pairGrid) {
    DOM.pairGrid.addEventListener("click", e => {
      const btn = e.target.closest("button[data-symbol]");
      if (btn) {
        STATE.chartSymbol = btn.dataset.symbol;
        if (DOM.symbolSelect) DOM.symbolSelect.value = btn.dataset.symbol;
        initChart(); updateWatchlist();
      }
    });
  }
  DOM.watchlistItems.forEach(item => {
    item.addEventListener("click", () => {
      const sym = item.dataset.symbol;
      if (sym) { STATE.chartSymbol = sym; if (DOM.symbolSelect) DOM.symbolSelect.value = sym; initChart(); updateWatchlist(); }
    });
  });
  if (DOM.pairSearch) {
    DOM.pairSearch.addEventListener("input", e => {
      const q = e.target.value.toLowerCase();
      $$(".pair-grid button").forEach(btn => { btn.style.display = btn.textContent.toLowerCase().includes(q) ? "" : "none"; });
    });
  }

  // Chart tool buttons
  const ctDraw = document.getElementById("ctDraw");
  const ctIndicators = document.getElementById("ctIndicators");
  const ctCompare = document.getElementById("ctCompare");
  const ctFullscreen = document.getElementById("ctFullscreen");

  if (ctDraw) {
    ctDraw.addEventListener("click", () => {
      toast("Drawing tools are inside the TradingView chart. Click the pencil/line icons on the chart's left toolbar.", "info");
    });
  }
  if (ctIndicators) {
    ctIndicators.addEventListener("click", () => {
      // Try to open TradingView indicators dialog via iframe
      const iframe = document.querySelector("#tv_chart iframe");
      if (iframe) {
        try { iframe.contentWindow.postMessage({ name: "tv-widget-new-indicator" }, "*"); } catch(e) {}
      }
      toast("Click the 'Indicators' button inside the TradingView chart (ƒx icon on the top toolbar) to add RSI, MACD, Moving Averages and more.", "info");
    });
  }
  if (ctCompare) {
    ctCompare.addEventListener("click", () => {
      const sym = prompt("Enter a symbol to compare (e.g. BINANCE:ETHUSDT, FOREXCOM:GBPUSD):");
      if (sym && sym.trim()) {
        toast(`Comparing with ${sym.trim()}. Use the Compare tool inside the TradingView chart for full overlay comparison.`, "info");
      }
    });
  }
  if (ctFullscreen) {
    ctFullscreen.addEventListener("click", () => {
      const chartWrap = document.querySelector(".chart-wrap");
      if (!document.fullscreenElement) {
        chartWrap?.requestFullscreen().catch(() => {
          toast("Fullscreen requires browser permission. Try F11 for browser fullscreen.", "info");
        });
        ctFullscreen.innerHTML = '<i class="fa-solid fa-compress"></i> Exit Fullscreen';
      } else {
        document.exitFullscreen();
        ctFullscreen.innerHTML = '<i class="fa-solid fa-expand"></i> Fullscreen';
      }
    });
    document.addEventListener("fullscreenchange", () => {
      if (!document.fullscreenElement && ctFullscreen) {
        ctFullscreen.innerHTML = '<i class="fa-solid fa-expand"></i> Fullscreen';
      }
    });
  }
}

function updateWatchlist() {
  DOM.watchlistItems.forEach(item => item.classList.toggle("active", item.dataset.symbol === STATE.chartSymbol));
}

/* ============================================================
   FOREX PAIR ICONS
============================================================ */
function initForexPairIcons() {
  $$(".pbtn").forEach(btn => {
    btn.addEventListener("click", () => {
      $$(".pbtn").forEach(b => b.classList.remove("active"));
      btn.classList.add("active");
      const info = btn.dataset.info;
      if (info && DOM.pairInfoBox) {
        DOM.pairInfoBox.style.display = "block";
        DOM.pairInfoBox.innerHTML = `<strong style="color:var(--purple2);font-size:1rem;">${btn.dataset.pair}</strong><br><br>${info}`;
      }
    });
  });
}

/* ============================================================
   HERO TYPEWRITER
============================================================ */
function initHeroText() {
  const el = $("#heroText");
  if (!el) return;
  const texts = ["Master the Markets", "Learn Smart Money", "Trade with Precision", "Control Your Risk", "Achieve Consistency"];
  let idx = 0, charIdx = 0, deleting = false;
  function tick() {
    const cur = texts[idx];
    if (!deleting) {
      el.textContent = cur.substring(0, charIdx + 1);
      charIdx++;
      if (charIdx === cur.length) { deleting = true; setTimeout(tick, 2200); return; }
    } else {
      el.textContent = cur.substring(0, charIdx - 1);
      charIdx--;
      if (charIdx === 0) { deleting = false; idx = (idx + 1) % texts.length; }
    }
    setTimeout(tick, deleting ? 45 : 80);
  }
  tick();
}

/* ============================================================
   FOREX TAB CONTENT DATA
============================================================ */
const FOREX_DATA = {
  technical: [
    { icon:"fa-chart-line", title:"Technical Analysis Basics", body:"Technical analysis studies historical price action to forecast future movements. Three core principles: market discounts everything, prices move in trends, and history repeats itself through human psychology.", pts:["Market Discounts Everything: all known info is already reflected in price","Price Moves in Trends: trends persist until reversal signals appear","History Repeats: market psychology creates recurring chart patterns","Best when combined with fundamental analysis for high-probability entries"] },
    { icon:"fa-arrow-trend-up", title:"Support & Resistance", body:"Support is where buyers consistently overpower sellers. Resistance is where sellers overpower buyers. Role reversal is fundamental — broken support becomes resistance and vice versa.", pts:["Multiple touches = stronger, more reliable level","Treat as zones, not lines — price reacts to areas","Higher timeframe S/R carries much more weight","Strong reaction candles (hammers, engulfing) confirm the zone"] },
    { icon:"fa-chart-bar", title:"Trend Analysis", body:"Uptrends = Higher Highs (HH) + Higher Lows (HL). Downtrends = Lower Highs (LH) + Lower Lows (LL). Sideways = equal highs and lows creating a range structure.", pts:["Use 200 EMA as long-term trend filter — above = buy bias only","Pullbacks to 20/50 EMA = buying opportunities in established uptrend","BOS (Break of Structure) confirms trend change — wait for it","Multi-timeframe confirmation: HTF direction + LTF entry"] },
    { icon:"fa-maximize", title:"Chart Patterns", body:"Patterns form during price consolidation and provide directional bias and measured move targets. Categorized as reversal or continuation patterns.", pts:["Head & Shoulders: reversal — bearish at top, inverse H&S bullish at bottom","Double Top/Bottom: reversal after two failed attempts at extremes","Triangles: symmetrical, ascending, descending — watch for breakout","Flags & Pennants: short consolidation → strong continuation expected"] },
    { icon:"fa-fire", title:"Japanese Candlesticks", body:"Each candle shows open, high, low, and close. The battle between buyers and sellers is visible in candle shape, size, and context — location is everything.", pts:["Doji: open ≈ close — indecision, strong reversal signal at extremes","Hammer: long lower wick — bullish reversal at support level","Shooting Star: long upper wick — bearish reversal at resistance level","Engulfing: 2nd candle fully engulfs 1st — very strong reversal signal"] },
    { icon:"fa-gauge", title:"Technical Indicators", body:"Use indicators as confirmation, never as primary signals. Never stack more than 2-3 indicators — they create noise and confusion, not clarity.", pts:["Trend: EMA 20/50/200, MACD, ADX — define the direction","Momentum: RSI (14), Stochastic, CCI — overbought/oversold","Volatility: Bollinger Bands, ATR, Keltner Channels — squeeze signals","Volume: OBV, Volume Profile, MFI — confirm institutional participation"] },
  ],
  fundamental: [
    { icon:"fa-newspaper", title:"Fundamental Analysis Overview", body:"Fundamental analysis evaluates currencies based on the economic, political, and social forces that affect the supply and demand of those currencies in the global market.", pts:["Central bank interest rate decisions are the most powerful catalyst","Economic indicators drive short-term volatility (NFP, CPI, GDP)","Sentiment and geopolitics drive longer-term trends and capital flows","Best combined with technical analysis for precise entry and exit timing"] },
    { icon:"fa-chart-bar", title:"Key Economic Indicators", body:"These data releases cause the most significant and predictable price moves in forex markets. Mark these on your calendar and avoid trading during releases.", pts:["NFP (Non-Farm Payrolls): US employment — highest impact Friday data","CPI: inflation measure → drives interest rate expectations globally","GDP: economic growth → currency strength or weakness","FOMC Minutes: Fed policy insight → USD moves significantly","PMI: business sentiment → leading indicator of economic health"] },
    { icon:"fa-building-columns", title:"Central Banks & Monetary Policy", body:"Central banks control interest rates and money supply. Their decisions are the single most important fundamental driver of currency values globally.", pts:["Hawkish (rate hikes expected) → currency strengthens significantly","Dovish (rate cuts expected) → currency weakens","Fed (USD), ECB (EUR), BoE (GBP), BoJ (JPY), RBA (AUD), RBC (CAD)","Forward guidance often more market-moving than the actual decision"] },
    { icon:"fa-globe", title:"Geopolitical Risk & Sentiment", body:"Political events, wars, elections, and trade disputes create risk-on or risk-off environments that override technical signals temporarily.", pts:["Risk-OFF environment: Buy USD, JPY, CHF, Gold (safe havens flow)","Risk-ON environment: Buy AUD, NZD, stocks, commodities, crypto","Elections create volatility — fade the initial spike is often the trade","Trade wars hurt export-dependent currencies most (AUD, CNY affected)"] },
    { icon:"fa-link", title:"Market Correlations", body:"Understanding correlations helps avoid overexposure and find confirmation signals across asset classes. Inverse or positive correlations are your edge.", pts:["AUD/USD rises when iron ore/copper prices are rising (China demand)","USD/CAD falls when crude oil prices rise (inverse oil-CAD relationship)","Gold rises when USD weakens — strong inverse correlation","JPY rises when US Treasury yields fall — risk-off safe haven flow"] },
  ],
  smartmoney: [
    { icon:"fa-money-bill-trend-up", title:"What is Smart Money (ICT)?", body:"Smart Money refers to institutional traders — banks, hedge funds, market makers — with massive capital that can move markets. ICT methodology teaches retail traders to track institutional order flow and footprints.", pts:["Institutions create predictable, recurring manipulation patterns","Focus on liquidity, order flow, and market structure fractures","Retail traders are the liquidity — learn to recognize the traps set for you","Think like a market maker, not a retail participant losing to them"] },
    { icon:"fa-sitemap", title:"Market Structure: BOS & CHoCH", body:"Break of Structure (BOS) confirms trend continuation in the same direction. Change of Character (CHoCH) signals potential trend reversal — the most important signal in ICT.", pts:["Bullish structure: HH + HL pattern forming above previous highs","Bearish structure: LH + LL pattern forming below previous lows","BOS: price breaks previous swing point in direction of current trend","CHoCH: price breaks in opposite direction — signals potential reversal"] },
    { icon:"fa-water", title:"Liquidity Pools & Stop Hunts", body:"Institutions need liquidity to fill large orders. They intentionally target areas where retail stop losses are clustered — above equal highs and below equal lows — before reversing.", pts:["Equal Highs/Lows: prime liquidity magnets for institutional orders","Buy Stops: clustered above previous highs — institutions sell into them","Sell Stops: clustered below previous lows — institutions buy into them","Liquidity sweep = stop hunt → high-probability reversal entry opportunity"] },
    { icon:"fa-grip-lines", title:"Fair Value Gaps (FVG)", body:"FVGs are price imbalances where one side's orders couldn't be filled due to speed of movement. Price frequently returns to rebalance these gaps before continuing.", pts:["Bullish FVG: 3 candles — candle 3 low is higher than candle 1 high","Bearish FVG: 3 candles — candle 3 high is lower than candle 1 low","Price retraces to fill the FVG before continuing in original direction","Best FVGs form during high-volume London/NY sessions with displacement"] },
    { icon:"fa-cube", title:"Order Blocks (OB)", body:"The last opposing candle before a strong displacement move — where institutional orders were originally placed. Price frequently returns to these zones for distribution or accumulation.", pts:["Bullish OB: last bearish candle before a strong impulsive up move","Bearish OB: last bullish candle before a strong impulsive down move","Enter on retracement to OB with lower timeframe confirmation candle","Combine OB with FVG overlap (confluence) for highest probability setups"] },
    { icon:"fa-dollar-sign", title:"Premium & Discount Zones", body:"ICT uses the 50% Fibonacci level to determine if price is at a premium (expensive, good for sells) or discount (cheap, good for buys) relative to the current range.", pts:["Above 50% Fibonacci = Premium zone — discount prices for sells","Below 50% Fibonacci = Discount zone — cheap prices, good for buys","Never buy at premium — always wait for price to reach discount","Combine with OB and FVG for maximum precision in entry timing"] },
  ],
  priceaction: [
    { icon:"fa-fire", title:"Price Action Fundamentals", body:"Price action trading uses raw chart analysis without lagging indicators. It reads the direct battle between buyers and sellers from candle shapes, sizes, and locations.", pts:["Pin Bar: long wick, small body — strong level rejection signal","Inside Bar: consolidation pattern before breakout in either direction","Engulfing: strong reversal candle consuming previous candle entirely","Doji at extremes: indecision at key levels → potential reversal setup"] },
    { icon:"fa-arrows-up-down", title:"Support & Resistance Zones", body:"The most objective price action tool. Multiple touches and strong reaction candles define the strength and reliability of a zone for future trades.", pts:["Role reversal: broken support becomes resistance — and vice versa","Round numbers (1.1000, 1.2000) act as psychological S/R levels","Use wicks, not closes, to define the boundaries of the zone","HH = resistance level; HL = support level in uptrend structure"] },
    { icon:"fa-chart-line", title:"Trendlines & Channels", body:"Dynamic support and resistance. Connect swing points to define trend slope. Channels add a parallel boundary for range trading within a trend.", pts:["Minimum two touch points required to draw a valid trendline","Steeper trendlines are more fragile and break more easily","Channel breakout = strong momentum signal in direction of break","Combine with horizontal S/R for high-confluence entry signals"] },
  ],
  strategies: [
    { icon:"fa-arrow-trend-up", title:"Trend Following Strategy", body:"Identify a clear trend with HH/HL structure. Enter on pullbacks to dynamic support. Ride the trend until exhaustion signals or structure break appears.", pts:["Use 200 EMA as trend filter — only take long trades above it","Entry: pullback to 20 EMA + confluence with horizontal S/R level","Stop: below recent swing low (HL) to protect position","Target: next resistance / structure level or 1:3+ R:R minimum","Win rate: 40–55% is acceptable with good R:R management"] },
    { icon:"fa-arrow-right-to-bracket", title:"Breakout Strategy", body:"Wait for price to consolidate in a clear range or pattern. Enter on decisive breakout candle close with volume confirmation. Avoid false breakouts — wait for the close.", pts:["Identify clear consolidation zone (triangle, rectangle, pennant)","Wait for decisive breakout candle close above/below the zone","Volume confirmation significantly increases breakout reliability","Stop: below breakout candle or opposite side of pattern","Target: measured move = height of the consolidation pattern"] },
    { icon:"fa-rotate", title:"Reversal / Rejection Strategy", body:"Enter when price rejects a key level with a strong confirmation candle pattern. High risk/reward potential but requires patience to wait for the right setup.", pts:["Wait for price to reach significant S/R level or swing extreme","Look for rejection pattern: pin bar, engulfing, or doji candle","Confirmation: RSI divergence + level confluence on multiple timeframes","Tight stop placed beyond the rejection wick extremity","Target: opposing structure level for high R:R outcome"] },
    { icon:"fa-percent", title:"Fibonacci Retracement Strategy", body:"Use Fibonacci levels to identify high-probability pullback entry zones within a clear trend. The 61.8% 'golden ratio' is historically the strongest level.", pts:["Draw Fibonacci from swing low to swing high in an uptrend","Wait for pullback to 38.2%, 50%, or 61.8% retracement levels","61.8% = Golden Zone — highest probability, most reliable level","Combine OB or FVG at Fibonacci levels for maximum confluence","Extensions at 127%, 161.8% provide high-quality profit targets"] },
  ],
  risk: [
    { icon:"fa-calculator", title:"Position Sizing Formula", body:"The single most critical skill in trading. Never risk more than 1-2% of your account per trade regardless of how confident you are about any particular setup.", pts:["Formula: (Account × Risk%) ÷ (Stop Loss pips × Pip Value)","$10,000 account, 1% risk = $100 maximum loss per trade","50 pip stop, $1/pip value → 2 mini lots is your position size","Adjust position size for every single trade based on stop distance","Consistency: apply same risk % on every trade without exception"] },
    { icon:"fa-scale-balanced", title:"Risk-Reward Ratio", body:"Minimum target of 1:2 R:R means you remain profitable even with only a 40% win rate. Over many trades, R:R determines profitability far more than win rate.", pts:["1:2 R:R = risk $100 to make $200 — 40% win rate is profitable","1:3 R:R strongly recommended for swing trades","Expectancy formula: (Win% × AvgWin) – (Loss% × AvgLoss)","Never move your stop loss in the wrong direction — discipline is non-negotiable","Cut losers quickly; let winners breathe to full target"] },
    { icon:"fa-chart-simple", title:"Drawdown Management", body:"A 50% drawdown requires a 100% gain just to recover your starting capital. Protect your account above everything else. Daily and monthly loss limits are non-negotiable rules.", pts:["Daily loss limit: 3% of account — stop trading completely when hit","Weekly limit: 6% — reassess strategy before resuming","Monthly limit: 10% — take a break, review journal, identify errors","If you lose 3 trades in a row → stop trading that day, review tomorrow"] },
  ],
  psychology: [
    { icon:"fa-brain", title:"Emotional Discipline", body:"Trading is 80% psychology and only 20% strategy. Your biggest enemy is your own mind. Emotions cause traders to violate their own rules at the worst possible moments.", pts:["FOMO (Fear Of Missing Out) = bad entries, chasing, poor R:R","Revenge trading after a loss = rapidly destroys accounts","Overconfidence after a winning streak = taking excessive risk","Keep a detailed journal to identify and systematically eliminate emotional patterns"] },
    { icon:"fa-heart", title:"Developing a Winning Mindset", body:"Accept losses as unavoidable business expenses. Focus completely on process consistency, not individual trade outcomes. Outcome is random; process is controllable.", pts:["Define your edge precisely — know exactly why and when you trade","Follow your trading plan 100% — no exceptions, no 'gut feelings'","Review every trade weekly — identify patterns in your mistakes","Detach emotionally from money — think in R multiples, not dollar amounts"] },
    { icon:"fa-dumbbell", title:"Building Trading Discipline", body:"Discipline is the application of your rules even when emotions scream to deviate. It's the single trait that separates profitable traders from unprofitable ones.", pts:["Write your trading plan and rules in detail — physical document","Trade smallest size when learning a new strategy or market","Set hard stop on daily losses — walk away, no exceptions","Meditation, exercise, and sleep dramatically improve trading performance"] },
  ],
  brokers: [
    { icon:"fa-building", title:"Choosing a Forex Broker", body:"Your broker is your business partner. A bad broker is unbeatable — regulation and execution quality are non-negotiable foundations.", pts:["Regulation: FCA, ASIC, CySEC, NFA — absolutely mandatory, verify it","Spread: major pairs should be 0–2 pips on ECN/raw accounts","Execution: fast fill, no requotes, minimal slippage on entries","Withdrawal test: withdraw a small amount first before depositing large sums","Customer support: responsive 24/7, ideally in your language"] },
    { icon:"fa-wallet", title:"Account Types Explained", body:"Different account types suit different trading styles, strategies, and capital sizes. Choose the right type for your level and goals.", pts:["Standard account: full lot sizes (100,000 units) — for funded traders","Mini account: 10,000 unit lots — suitable for learning with real capital","ECN/Raw Spread: direct market access, commission-based — best for scalpers","Demo account: mandatory first step — use for minimum 1 full month","PAMM/Copy trading: managed accounts — research manager's track record carefully"] },
  ],
  glossary: [
    { icon:"fa-book", title:"Essential Forex Terms A–M", body:"", pts:["ADX: Average Directional Index — measures trend strength 0–100","ATR: Average True Range — volatility measurement for stop sizing","Bid: price you sell at; Ask: price you buy at (spread is the difference)","BOS: Break of Structure — confirms trend continuation direction","CHoCH: Change of Character — signals potential trend reversal","EMA: Exponential Moving Average — more weight on recent price data","FVG: Fair Value Gap — price imbalance where one side wasn't filled","Fibonacci: natural mathematical ratios used to find S/R levels","FOMC: Federal Open Market Committee — controls US interest rates","Fundamental Analysis: economic factors driving currency supply/demand","HH/HL: Higher Highs/Higher Lows = uptrend market structure","Leverage: multiplier on your position size (amplifies profits AND losses)","Liquidity: ease of entering/exiting positions without market impact","LH/LL: Lower Highs/Lower Lows = downtrend market structure","Lot: unit of measurement (Standard=100,000 units of base currency)","MACD: Moving Average Convergence Divergence — trend & momentum indicator"] },
    { icon:"fa-book", title:"Essential Forex Terms N–Z", body:"", pts:["NFP: Non-Farm Payrolls — top-impact US economic release (1st Friday)","OB: Order Block — institutional price cluster, key S/R zone","OCO: One Cancels Other — paired order type for bracket trades","OBV: On Balance Volume — volume-based momentum indicator","Pip: smallest standard price movement (0.0001 for most pairs)","Price Action: chart analysis using raw price movement without indicators","R:R Ratio: Risk-to-Reward — aim for minimum 1:2 on every trade","RSI: Relative Strength Index 0–100 — momentum oscillator","Scalping: very short-term trading (seconds to minutes, many trades)","SL: Stop Loss order — mandatory protection on every trade","Slippage: difference between expected and actual fill price","Spread: Bid–Ask difference = the broker's primary revenue source","Swap: overnight interest charged or paid on held positions","TP: Take Profit order — auto-close at your target price","Trailing Stop: dynamic SL that moves with price as trade goes profitable","Volume: number of units traded in a given time period"] },
  ],
  positionsizing: [
    { icon:"fa-calculator", title:"The Position Sizing Formula — Step by Step", body:"Position sizing is the mathematical process that determines exactly how many lots to trade so that your dollar risk equals your planned risk amount. This calculation MUST be done before every single trade — no exceptions.", pts:["Formula: Lot Size = (Account Balance × Risk%) ÷ (Stop Loss Pips × Pip Value per lot)","Step 1: Determine your risk amount — e.g., $10,000 account × 2% = $200 max loss","Step 2: Measure your stop loss in pips from entry to the stop level","Step 3: Look up pip value for the pair ($10/pip for EUR/USD standard lot)","Step 4: $200 ÷ (50 pips × $10) = 0.40 standard lots (or 4 mini lots)","Step 5: Enter exactly that size — no rounding up because 'it looks like a good setup'","Always recalculate for every new trade — don't reuse old calculations"] },
    { icon:"fa-percent", title:"The 1–2% Risk Rule — Why It Matters", body:"Never risking more than 1–2% per trade is the rule that separates traders who survive long enough to become profitable from those who blow accounts in weeks. The math is unforgiving — understand it deeply.", pts:["With 2% risk: 10 consecutive losses = only 18% account drawdown","With 10% risk: 10 consecutive losses = 65% account wiped out (common pattern)","With 20% risk: 5 consecutive losses = account destroyed (happens constantly)","Even the best strategies have 5–10 consecutive losing streaks regularly","Professional funded traders typically risk 0.5–1% — not 2%","The 1–2% rule is not a suggestion — it is the foundation of trading survival","Adjust risk based on strategy quality: higher confluence setups = up to 2%; lower = 0.5–1%"] },
    { icon:"fa-scale-balanced", title:"Risk:Reward Ratio — The Mathematical Edge", body:"Your R:R ratio is arguably more important than your win rate. With a consistent 1:3 R:R, you can lose 75% of your trades and still be net profitable. Most retail traders ignore this completely.", pts:["Breakeven win rates by R:R: 1:1 = 50% | 1:2 = 34% | 1:3 = 25%","1:3 R:R with only 30% win rate = profitable trading system","Expectancy: (Win% × Avg Win R) – (Loss% × Avg Loss R) = edge per trade","Example: 40% win × 2.5R win – 60% loss × 1R loss = +0.4R per trade positive","Never enter a trade if the take profit doesn't offer at least 1:2 R:R","If a 1:2 R:R isn't available, skip the trade and wait for a better setup","Low R:R setups can make up volume in win rate but carry far higher ruin risk"] },
    { icon:"fa-arrows-split-up-and-left", title:"Structural Stop Loss Placement", body:"Stop losses must be placed based on market structure — not on how much money you want to risk. Place the stop where the trade is INVALIDATED, then calculate position size to match your risk. Never do it backwards.", pts:["Behind swing highs/lows: price breaking there means your analysis was wrong","Behind Order Blocks: if the OB fails, the trade idea is invalid","Beyond key S/R zones: price closing back through the zone invalidates entry","ATR method: 1.5× or 2× ATR from entry accounts for normal daily volatility","Round numbers: avoid placing stops at obvious round numbers (1.1000) — swept","Add 5–10 pip buffer beyond the structural level to account for spread + slippage","NEVER place a stop based on dollar amount first — structure determines stop, size adjusts"] },
    { icon:"fa-crosshairs", title:"Take Profit Strategies — Advanced Techniques", body:"How you exit profitable trades is as critical as entries. Many traders enter correctly but exit poorly — taking profits too early, or moving take profits further away out of greed. Define exit logic before entry.", pts:["Full exit at target: cleanest approach — set 1:2 or 1:3 TP and walk away","Partial exits: close 50% at 1:1 R:R, move stop to breakeven, let 50% run to 1:3+","Trailing stop: use ATR or swing high/low structure to trail stop as trade runs","Fibonacci extensions: 127.2%, 161.8% targets from the swing used for entry","Opposite structure: take profit at next major resistance (long) or support (short)","Avoid: moving TP further away because 'it might keep going' — this is greed","Sessions matter: close before major news if close to target; let run during volatility sessions"] },
    { icon:"fa-wallet", title:"Capital Management — Growing an Account Correctly", body:"Capital management is the higher-level framework above position sizing. It governs how your account grows (or declines) over time based on results, not predictions. Correct capital management compounds gains steadily.", pts:["Start with demo — minimum 1–3 months of profitable results before live capital","Live account size: start with only what you can afford to lose 100% of — always","Micro/mini accounts: trade 0.01–0.05 lots on small accounts — build the habit first","Compound growth: 5% monthly on $1,000 = $1,796 in 12 months (not gambling)","Withdraw profits regularly: lock in real gains rather than reinvesting everything indefinitely","Never add capital after losses to 'average down' — this is the fastest path to ruin","Scale up only AFTER consistent monthly profitability over 3–6 months minimum"] },
    { icon:"fa-chart-bar", title:"Account Size vs. Strategy Type", body:"Your account size should dictate which trading style is feasible. Small accounts face mathematical challenges — wider spreads eat more of the trade, minimum lot sizes limit sizing precision. Know your constraints.", pts:["Under $500: micro lots only (0.01–0.05), target 50–100 pip moves minimum","$500–$2,000: mini lots (0.05–0.2), suitable for swing and intraday trading","$2,000–$10,000: standard lot ranges feasible, intraday and swing fully accessible","$10,000+: full flexibility — scaling position sizing becomes precision tool","Scalping small accounts: spreads destroy profitability — avoid scalping under $2,000","Prop firm accounts: funded accounts allow larger size with firm's capital — strict risk rules apply","Always match strategy to account — don't scalp a $300 account with 5-pip targets"] },
    { icon:"fa-shield-halved", title:"Daily & Weekly Loss Limits — The Hard Stop", body:"Hard loss limits are non-negotiable rules you set before the trading day begins. They prevent small losing days from cascading into catastrophic account-destroying sessions driven by emotional revenge trading.", pts:["Daily loss limit: 3% of account — stop ALL trading the moment you hit it","Weekly loss limit: 6% — reassess and review strategy before resuming","Monthly limit: 10–12% — take a full break and deep journal review","After 3 consecutive stop-outs in a day: stop for the day, no exceptions","Reducing position size during drawdown: drop to 50% normal size after 5% drawdown","Resume full size only after recovering to breakeven or better","These limits must be WRITTEN DOWN and treated as law — not suggestions"] },
  ],
};

/* ============================================================
   BINARY OPTIONS TAB CONTENT DATA
============================================================ */
const BINARY_DATA = {
  strategies: [
    { icon:"fa-arrow-trend-up", title:"Trend Following Strategy", body:"Identify a strong trend with EMA 20 above EMA 50 (uptrend). Enter Call options only on pullbacks to support in an uptrend. Enter Put options only on rallies to resistance in a downtrend.", pts:["Use 5-min chart for entry signals with clear trend visible","EMA 20 > EMA 50 = uptrend → only trade Call options","Entry: bullish reversal candle at a clear support level in uptrend","Expiration: 10–15 minutes for trend-following trades","Never trade against the direction of the trend — ever","Avoid entering in the middle of a big move — wait for pullback to EMA"] },
    { icon:"fa-rotate", title:"RSI Reversal Strategy", body:"When RSI enters extreme overbought or oversold territory, wait for a divergence signal or confirming reversal candle before entering the option.", pts:["RSI settings: 14-period on 5-minute chart timeframe","Oversold RSI <30 + bullish reversal candle = CALL entry","Overbought RSI >70 + bearish reversal candle = PUT entry","Wait for RSI to cross back through the 30 or 70 level","RSI divergence: price makes new high but RSI doesn't = bearish divergence","Expiration: 5 minutes for quick RSI reversal trades"] },
    { icon:"fa-chart-line", title:"Support/Resistance Bounce Strategy", body:"Identify strong S/R zones on the 15-minute chart. Wait for price to reach the zone and show a clear rejection candle before entering. This is the most reliable binary strategy for beginners.", pts:["Use 15-min chart to identify significant S/R levels","Wait for price to reach the zone — patience is essential","Entry: pin bar or engulfing candle at the S/R zone only","Expiration: 15 minutes aligned with your analysis timeframe","R/S zones strengthen with each successful test — trade them","Combine with RSI confirmation for higher win rate on entries"] },
    { icon:"fa-bolt", title:"Breakout Strategy", body:"Identify a period of consolidation or a chart pattern. Enter a Call when price breaks above resistance, or a Put when it breaks below support with momentum.", pts:["Wait for 3+ candle consolidation to form a clear zone","Entry: breakout candle closes outside the consolidation zone","Volume or momentum confirmation before entering the option","Expiration: 10–15 minutes after the breakout candle","Avoid trading into major news events — breakouts often reverse","Best breakouts happen after long consolidation periods — more reliable"] },
    { icon:"fa-chart-bar", title:"Bollinger Band Strategy", body:"When price touches the outer Bollinger Bands with a reversal candle signal, enter the option expecting price to return to the middle band. Most effective in sideways, ranging markets.", pts:["Price touches upper band + bearish candle = PUT entry signal","Price touches lower band + bullish candle = CALL entry signal","Middle band (20 SMA) is the primary target in ranging markets","Do NOT use this in strongly trending markets — bands walk the trend","Bollinger Squeeze before breakout = enter in breakout direction","Expiry: 10-15 minutes for mean reversion to middle band"] },
    { icon:"fa-percent", title:"Fibonacci Retracement Binary Strategy", body:"Use Fibonacci retracements to identify high-probability pullback zones within a trend. The 61.8% golden ratio level is historically the most reliable for binary entries.", pts:["Draw Fibonacci from swing low to swing high in uptrend","Wait for price to pull back to 38.2%, 50%, or 61.8% levels","61.8% level = Golden Ratio — highest probability reversal zone","Enter CALL when price shows bullish reversal candle at Fibonacci level","Combine with support zone or EMA for maximum confluence signal","Expiry: minimum 10 minutes to allow the move to develop fully"] },
    { icon:"fa-clock", title:"Time-Based Strategy — Session Opening", body:"Trading session openings produce some of the most reliable directional moves in binary options. The London open (3AM EST) and New York open (8AM EST) create institutional momentum.", pts:["London Open (3AM EST): trade the directional break from Asian range","New York Open (8AM EST): strongest momentum of the trading day","Asian Range: identify high/low between 7PM-2AM for breakout reference","Strategy: enter option in direction of the break from previous session range","Time-based expiry: 15-30 minutes gives the move room to develop","Avoid last 30 minutes of NY session — liquidity drops, moves unreliable"] },
  ],
  technical: [
    { icon:"fa-chart-line", title:"Technical Analysis for Binary", body:"Technical analysis is the primary tool for binary options traders. Since timing is critical, clean technical setups on the right timeframe are essential.", pts:["Primary timeframe: 5-minute chart for most short-term binary trades","Trend filter: 15-minute chart for directional bias","Support and resistance: most reliable signal for binary entries","Candlestick patterns: hammer, pin bar, engulfing at key levels","Avoid indicators that lag — RSI and MACD can cause late entries","Always confirm entry on signal timeframe with higher timeframe trend"] },
    { icon:"fa-arrows-left-right", title:"Timeframe Alignment (MTF Analysis)", body:"Always confirm your trade direction on a higher timeframe before entering on the signal timeframe. Multi-timeframe alignment dramatically increases win rate.", pts:["15-min shows overall trend direction (bias timeframe)","5-min shows entry signal (execution timeframe)","1-min for precise entry timing only — not for analysis","Bullish on 15-min = only take Call signals on 5-min","Never take signals against your higher timeframe bias","Three timeframe rule: HTF bias + MTF setup + LTF entry timing"] },
    { icon:"fa-fire", title:"Candlestick Patterns for Binary", body:"Candlestick patterns provide high-probability directional signals when they appear at key levels. Context (location) is everything for binary trading.", pts:["Hammer at support = Call entry (strong bullish signal)","Shooting star at resistance = Put entry (strong bearish signal)","Doji at key level = potential reversal — wait for confirmation","Engulfing pattern at S/R = high-probability reversal entry","Always trade patterns at significant levels — not in the middle","Pattern strength: engulfing > pin bar > doji > marubozu — ranked"] },
    { icon:"fa-gauge", title:"Momentum Indicators for Binary", body:"Momentum indicators help confirm the strength and direction of a move before committing to a binary option. Never use them alone — always with price action confirmation.", pts:["RSI: oversold <30 = potential Call; overbought >70 = potential Put","MACD Crossover: signal line cross = potential directional momentum","Stochastic: %K crosses %D in extreme zone = entry timing signal","CCI: beyond ±100 = extreme reading, potential reversal zone","Best use: momentum indicator confirms price action signal already present","Never enter on indicator alone — wait for price confirmation candle"] },
    { icon:"fa-wave-square", title:"Moving Averages in Binary Trading", body:"Moving averages define trend direction and act as dynamic support/resistance. In binary options, they're most useful as trend filters — not as entry signals on their own.", pts:["EMA 20: fast trend — price above = short-term bullish bias for Calls","EMA 50: medium trend — crossover with EMA 20 = trend change signal","EMA 200: macro trend filter — most important single line on the chart","EMA cross (20 over 50): bullish signal — trade Calls only in that direction","Price bouncing from EMA 50: classic entry for trend continuation Calls","Multiple EMA alignment (20 > 50 > 200): strongest bullish confirmation"] },
  ],
  candles: [
    { icon:"fa-fire", title:"Key Bullish Candlestick Patterns", body:"These candlestick patterns signal potential upward moves. Use them at support levels or the end of downtrends for Call options.", pts:["Hammer: small body at top + long lower wick = buyers rejecting lower prices","Bullish Engulfing: large green candle engulfs previous red candle","Morning Star: 3-candle pattern — red, doji, green = strong reversal","Inverted Hammer: at support = buyers starting to take control","Marubozu: full candle with no wicks = very strong directional momentum","Piercing Line: green candle closes above midpoint of previous red candle"] },
    { icon:"fa-chart-bar", title:"Key Bearish Candlestick Patterns", body:"These patterns signal potential downward moves. Use them at resistance levels or the end of uptrends for Put options.", pts:["Shooting Star: small body at bottom + long upper wick = sellers rejecting","Bearish Engulfing: large red candle completely engulfs previous green candle","Evening Star: 3-candle reversal at top — green, doji, red","Hanging Man: looks like hammer but appears at the top of uptrend","Dark Cloud Cover: red candle closes below midpoint of previous green","Bearish Marubozu: full red candle with no wicks = extreme selling pressure"] },
    { icon:"fa-minus", title:"Doji Patterns — Indecision Signals", body:"Doji candles represent perfect balance between buyers and sellers. At key levels, they signal potential reversals when the next candle confirms direction.", pts:["Standard Doji: open = close, very small or no body","Long-legged Doji: very long wicks both sides = maximum indecision","Dragonfly Doji: long lower wick = potential bullish reversal at support","Gravestone Doji: long upper wick = potential bearish reversal at resistance","Always wait for the next candle to confirm doji reversal direction","Doji in trending market = likely pause only, not necessarily reversal signal"] },
    { icon:"fa-star", title:"Multi-Candle Patterns for Timing", body:"Multi-candle patterns are more reliable than single-candle patterns because they represent a full sequence of market behavior — not just a single moment in time.", pts:["Morning Star (3 candles): downtrend → small body → strong green = bullish","Evening Star (3 candles): uptrend → small body → strong red = bearish","Three White Soldiers: 3 consecutive green candles = strong bullish continuation","Three Black Crows: 3 consecutive red candles = strong bearish continuation","Inside Bar: second candle inside first = consolidation before breakout","The larger the pattern's timeframe, the more reliable the signal it produces"] },
  ],
  risk: [
    { icon:"fa-shield", title:"Binary Options Risk Management", body:"Binary options have a built-in fixed risk per trade, but poor money management can still destroy your account quickly. Fixed rules are non-negotiable — treat them like law.", pts:["Never risk more than 1-2% of account balance on any single trade","Maximum 5 trades per day to maintain focus and emotional discipline","Stop after 3 consecutive losses — take a break and review analysis","Never increase bet size to recover losses — Martingale destroys accounts","Track every trade including time, asset, expiry, and reasoning each time","Daily loss limit: if you lose 5% of account in one day, stop trading immediately"] },
    { icon:"fa-calculator", title:"Bankroll Management Rules", body:"Your bankroll management rules are as important as your entry strategy. Without discipline in money management, even a perfect strategy will eventually fail.", pts:["Starting bankroll: only deposit what you can completely afford to lose","Conservative: 1% per trade = 100 losses to blow account (very safe)","Moderate: 2% per trade = 50 consecutive losses to lose account","Aggressive: 3%+ per trade = high risk, not recommended for beginners","Profit target per day: 5-10% of session bankroll, then stop trading","End each day by withdrawing profits — separate trading capital from gains"] },
    { icon:"fa-chart-pie", title:"Expected Value and Win Rate Math", body:"Understanding the math behind binary trading is critical. Your win rate must exceed the break-even point determined by payout percentage — this is non-negotiable.", pts:["Break-even formula: 100 ÷ (100 + payout%) = required win rate","Example: 80% payout → 100 ÷ 180 = 55.6% win rate needed to break even","Example: 90% payout → 100 ÷ 190 = 52.6% minimum win rate needed","Most retail binary traders win 45-52% — why most lose over time mathematically","To be profitable: win rate must be 5%+ above break-even point minimum","Test your strategy on 50+ demo trades before calculating real win rate"] },
    { icon:"fa-ban", title:"The Martingale Trap — Avoid at All Costs", body:"The Martingale system doubles bet size after every loss, aiming to recover with one win. It is mathematically guaranteed to destroy your account given enough time.", pts:["$10 → $20 → $40 → $80 → $160 → $320 after just 5 consecutive losses","A 7-loss streak requires $1,280 to recover a $10 original trade","Consecutive losses happen regularly in any trading strategy — guaranteed","Martingale doesn't change the underlying win rate — it only increases exposure","No amount of capital is safe from Martingale — it always wins eventually","The only safe approach: fixed % of bankroll per trade, no exceptions ever"] },
    { icon:"fa-triangle-exclamation", title:"Risk Warning — Read This First", body:"Binary options carry substantial risk. Understand all risks before trading. This section covers what most binary traders learn the hard way.", pts:["Most retail binary traders lose money — understand why before starting","Payout % is less than 100% = mathematical edge belongs to the broker","Broker selection: only use regulated brokers (CySEC, FCA, ASIC)","Avoid signals services and 'guaranteed profit' schemes — they are scams","Start with demo for minimum 60 days before using real capital ever","Binary options are banned in some countries — verify your local regulations"] },
  ],
  scalping: [
    { icon:"fa-bolt", title:"Binary Options Scalping Basics", body:"Short expiry binary scalping (30 seconds to 5 minutes) requires extreme focus, a fast platform, and a very clear signal. It is the highest-risk binary approach and is not recommended for beginners.", pts:["Only trade during high-liquidity sessions: London and New York open","Use 1-minute chart for signal timing with 5-min trend filter","Trade only the strongest, cleanest technical signals available","Maximum 30 second to 5 minute expiries for scalping strategy","Require at least 2-3 confirming factors before every entry signal","Platform must execute instantly — any delay makes scalping impossible"] },
    { icon:"fa-gauge-high", title:"Scalping Entry Criteria", body:"Scalping requires very strict entry criteria because small errors compound quickly over many trades. Every entry needs multiple confirming factors with no exceptions.", pts:["Price must be at a significant S/R level from higher timeframe","Momentum indicator (RSI/Stochastic) must confirm direction strongly","Clear candlestick reversal signal visible on the entry timeframe","Volume or spread must be normal — avoid news event periods completely","Maximum 1-2 scalp trades per hour to maintain sharp focus and discipline","Stop scalping entirely if you hit 3 losses in a single scalping session"] },
    { icon:"fa-brain", title:"The Psychological Demands of Scalping", body:"Scalping is psychologically the most demanding binary style. The high frequency of decisions and rapid outcomes makes emotional discipline exponentially harder to maintain.", pts:["Each trade outcome is immediate — emotional recovery between trades is minimal","Winning streak can lead to overconfidence and position size increases","Losing streak creates pressure to 'recover' — revenge trading risk is highest","Set strict session time limit: maximum 2 hours of focused scalping per day","Take 15-minute break after every 5 trades regardless of outcome","Never scalp when tired, stressed, or emotionally compromised — step away"] },
  ],
  news: [
    { icon:"fa-newspaper", title:"Trading Binary Options on News", body:"High-impact economic news creates strong directional moves that binary options can capture. Timing and direction analysis are critical for news trading success.", pts:["Focus on HIGH impact news only: NFP, CPI, FOMC, ECB decisions","Use economic calendar (ForexFactory.com) to track all upcoming releases","Enter 5–10 minutes after news release once direction is confirmed clear","Avoid entering in the first 1-2 minutes — extreme volatility then causes wicks","Expiry: 5–15 minutes after the initial directional move establishes","Never enter before news release — unpredictable spike risk is too high"] },
    { icon:"fa-calendar", title:"Key Economic Events for Binary", body:"Not all news events are equal. These high-impact releases consistently create strong moves that binary options strategies can exploit effectively.", pts:["NFP (First Friday of month): most important USD news release globally","CPI (Monthly): inflation data drives Fed rate expectations significantly","FOMC Decision (8x per year): biggest single USD volatility event","ECB Meeting: major EUR volatility — can move 100+ pips quickly","PMI data: leading economic indicator, often underestimated by traders","Central bank speeches (Lagarde, Powell): can move markets 50-100 pips instantly"] },
    { icon:"fa-chart-line", title:"Pre-News Setup Strategy", body:"The period 30-60 minutes before a major news release often sees price consolidate into a tight range. This creates a setup for a post-release breakout trade with clear boundaries.", pts:["Identify consolidation zone 30-60 minutes before major release","Mark the high and low of the pre-news consolidation zone clearly","After release: wait for price to break one side decisively and confirm","Enter option in the direction of the confirmed breakout — not before","Expiry: 10-15 minutes for the breakout momentum to fully develop","Expected move: large news events can easily produce 100-200 pip directional moves"] },
  ],
  mistakes: [
    { icon:"fa-skull", title:"The Most Common Costly Mistakes", body:"These are the mistakes that consistently destroy binary trading accounts. Learn them before they cost you real money.", pts:["Overtrading: taking 20+ trades per day without quality signals present","Martingale: doubling bet after loss — destroys accounts quickly and reliably","Ignoring trend: entering against the clear market direction on timeframe","No trade journal: repeating the same mistakes without any awareness","Chasing losses: increasing risk after losing streaks — purely emotional trading","Trading without analysis: entering based on gut feeling, not defined criteria"] },
    { icon:"fa-ban", title:"Psychological Mistakes to Avoid", body:"The psychological mistakes are more damaging than strategic mistakes because they repeat consistently and scale with your emotional state — compounding losses.", pts:["FOMO: entering late on a move that has already run its course","Revenge trading: entering angry trades after losses to recover quickly","Overconfidence: increasing bet size dramatically after a winning streak","Panic: exiting too early or not following the exit strategy rules","Bias: only seeing signals in one direction due to wishful thinking","Euphoria after wins: biggest risk of rule-breaking comes after winning days"] },
    { icon:"fa-clock", title:"Timing and Expiry Mistakes", body:"Choosing the wrong expiry time for your strategy is one of the most common and easily correctable mistakes in binary options trading.", pts:["Too short expiry: 30-60 second trades are gambling, not strategy execution","Too long expiry: overnight trades expose you to unpredictable gap risk","Mismatched timeframe: trading 5-minute signals with 1-minute expiry too fast","News exposure: holding options through major news events without intent","End-of-session decay: avoid entering options in last 30 minutes of sessions","Golden rule: expiry = minimum 3× the length of your chart candle timeframe"] },
    { icon:"fa-building", title:"Broker and Platform Mistakes", body:"Choosing the wrong broker or not understanding your platform's features leads to avoidable losses that have nothing to do with your trading skill.", pts:["Unregulated broker: most common reason traders can't withdraw profits","Bonus trap: accepting deposit bonuses with impossible withdrawal requirements","Platform delays: entering on delayed prices means your analysis is invalid","Assuming accuracy: broker prices may differ from real market — check always","Overlarge minimum: never choose a broker that forces you above your 1-2% rule","Not testing withdrawal: always test a small withdrawal before funding heavily"] },
  ],
  psychology: [
    { icon:"fa-brain", title:"Binary Trading Psychology — The Foundation", body:"Your mental state directly determines your results. No strategy works when your psychology is broken. Psychological edge is the ultimate competitive advantage in binary trading.", pts:["Accept that losses are inevitable and part of every profitable strategy","Each trade is statistically independent — previous results don't predict next","Set daily loss limit and enforce it with absolute discipline every day","Take regular breaks — trading fatigue causes costly impulsive decisions","Keep a detailed journal of emotional state alongside trade results","Goal: follow the process perfectly — not win every single trade"] },
    { icon:"fa-heart", title:"Building Mental Resilience", body:"Successful binary trading requires a resilient mindset that treats every loss as learning data, not as a personal failure or financial catastrophe.", pts:["Reframe losses: 'I paid $X for this learning data and trade experience'","Process-focus: judge yourself on following your rules, not trade outcome","Reduce screen time: overmonitoring causes emotional interference in decisions","Celebrate discipline: reward yourself for following rules, not just winning","Regular exercise and adequate sleep measurably improve trading performance","Meditation and breathing exercises before sessions reduce emotional reactivity"] },
    { icon:"fa-scale-balanced", title:"The Six Stages of Binary Trader Psychology", body:"Most traders go through predictable psychological stages. Understanding where you are helps you avoid the costly mistakes each stage creates.", pts:["Stage 1 — Unconscious Incompetence: 'This is easy, I can predict price direction'","Stage 2 — Conscious Incompetence: 'Why do I keep losing? Something is wrong'","Stage 3 — Giving Up or Getting Serious: critical fork in the road for most","Stage 4 — Learning: studying risk management, strategy, and discipline systems","Stage 5 — Conscious Competence: following rules works — but it requires effort","Stage 6 — Unconscious Competence: professional level — rules are automatic habits"] },
    { icon:"fa-arrows-rotate", title:"Developing a Pre-Trade Routine", body:"Professional traders have a pre-trade routine that puts them in the right mental state before they take any trade. Creating yours dramatically improves performance.", pts:["Before each session: review your trading plan and rules for the day","Check economic calendar: identify news events that could affect your pairs","Market analysis: identify key S/R levels on higher timeframe charts","Mindset check: 'Am I calm, focused, and in the right emotional state?'","If 'no' to any rule-check: do not trade today — wait until conditions are right","Post-session: journal results, note emotions, identify improvements for next"] },
  ],
  brokers: [
    { icon:"fa-building", title:"How to Choose a Binary Broker", body:"Choosing the right broker is the foundation of binary trading success. A dishonest or unregulated broker makes profitable trading impossible regardless of your skill level.", pts:["Regulation is mandatory: CySEC, FCA, ASIC — verify on regulator's website directly","Payout percentage: minimum 80%, prefer 85%+ for mathematical viability","Demo account: essential for testing strategy without risking real capital","Withdrawal speed: test withdrawal before depositing significant funds","Platform stability: must be fast, reliable with no execution manipulation","Customer support: 24/7 multilingual support available when needed"] },
    { icon:"fa-list-check", title:"Broker Red Flags to Avoid", body:"These warning signs indicate an untrustworthy or scam broker. Avoid any broker showing these characteristics — no exceptions under any circumstances.", pts:["No clear regulation or unverifiable offshore license (biggest red flag)","Bonus with impossible withdrawal requirements attached — always avoid these","Pressure to deposit more money or 'account managers' calling repeatedly","Withdrawal problems or delays beyond 5 business days without explanation","Unusually high payouts (95%+) that seem too good — often manipulated platform","Fake reviews and testimonials — verify on independent review sites only"] },
    { icon:"fa-globe", title:"Top Regulated Binary Option Platforms", body:"These platforms have established regulatory compliance and better reputations in the binary options industry. Always verify current regulation status before depositing.", pts:["Deriv (formerly Binary.com): regulated, established, wide asset selection","Nadex: US-regulated exchange, real exchange-based binary options trading","Interactive Brokers: for exchange-listed options (not OTC binary)","Always verify current regulatory status — regulation can change over time","Check CySEC, FCA websites directly for current registration status","Never rely on broker's own claims of regulation — verify independently"] },
  ],
  glossary: [
    { icon:"fa-book", title:"Binary Options Terms", body:"Complete glossary of binary options terminology for beginners and intermediate traders.", pts:["At-the-Money (ATM): price equals strike price at entry — usually a push/refund","Call Option: bet that price will be HIGHER at expiry than entry price","Deep In-the-Money: option is significantly profitable before expiry time","Deep Out-of-the-Money: option is significantly losing before expiry time","Expiry Time: the moment the option closes and outcome is determined","In-the-Money (ITM): option is profitable (Call = price above entry price)","Out-of-the-Money (OTM): option is losing (Call = price below entry price)","Payout: the fixed percentage you win if option expires in-the-money","Put Option: bet that price will be LOWER at expiry than entry price","Strike Price: the price level at which option outcome is determined","Touch Option: profit if price touches target level before expiry time","Boundary Option: profit if price stays within OR breaks a defined range","Roll Over: extend expiry time of option (usually costs an extra fee)","Sell Back: close option early for partial payout before full expiry","Martingale: doubling bet size after each loss (extremely dangerous method)","Bankroll: total capital allocated specifically for binary options trading","Win Rate: percentage of trades that expire in-the-money over a sample","Expectancy: (Win% × Avg Win) - (Loss% × Avg Loss) = edge per trade"] },
  ],
};

/* ============================================================
   TAB CONTENT RENDERER
============================================================ */
function makeCards(data) {
  return `<div class="content-grid">${data.map(d => `
    <div class="content-card">
      <h3><i class="fa-solid ${d.icon}"></i> ${d.title}</h3>
      ${d.body ? `<p>${d.body}</p>` : ""}
      <div class="key-pts"><strong>Key Points:</strong><ul>${d.pts.map(p => `<li>${p}</li>`).join("")}</ul></div>
    </div>`).join("")}</div>`;
}

function renderForexTab(key, el) {
  const data = FOREX_DATA[key];
  if (!data) { el.innerHTML = `<p style="color:var(--t3);padding:20px;">Content for this section is loading...</p>`; return; }
  if (Array.isArray(data)) { el.innerHTML = makeCards(data); return; }
  if (data.cards) { el.innerHTML = renderAcadCard(data); return; }
  el.innerHTML = makeCards(data);
}

function renderBinaryTab(key, el) {
  const data = BINARY_DATA[key];
  if (data) el.innerHTML = makeCards(data);
  else el.innerHTML = `<p style="color:var(--t3);padding:20px;">Content for this section is loading...</p>`;
}

/* ============================================================
   ACADEMY MODULES
============================================================ */
const ACADEMY_DATA = {
  structure: {
    title: "Market Structure",
    icon: "fa-sitemap",
    intro: "Market structure is the absolute foundation of all technical analysis. Before any indicator or strategy can work, you must understand how price moves and why.",
    path: ["What is Structure?", "Uptrend/Downtrend", "BOS & CHoCH", "Multi-Timeframe"],
    cards: [
      { title:"Understanding Market Structure", icon:"fa-sitemap", body:"Market structure is the foundation of all technical analysis. Price moves in a series of swings creating patterns of higher highs/lows (uptrend) or lower highs/lows (downtrend). Reading structure correctly determines your trading bias before anything else.", example:"On EUR/USD 4H chart: if price creates HH at 1.0900, HL at 1.0830, then another HH at 1.0960 — that's an uptrend. Your bias is BUY only. Do not sell until structure breaks.", pts:["Uptrend: Higher Highs (HH) + Higher Lows (HL) — buy bias only","Downtrend: Lower Highs (LH) + Lower Lows (LL) — sell bias only","Ranging: Equal highs and lows — fade the extremes, no trend trades","Always identify structure on the HIGHER timeframe FIRST — this is non-negotiable","Structure is defined by closes, not wicks — use candle closes for accuracy"], tip:"Start every analysis session by asking: 'What is the 4H structure right now?' That answer defines your trading bias for the day." },
      { title:"Break of Structure (BOS)", icon:"fa-arrows-split-up-and-left", body:"A Break of Structure occurs when price convincingly breaks through a previous swing high (bullish BOS) or swing low (bearish BOS). This confirms trend continuation in the direction of the break.", example:"Price is in uptrend, recent HH was at 1.0900. Price pulls back, forms a HL at 1.0850, then pushes up and CLOSES above 1.0900. This is a Bullish BOS — trend continues UP.", pts:["Bullish BOS: price CLOSES above previous Higher High — trend continues","Bearish BOS: price CLOSES below previous Lower Low — trend continues","BOS = institutional confirmation that the trend has more momentum","Wait for candle CLOSE beyond the level — wicks alone don't count","After BOS, previous resistance becomes support — watch for pullback entry"], warning:"Never confuse a wick pierce with a BOS. Only a full candle close beyond the level counts as a genuine Break of Structure." },
      { title:"Change of Character (CHoCH)", icon:"fa-rotate", body:"A Change of Character is the first signal that the current trend may be reversing. It occurs when price breaks the opposing side of the structure — the first warning sign of a potential trend change.", example:"In a downtrend (LH/LL pattern), if price forms a LL at 1.0750 then pushes up and CLOSES above the most recent LH at 1.0820 — that's a Bullish CHoCH. First signal the downtrend may be ending.", pts:["Bullish CHoCH: in a downtrend, price closes ABOVE a recent Lower High","Bearish CHoCH: in an uptrend, price closes BELOW a recent Higher Low","CHoCH ≠ confirmed reversal — it is the FIRST WARNING only","First CHoCH = caution signal; second CHoCH = higher probability reversal","After CHoCH, wait for a new BOS in the new direction before trading it"], tip:"CHoCH is where smart traders start watching for reversal setups. But don't enter on CHoCH alone — wait for confirmation BOS in the new direction first." },
      { title:"Multi-Timeframe Analysis (MTF)", icon:"fa-layer-group", body:"Structure on higher timeframes is significantly more important than lower timeframes. Each timeframe gives a different perspective. The hierarchy: Daily sets bias, 4H refines, 1H confirms, 15M/5M times the entry.", example:"Daily: uptrend. 4H: uptrend, pulling back to support. 1H: showing bullish CHoCH after pullback. 5M: entry candle forms. This top-down alignment creates the highest probability setups.", pts:["Daily chart: determines the overall directional bias — never trade against it","4H chart: identifies the swing trend and key structure levels","1H chart: entry confirmation — look for CHoCH/BOS in HTF direction","15M/5M: precision entry timing and exact stop loss placement","Alignment = all timeframes agree → highest probability trade setup"], tip:"90% of your analysis should be on Daily and 4H. Only drop to 15M/5M for precise entry timing once you know your direction from higher timeframes." }
    ]
  },
  liquidity: {
    title: "Liquidity Concepts",
    icon: "fa-water",
    intro: "Understanding liquidity is how you see the market through institutional eyes. Banks and funds move billions — they need massive liquidity to fill positions, and they create predictable patterns while seeking it.",
    path: ["What is Liquidity?", "Liquidity Pools", "Stop Hunts", "Trading Sweeps"],
    cards: [
      { title:"What is Liquidity?", icon:"fa-water", body:"Liquidity refers to the concentration of buy or sell orders at specific price levels. Institutional traders (banks, hedge funds) need enormous order flow to fill their positions — retail stop losses create that supply. This creates predictable price behavior.", example:"If 1,000 retail traders have buy stops above a resistance level at 1.0900, there's a large pool of buy orders there. Institutions will push price through 1.0900 to trigger those stops, fill their sell orders against the triggered buys, then reverse price DOWN.", pts:["Retail stop losses CREATE the liquidity that institutions need to fill","Buy stops cluster above equal highs, swing highs, and resistance levels","Sell stops cluster below equal lows, swing lows, and support levels","The more obvious a level looks, the more liquidity clusters there","This is why obvious support/resistance levels often get broken briefly before reversing"] },
      { title:"Identifying Liquidity Pools", icon:"fa-circle-dot", body:"Liquidity pools are zones where significant order clustering exists. Learning to identify them helps you anticipate where price will move BEFORE it happens — you stop being the stop that gets hunted.", example:"On GBP/USD, if price forms double tops at exactly 1.2750 twice, there's a massive pool of buy stops above 1.2750. Expect price to sweep above 1.2750, trigger all those stops, then reverse. This is predictable.", pts:["Equal Highs: two or more swing highs at same level = buy stop pool above","Equal Lows: two or more swing lows at same level = sell stop pool below","Trendlines: obvious trendlines attract stop clusters on both sides","Previous day High/Low: critical institutional reference levels with stop clusters","Round numbers (1.0900, 1.1000): retail orders cluster at psychological levels"], tip:"When you see equal highs/lows forming, don't set your stop there. Expect price to sweep those levels first — place stops beyond the likely sweep zone." },
      { title:"Stop Hunts & Liquidity Sweeps", icon:"fa-fish", body:"A liquidity sweep (stop hunt) occurs when price temporarily moves beyond a key level to trigger the stops clustered there. Institutions use the triggered stop orders as their order flow to fill massive positions, then price sharply reverses.", example:"Gold approaches a major double-bottom at 2630. Price drops below 2630 to 2618, triggering all sell stops below. Institutions buy against those sell stops to fill long positions. Gold then reverses strongly upward from 2618 — a perfect sweep and reversal entry.", pts:["Step 1: Price approaches the liquidity pool (equal highs/lows)","Step 2: Price breaks through the level — stops are triggered","Step 3: Institutions fill their orders using the triggered stop flow","Step 4: Price rapidly reverses away from the sweep level","The sweep candle is often a strong pin bar or inverted hammer — identify it"], warning:"Not every level break is a liquidity sweep. True sweeps are fast, aggressive moves that quickly reverse. If price breaks a level and continues, that's a breakout — not a sweep." },
      { title:"Trading Liquidity Sweeps", icon:"fa-crosshairs", body:"Trading liquidity sweeps is one of the highest-probability setups in ICT methodology. The sequence is clear, repeatable, and logical. Master this and you understand how institutions actually move price.", example:"USD/JPY at double-bottom support (142.50). Price sweeps below to 142.20. You see a strong bullish engulfing candle close above 142.50. Entry: 142.55. Stop: 142.05 (below the sweep wick). Target: 143.50 (opposing liquidity pool). R:R = 1:2.", pts:["Step 1: Identify and mark the liquidity pool level clearly on chart","Step 2: Wait — do not predict, just observe and be patient","Step 3: Price sweeps below/above the pool level to trigger stops","Step 4: Look for reversal confirmation candle (engulfing, pin bar, doji)","Step 5: Enter on close of confirmation candle, stop beyond sweep wick","Target: opposing liquidity pool on the same timeframe for clean R:R"], tip:"The best sweeps happen at KEY higher timeframe levels — daily or 4H swing points. Intraday minor level sweeps are lower probability. Always qualify the level by timeframe." }
    ]
  },
  candles: {
    title: "Candlestick Mastery",
    icon: "fa-fire",
    intro: "Every candlestick is a complete story of the battle between buyers and sellers. Learning to read candles fluently is the most fundamental visual skill in all of trading.",
    path: ["Reading Candles", "Bullish Reversals", "Bearish Reversals", "Continuation Patterns"],
    cards: [
      { title:"Reading Candlesticks", icon:"fa-fire", body:"Every candlestick tells the complete story of the battle between buyers and sellers during that time period. The body, wicks, and relative size all communicate different information about market sentiment and momentum.", example:"A candle with a very long lower wick and tiny body at the top tells you: sellers pushed price far down, but buyers aggressively bought back and closed price near the high. Buyers won this period — bullish signal.", pts:["Body: represents the distance between the OPEN and CLOSE of the period","Green/White body: closed HIGHER than open — buyers won the period","Red/Black body: closed LOWER than open — sellers won the period","Upper wick: how high buyers pushed before sellers rejected back down","Lower wick: how low sellers pushed before buyers bought back up","Small body + long wick = rejection — strong signal at S/R levels"], tip:"Size matters. A tiny red candle on an uptrend means sellers are weak. A giant red engulfing candle means sellers are very strong. Always consider relative candle size." },
      { title:"Bullish Reversal Patterns", icon:"fa-arrow-trend-up", body:"These patterns at support levels signal potential upward reversal. They are most powerful when they appear after a downtrend and at significant support zones — location amplifies every candle pattern signal.", example:"EUR/USD in downtrend hits major support at 1.0800. A hammer candle forms: small body at the top with a long lower wick showing strong buyer rejection. Next candle closes green. This is a high-probability long setup at support.", pts:["Hammer: small body at top, long lower wick at SUPPORT (not random location)","Bullish Engulfing: large green candle completely covers the previous red candle","Morning Star: 3-candle pattern — red, small doji, large green (strong reversal)","Inverted Hammer: long upper wick at support — buyers testing resistance","Dragonfly Doji: open/close at top, long lower wick — very strong rejection"], warning:"Candle patterns only have meaning at KEY levels. A hammer in the middle of a range means nothing. A hammer at major 4H support after a bearish trend = high probability setup." },
      { title:"Bearish Reversal Patterns", icon:"fa-arrow-trend-down", body:"These patterns at resistance levels signal potential downward reversal. Context is everything — they are most powerful after an uptrend and at significant resistance zones with confluence from higher timeframes.", example:"GBP/USD rallies to major 4H resistance at 1.2900. A shooting star forms: small body at bottom with a long upper wick. Sellers rejected price aggressively from 1.2900. Short entry on next candle open with stop above the wick.", pts:["Shooting Star: small body at bottom, long upper wick at RESISTANCE level","Bearish Engulfing: large red candle completely covers the previous green candle","Evening Star: 3-candle reversal — green, small doji, large red (top pattern)","Hanging Man: looks like hammer BUT appears after an uptrend at resistance","Gravestone Doji: open/close at bottom, long upper wick — very strong rejection"], tip:"The Bearish Engulfing is the most reliable bearish reversal pattern when it appears at a key resistance level after 3+ consecutive bullish candles. It shows decisive seller dominance." },
      { title:"Continuation Patterns", icon:"fa-arrows-left-right", body:"Continuation candlestick patterns signal that the current trend will persist after a brief pause. These patterns appear during consolidations or pullbacks within a trend — they tell you the pause is temporary.", example:"In a strong USD/JPY uptrend, price pauses and forms 3 small inside bars (consolidating). The 4th candle breaks strongly upward with a large green body. This is bullish continuation — the uptrend resumes.", pts:["Three White Soldiers: 3 consecutive green candles with higher closes = strong uptrend","Three Black Crows: 3 consecutive red candles with lower closes = strong downtrend","Inside Bar: entire range fits inside previous candle — consolidation before breakout","Marubozu: full body candle, no wicks whatsoever — maximum directional conviction","Spinning Top: small body, equal wicks = temporary balance, not reversal"], tip:"The Inside Bar is excellent for breakout entries. When you see price consolidating inside a previous candle near a key level, prepare for a breakout entry in the trend direction." }
    ]
  },
  patterns: {
    title: "Chart Patterns",
    icon: "fa-diagram-project",
    intro: "Chart patterns are recurring formations created by price action that have predictable breakout directions. They represent the psychological battle between bulls and bears playing out visually on the chart.",
    path: ["Reversal Patterns", "Continuation Patterns", "Entries & Targets", "Common Mistakes"],
    cards: [
      { title:"Head & Shoulders (Reversal)", icon:"fa-person", body:"The Head & Shoulders is one of the most reliable reversal patterns in technical analysis. It forms at the top of an uptrend (bearish) or bottom of a downtrend (inverse H&S = bullish). It signals a major trend change.", example:"GBP/USD uptrend. Left shoulder high at 1.2800. Head high at 1.2950. Right shoulder high at 1.2820 (lower than head). Neckline connects the two swing lows (~1.2700). Price breaks below neckline → SELL. Target: neckline minus head distance = ~1.2450.", pts:["Left shoulder: normal rally, then pullback to neckline support","Head: highest point of the pattern — shows exhausted buying momentum","Right shoulder: another rally but LOWER than the head (buyers weakening)","Neckline: connects the two pullback lows — the critical decision line","Breakout: price closes below neckline = confirmed bearish reversal signal","Target: measure head height from neckline, project that distance down"], warning:"A right shoulder that forms HIGHER than the left shoulder invalidates the pattern. The right shoulder must be lower than the head for confirmation." },
      { title:"Double Top & Double Bottom", icon:"fa-equals", body:"Double tops and bottoms are among the most common reversal patterns. They show that price tested a level twice but failed both times, indicating strong supply (double top) or demand (double bottom) at that level.", example:"Gold forms double top: rallies to $2680, pulls back to $2640 (neckline), rallies again to $2678 (within a few dollars of first top), then reverses. Break of $2640 neckline = SELL. Target = $2600 ($40 below neckline, equal to the pattern height).", pts:["Double Top: two peaks at same level — sellers defended the zone both times","Double Bottom: two troughs at same level — buyers defended the zone both times","Confirmation: only confirmed when neckline breaks with strong close","The best double tops/bottoms have a significant distance (5%+) between the two tests","Always wait for neckline BREAK before entering — many fail at the second touch","Volume often decreases on the second peak/trough, confirming the reversal"], tip:"Double bottoms at major daily support levels are the most powerful buy setups in technical analysis. The combination of daily support + double bottom pattern = extremely high probability." },
      { title:"Triangles & Wedges", icon:"fa-play", body:"Triangles and wedges are consolidation patterns where price compresses between converging trendlines. The breakout direction determines your trade. Triangles can break either way; wedges typically break opposite to the wedge direction.", example:"EUR/USD forms a descending wedge in an uptrend (lower highs and lower lows converging). Despite the pattern looking bearish, descending wedges typically BREAK UPWARD. Wait for the break above the upper trendline for a long entry.", pts:["Symmetrical Triangle: equal compression — break in either direction, wait for it","Ascending Triangle: horizontal resistance, rising support — usually breaks UP","Descending Triangle: rising resistance, horizontal support — usually breaks DOWN","Rising Wedge: both lines rising but converging — typically breaks DOWN (bearish)","Falling Wedge: both lines falling and converging — typically breaks UP (bullish)","The longer the compression in the pattern, the stronger the eventual breakout"], tip:"Triangles formed on 4H or Daily timeframes produce the most reliable breakouts. Small triangles on 5-minute charts have lower probability. Trade the bigger picture." },
      { title:"Flags & Pennants (Continuation)", icon:"fa-flag", body:"Flags and pennants are short-term consolidation patterns that appear after a strong move (the flagpole). They represent a brief pause before the trend continues. These are among the most reliable continuation patterns available.", example:"BTC/USDT surges from 65,000 to 70,000 in 3 days (flagpole). Price then consolidates in a tight sideways range for 5 days between 68,500–70,000 (flag). Breakout above 70,000 = long entry. Target = 75,000 (flagpole height added to breakout point).", pts:["Flag: rectangular consolidation after strong move, slightly against trend direction","Pennant: small symmetrical triangle after strong move — very tight compression","Both patterns measure the same way: add flagpole length to breakout point","Ideal flag: consolidates 30-50% of the flagpole length then breaks out","Volume: should decrease during flag formation, then spike on breakout","Time: flags should resolve within 1–4 weeks — longer = pattern failure risk"], tip:"High and tight flags — where price barely pulls back after a strong move — are the most powerful flag patterns. The smaller the pullback, the stronger the underlying momentum." }
    ]
  },
  technical: {
    title: "Technical Analysis",
    icon: "fa-chart-line",
    intro: "Technical analysis is the study of price action and chart patterns to forecast future price movements. It is based on the principle that all known information is reflected in price, and history tends to repeat itself.",
    path: ["Support & Resistance", "Trendlines", "Fibonacci", "Multi-Timeframe Application"],
    cards: [
      { title:"Support & Resistance Levels", icon:"fa-layer-group", body:"Support and resistance are the most fundamental concepts in technical analysis. Support is a price zone where buying pressure has previously overcome selling pressure. Resistance is the opposite. These zones represent the collective memory of the market.", example:"EUR/USD bounced from 1.0800 three times over 6 months. Each time price approached 1.0800, buyers stepped in aggressively. This makes 1.0800 a MAJOR support zone. The more times a level is tested without breaking, the more significant it becomes — until it breaks.", pts:["Support: zone where demand exceeded supply historically — price bounced up","Resistance: zone where supply exceeded demand historically — price rejected down","Rule of 3: a level tested 3+ times is considered very significant","Role reversal: broken support BECOMES resistance (and vice versa)","The older and more tested a level, the more significant it is","Levels from Daily/Weekly timeframe are much stronger than hourly levels"], tip:"Draw your S/R levels as ZONES, not precise lines. Price rarely hits exact levels. Draw a zone encompassing the body closes and wicks around that area — that's your true level." },
      { title:"Trendlines & Channels", icon:"fa-chart-line", body:"Trendlines connect successive swing highs (downtrend) or swing lows (uptrend) to visualize the direction and angle of a trend. Channels add a parallel line to create a range the price typically stays within.", example:"In a GBP/USD uptrend, connect the first HL at 1.2500 with the second HL at 1.2650. This gives you an ascending trendline. Price respecting this line 3 times confirms its validity. A touch with a bullish candle = buy entry. Break below = trend change warning.", pts:["Valid trendline needs minimum 3 touch points to be considered significant","Steeper angle (>60°): unsustainable, expect breakdown — don't trade it","Moderate angle (30-45°): healthy trend, trade pullbacks to the trendline","Flat channel: ranging market — buy support, sell resistance","Trendline break: significant signal, but wait for retest before entering","Combine trendlines with S/R levels for highest confluence entries"], warning:"Never force a trendline. If you have to adjust it repeatedly, the trend is irregular. A valid trendline should feel natural and connect swing points cleanly." },
      { title:"Fibonacci Retracement", icon:"fa-percent", body:"Fibonacci retracement levels are derived from the Fibonacci sequence and identify potential support/resistance zones within a price move. The key levels (38.2%, 50%, 61.8%) act as magnets where price often pauses or reverses.", example:"USD/JPY moves from 142.00 (swing low) to 145.00 (swing high) — a 300 pip move. Draw Fibonacci from bottom to top. The 61.8% retracement = 143.15, the 50% = 143.50. If price pulls back to these zones, watch for bullish reversal candles for long entry.", pts:["Key levels: 38.2%, 50%, 61.8% (most important — 'golden ratio')","Draw from swing LOW to swing HIGH for a bullish pullback target","Draw from swing HIGH to swing LOW for a bearish pullback target","61.8% is the most respected level — often called the 'golden ratio' zone","Extension levels (127.2%, 161.8%) project TARGETS beyond the swing point","Confluence: Fibonacci level + S/R zone + OB = extremely high-probability entry"], tip:"The 'Golden Zone' is between 50% and 61.8%. When price pulls back into this zone after a strong move, it creates the highest-probability entries in the direction of the original move." },
      { title:"Using Multiple Indicators Together", icon:"fa-layer-group", body:"No single indicator is reliable alone. Professional traders use confluence — multiple independent signals agreeing at the same level. When 3+ factors align at a price zone, probability dramatically increases.", example:"Trade checklist: (1) 4H S/R level at 1.0850 ✓ (2) 61.8% Fibonacci retracement ✓ (3) RSI oversold at 28 ✓ (4) Bullish engulfing candle on the level ✓ (5) EMA 20 nearby ✓ — This 5-factor confluence = extremely high-probability long setup.", pts:["Minimum 2-3 confluence factors before entering any trade — no exceptions","S/R levels + Fibonacci is the most basic and most powerful combination","Add candlestick pattern at the level for entry trigger timing","RSI overbought/oversold confirms momentum at the zone","EMA as dynamic support adds another layer of confluence to the setup","Volume spike at the level confirms institutional activity at the zone"], tip:"Create a pre-trade checklist. Before clicking buy or sell, tick off each confluence factor. If you have less than 2 factors, wait. Patience is your edge." }
    ]
  },
  indicators: {
    title: "Indicators Mastery",
    icon: "fa-chart-area",
    intro: "Indicators are mathematical tools derived from price data. They don't predict the future — they help confirm what price is already showing. Use them as confirmation tools, never as the primary signal.",
    path: ["RSI", "MACD", "Moving Averages", "Bollinger Bands", "Combining Indicators"],
    cards: [
      { title:"RSI — Relative Strength Index", icon:"fa-gauge", body:"The RSI measures momentum — the speed and magnitude of price changes — on a scale from 0 to 100. It identifies when price may be overbought (overextended up) or oversold (overextended down) and spots hidden divergences.", example:"EUR/USD at major support (1.0800). RSI reads 25 (oversold). A bullish engulfing candle forms on the level. RSI oversold + major support + bullish candle = 3-factor confluence. High-probability long setup. RSI crossing back above 30 confirms entry timing.", pts:["Settings: 14-period standard (works on all timeframes)", "Overbought zone: RSI >70 — price may be overextended upward", "Oversold zone: RSI <30 — price may be overextended downward", "Divergence: price makes new high but RSI makes lower high = bearish divergence (powerful signal)", "Regular divergence is more reliable than hidden divergence for reversals", "RSI is MOST useful at key S/R levels — ignore it in open space/middle of range"], tip:"RSI divergence is one of the most powerful signals in technical analysis. When price makes a new high but RSI makes a LOWER high, the uptrend is losing momentum — watch for reversal." },
      { title:"MACD — Moving Average Convergence/Divergence", icon:"fa-wave-square", body:"MACD combines trend-following and momentum into one indicator. It shows the relationship between two EMAs. The histogram shows whether buying or selling momentum is increasing or decreasing — crucial for trade timing.", example:"In an uptrend, price pulls back. MACD histogram starts crossing above zero (positive). MACD line crosses above Signal line. This is bullish momentum confirmation — enter long on the crossover candle with stop below recent swing low.", pts:["Components: MACD line (12-26 EMA), Signal line (9 EMA), Histogram","Bullish signal: MACD line crosses ABOVE signal line — momentum turning up","Bearish signal: MACD line crosses BELOW signal line — momentum turning down","Histogram above zero = bullish momentum; below zero = bearish momentum","Zero line crossover = potential major trend change — strongest MACD signal","Default settings (12,26,9) work well on 1H, 4H, and Daily charts"], warning:"MACD crossovers in choppy/ranging markets generate many false signals. Only use MACD crossovers when price is clearly trending. In ranging markets, stick to oscillators like RSI." },
      { title:"Moving Averages (EMA & SMA)", icon:"fa-chart-line", body:"Moving averages smooth price data to identify the trend direction. The Exponential MA (EMA) weights recent data more heavily and reacts faster. The Simple MA (SMA) weights all periods equally and is slower but cleaner.", example:"Price is above EMA 200 = uptrend confirmed. Price pulls back to EMA 50 (intermediate support) and forms a hammer candle. EMA 50 acting as support + hammer = buy setup. Stop below EMA 50, target previous resistance. Classic institutional entry setup.", pts:["EMA 20: short-term trend — short-term pullback entries in strong trends","EMA 50: intermediate trend — key dynamic S/R for swing trading","EMA 200: long-term trend filter — above = bullish bias, below = bearish bias","Golden Cross: EMA 50 crosses ABOVE EMA 200 = major bullish trend signal","Death Cross: EMA 50 crosses BELOW EMA 200 = major bearish trend signal","EMAs are dynamic S/R — price 'bounces' off them in trending markets"], tip:"The EMA 200 on the Daily chart is the most watched indicator by institutional traders worldwide. Price below the Daily 200 EMA = you should only take short trades. Above = only longs." },
      { title:"Bollinger Bands", icon:"fa-arrows-left-right", body:"Bollinger Bands place two standard deviation bands above and below a 20-period moving average. They expand during volatility and contract during consolidation. The distance between bands tells you about market conditions.", example:"USD/JPY Bollinger Bands are extremely narrow (squeeze) for 10 days — volatility is very low. This compression always precedes a strong breakout. Enter when price breaks outside the bands with a strong candle. The breakout will often be explosive.", pts:["Band squeeze (bands very close together): low volatility = breakout incoming","Band expansion (bands wide apart): high volatility — trend in motion","Price touching/closing outside upper band: very overbought OR strong bullish trend","Price at lower band + RSI oversold: high-probability bounce/reversal setup","Middle band (20 SMA) acts as dynamic support/resistance in trending markets","Walk the band: in strong trends, price can ride the outer band for many candles"], tip:"The Bollinger Band Squeeze is one of the best 'pre-breakout' setups. When bands are the narrowest they've been in weeks, expect a major move. You just don't know which direction yet — wait for the candle to show you." },
      { title:"How to Combine Indicators Correctly", icon:"fa-puzzle-piece", body:"The biggest mistake traders make is stacking too many indicators that measure the same thing. RSI and Stochastic both measure momentum — using both gives no extra information. Combine indicators from DIFFERENT categories for true confirmation.", example:"Correct combination: (1) EMA 200 for trend direction (trend category), (2) RSI for momentum confirmation (oscillator category), (3) Bollinger Bands for volatility context (volatility category). Three different information types = genuine confluence. Wrong: RSI + Stochastic + MACD = all momentum, all saying the same thing.", pts:["Category 1 — Trend: EMAs, MACD, ADX (choose one)","Category 2 — Momentum/Oscillator: RSI, Stochastic, CCI (choose one)","Category 3 — Volatility: Bollinger Bands, ATR (choose one)","Category 4 — Volume: OBV, Volume profile (if available)","Use maximum 2-3 indicators from DIFFERENT categories — not 5 from same","Indicators confirm price action — price action is always primary signal"], warning:"Never use an indicator to override what price action is clearly showing. If price is making lower lows and lower highs, no indicator reading is reason enough to buy." }
    ]
  },
  strategies: {
    title: "Trading Strategies",
    icon: "fa-chess",
    intro: "A trading strategy is a complete system with specific, objective rules for entry, exit, and risk management. Without a defined strategy, every trade is a gamble. Choose one strategy and master it before adding more.",
    path: ["Trend Following", "Breakout Trading", "ICT/SMC Methods", "Scalping"],
    cards: [
      { title:"Trend Following Strategy", icon:"fa-arrow-trend-up", body:"Follow the established trend by entering on pullbacks to dynamic support. This strategy has the highest probability because you trade WITH institutional momentum, not against it. Trend is your friend — always.", example:"EUR/USD Daily uptrend. Price pulls back to the EMA 50 on 4H. RSI hits 45 (mid-range after overbought). A bullish engulfing forms on the 4H at EMA 50. Entry on next candle open: 1.0840. Stop: 1.0800 (below EMA 50 + recent HL). Target: 1.0920 (recent HH). R:R = 1:2.", pts:["Step 1: Confirm trend — HH/HL structure + price above 200 EMA on Daily","Step 2: Wait for pullback to EMA 50 or key S/R zone","Step 3: Look for reversal candle confirmation (engulfing, hammer, pin bar)","Step 4: Enter on close/open of confirmation candle","Stop: below the recent Higher Low — never below the EMA itself","Target: 1:2 minimum R:R, or next resistance/previous swing high"], tip:"The pullback entry strategy works on all timeframes. The best pullbacks retrace 38-61% (Fibonacci) before reversing. If price goes 80%+ against the trend move, the trend may be weakening — reduce size." },
      { title:"Support & Resistance Reversal", icon:"fa-arrows-to-dot", body:"Enter at key S/R levels when price shows clear rejection. This is range trading when the market is sideways, and counter-trend trading within a larger trend. Requires strict discipline because you're fading moves.", example:"USD/CHF ranging between 0.8850 (support) and 0.9050 (resistance) for 3 weeks. Price approaches 0.9050 resistance. A shooting star candle forms. Sell: 0.9045. Stop: 0.9080 (above wick). Target: 0.8900 (near support). R:R = 1:4.", pts:["Only trade KEY S/R levels — tested 3+ times on Daily/4H timeframe","Wait for REJECTION candle at the level — don't anticipate, wait for proof","Enter on close of rejection candle — not before it closes","Stop: 5-15 pips beyond the wick of the rejection candle","Target: opposite side of range — 1:2 minimum R:R","Avoid this strategy when a trend is strongly trending — use trend following instead"], warning:"Never buy at resistance or sell at support without confirmation. Wait for a rejection candle. The level might break through — you need to see the market reject before entering." },
      { title:"ICT Order Block Strategy", icon:"fa-cube", body:"The ICT Order Block strategy identifies the last opposing candle before a strong displacement move. When price returns to that candle (the Order Block), it often provides a high-probability reversal entry because institutional orders remain unfilled there.", example:"EUR/USD: Strong bullish move begins. The last bearish candle before that move was at 1.0810-1.0830 range — this is the Bullish Order Block (OB). Price rallies to 1.0950 then pulls back. When price enters the OB zone (1.0830-1.0810), look for bullish candle confirmation for long entry.", pts:["Identify OB: last BEARISH candle before a BULLISH displacement move","Bullish OB: institutional buy orders remain in that last bearish candle's range","Wait for price to retrace back into the Order Block zone","Entry trigger: bullish reversal candle INSIDE the Order Block zone","Stop: below the Order Block (below the wick of the OB candle)","Target: the next liquidity pool / previous swing high"], tip:"Order Blocks are strongest when they coincide with Fibonacci levels (especially 50-61.8%), Fair Value Gaps, or higher timeframe S/R. The more factors that align, the more institutional interest exists at that zone." },
      { title:"Fair Value Gap (FVG) Trading", icon:"fa-chart-simple", body:"A Fair Value Gap is a three-candle pattern where the middle candle moves so aggressively that it creates a gap between the first and third candle's wicks. Price often returns to this 'imbalance' to fill it before continuing.", example:"Three-candle pattern: Candle 1 high = 1.0850. Candle 3 low = 1.0900. The gap between 1.0850 and 1.0900 is the FVG (50-pip imbalance). Price shoots to 1.1000 then pulls back. When it enters the FVG (1.0900-1.0850 zone), look for bullish confirmation candle.", pts:["FVG forms: Candle 1 high to Candle 3 low creates a 'gap' or 'imbalance'","Bullish FVG: Candle 3 closes well above Candle 1 high — gap below","Bearish FVG: Candle 3 closes well below Candle 1 low — gap above","Price fills the FVG 70-80% of the time — it's drawn to imbalances","Entry: reversal candle inside the FVG zone is highest probability entry","Strongest FVGs are on 4H and Daily timeframes with large displacement candles"] }
    ]
  },
  fundamental: {
    title: "Fundamental Analysis",
    icon: "fa-newspaper",
    intro: "Fundamental analysis evaluates economic data, central bank policy, and geopolitical events to understand why currencies move. Price direction over weeks and months is fundamentally driven — technical analysis helps time entries within that context.",
    path: ["Economic Indicators", "Central Banks", "News Trading", "Combining with Technical"],
    cards: [
      { title:"Key Economic Indicators", icon:"fa-chart-bar", body:"Economic indicators are statistical reports that measure different aspects of an economy's health. They move currency markets because they influence central bank interest rate decisions — the single most powerful driver of currency valuations.", example:"US CPI comes out at 3.5% vs 3.2% expected. This 'beat' means inflation is higher than expected. The Fed may need to keep rates higher for longer. USD strengthens immediately. EUR/USD drops 80 pips in 5 minutes. This is fundamental analysis at work.", pts:["NFP (Non-Farm Payrolls): most impactful monthly US data — released first Friday","CPI (Consumer Price Index): inflation measure — drives Fed rate expectations directly","GDP: economic growth — strong GDP supports currency appreciation","PMI (Purchasing Managers Index): forward-looking — above 50 = expansion","Retail Sales: consumer spending — strong spending = healthy economy = stronger currency","FOMC Meeting: 8x/year — single most important USD volatility event globally"] },
      { title:"Central Bank Interest Rates", icon:"fa-building-columns", body:"Interest rates are the most powerful fundamental driver of currency values. When a central bank raises rates, it attracts foreign capital seeking higher yield. When it cuts rates, capital flows out to higher-yielding currencies.", example:"The ECB holds rates at 4.5% while the Federal Reserve cuts to 4.0%. EUR now offers higher yield than USD. Capital flows INTO Europe to earn more interest. EUR/USD rises over the following weeks and months as this rate differential plays out.", pts:["Higher interest rates → attract foreign capital → currency strengthens","Lower interest rates → capital flows out → currency weakens","'Hawkish' = central bank likely to RAISE rates → bullish for that currency","'Dovish' = central bank likely to CUT rates → bearish for that currency","Rate EXPECTATIONS move markets more than actual decisions — watch the language","Central bank press conferences often move markets more than the rate decision itself"], tip:"Follow the rate differential between two currencies in a pair. The currency with higher (or rising) rates generally strengthens over time. This is the 'carry trade' dynamic." },
      { title:"Trading Economic News Events", icon:"fa-newspaper", body:"News trading means entering positions based on economic releases. It's high risk and high reward. The key is knowing which events matter, reading the surprise direction, and waiting for the initial spike to clear before entering.", example:"US CPI beats expectations (3.5% vs 3.2% forecast). Initial spike: USD surges, EUR/USD drops 80 pips in 2 minutes. After the spike settles, price retests the breakdown level at 1.0850 (previous support, now resistance). Enter SELL at 1.0850, stop 1.0880, target 1.0780. This is the controlled news trade entry.", pts:["Only trade HIGH impact events: NFP, CPI, FOMC, ECB, BoE decisions","Check forecast vs actual: the SURPRISE (gap between forecast and actual) drives the move","Beat = currency strengthens; Miss = currency weakens (vs expectations, not previous)","Wait 1-2 minutes after release for initial spike volatility to clear","Enter after direction confirmed — on retest of broken level","Do NOT use tight stops during news — spreads widen massively in first minutes"], warning:"Stay flat during high-impact news events unless you are an experienced news trader. The spreads and volatility in the first 1-2 minutes can stop you out at 3× normal cost." },
      { title:"Combining Fundamental and Technical", icon:"fa-puzzle-piece", body:"The most powerful analysis combines fundamental bias (which direction the currency should go based on economic conditions) with technical analysis (exactly where and when to enter). Fundamentals give direction; technicals give timing and precision.", example:"Fundamental: EUR/USD fundamental bias is BULLISH because ECB is hawkish while Fed is cutting rates. Technical: 4H chart shows price at key S/R support (1.0800) with RSI at 35 and a bullish engulfing candle. Both fundamental and technical say BUY = highest probability long setup.", pts:["Step 1: Determine fundamental bias for the currency pair this week/month","Step 2: Trade only in the direction of fundamental bias when possible","Step 3: Use technical analysis to find precise entry at key levels","Step 4: Use news events as timing triggers — enter on post-news retest","Counter-fundamental trades can work short-term but fade them — don't hold long","Economic calendar check: every morning, know what news is releasing today"] }
    ]
  },
  sentiment: {
    title: "Sentiment Analysis",
    icon: "fa-gauge",
    intro: "Market sentiment measures the collective psychology of all traders — are they predominantly bullish or bearish? Extreme sentiment readings are contrarian signals. When everyone is on one side, the move is often over.",
    path: ["COT Report", "Retail Sentiment", "Fear & Greed", "Contrarian Signals"],
    cards: [
      { title:"COT Report — Commitment of Traders", icon:"fa-people-group", body:"The Commitment of Traders (COT) report is published weekly by the CFTC. It shows the actual futures positions held by different categories of traders. It's the closest you can get to seeing what institutional traders are doing.", example:"COT report shows large non-commercial traders (hedge funds) are net long EUR at extreme levels — the most long positioning in 18 months. This extreme positioning suggests the EUR rally may be exhausted. Contrarian signal: begin watching for EUR topping patterns.", pts:["Published every Friday reflecting Tuesday positions — free on cftc.gov website","Commercial traders (hedgers): businesses hedging risk — often contrarian signals","Non-commercial (large speculators): hedge funds — trend following, money flows","Small non-commercial: retail traders — least reliable, often wrong at extremes","Net positioning extremes (record long or record short) = potential reversal signal","COT is medium to long-term analysis (weeks to months) — not for day trading"] },
      { title:"Retail Sentiment as Contrarian Tool", icon:"fa-arrows-rotate", body:"Most retail forex brokers publish the percentage of their clients long vs short on each pair. Due to the nature of retail trading (most retail traders lose), extreme retail positioning often signals the OPPOSITE direction is correct.", example:"80% of retail EUR/USD traders are long. Historical data shows when 80%+ are long EUR/USD, the pair tends to fall — smart money is positioned opposite to the retail crowd. This is not 100% reliable but adds contrarian weight to bearish signals.", pts:["Data source: IG, OANDA, Myfxbook publish live retail sentiment data","If 75%+ retail long → consider bearish bias (contrarian signal)","If 75%+ retail short → consider bullish bias (contrarian signal)","Works BEST at technical extremes — at major S/R levels or after extended trends","Retail sentiment alone is not enough — combine with COT and technical analysis","Don't use in strong momentum trends — sentiment can stay extreme for weeks"] },
      { title:"Fear & Greed in Trading Psychology", icon:"fa-heart-pulse", body:"Market sentiment cycles through predictable emotional states. Understanding where the market is in the emotional cycle helps you identify extremes. Maximum pessimism is often near market bottoms; maximum optimism near tops.", pts:["Maximum pessimism = potential market bottom (best time to start buying)","Maximum optimism/euphoria = potential market top (time to start reducing longs)","Fear spikes (VIX index rising) = risk-off environment → USD and JPY strengthen","Greed phase (VIX low, markets rallying) = risk-on → commodity currencies strengthen","Crowd psychology makes market swings larger than fundamentals alone would justify","Use sentiment as context — not as primary entry signal, but as confirmation layer"] }
    ]
  },
  risk: {
    title: "Risk Management",
    icon: "fa-shield",
    intro: "Risk management is the single most important skill in trading. Without it, even the best strategy eventually blows an account. Protect capital first — profit second. This is the professional trader's mindset.",
    path: ["The 1-2% Rule", "Position Sizing", "Risk:Reward Ratios", "Drawdown Management"],
    cards: [
      { title:"The 1-2% Rule — The Foundation", icon:"fa-shield", body:"Never risk more than 1-2% of your total trading account on any single trade. This is the most important rule in all of trading. It's not a guideline — it's a survival rule. Every professional trader follows this without exception.", example:"$10,000 account. Risk 2% = $200 max risk per trade. You find a setup on EUR/USD with a 50-pip stop loss. Pip value on standard lot = $10/pip. $200 ÷ (50 × $10) = 0.4 lots. That's your exact position size for this trade. Your maximum loss if stopped out = $200.", pts:["$1,000 account: $10-20 max risk per trade","$5,000 account: $50-100 max risk per trade","$10,000 account: $100-200 max risk per trade","With 2% risk: you can lose 50 consecutive trades and still have 36% of capital left","With 10% risk: 10 consecutive losses = account blown — this happens regularly","This rule is what separates professional traders from gamblers — follow it always"], warning:"Most blown trading accounts come from ignoring the 1-2% rule. One single trade with 20% risk can cause catastrophic damage. Set your risk per trade BEFORE you look for setups." },
      { title:"Position Sizing Calculation", icon:"fa-calculator", body:"Position sizing calculates exactly how many lots to trade so that your dollar risk stays within your risk limit if the stop loss is triggered. Calculate this for EVERY single trade — different stop losses require different sizes.", example:"Account: $5,000. Risk: 2% = $100. Trade: GBP/USD. Stop loss: 40 pips away. Pip value on 0.1 lot (mini lot) = $1.00/pip. Calculation: $100 ÷ 40 pips = $2.50/pip needed. $2.50 ÷ $1.00 (per mini lot) = 2.5 mini lots (0.25 standard lots). Set position size to 0.25 lots.", pts:["Formula: Risk Amount ÷ (Stop Loss Pips × Pip Value per Lot)","Pip value varies by pair and account currency — use a pip calculator","Major pairs (USD pairs): 1 standard lot = $10/pip, 1 mini lot = $1/pip","NEVER adjust your stop loss to fit a desired position size — adjust size to stop","If the position comes out less than 0.01 lots, the setup is too risky to take","Recalculate position size for EVERY trade — don't reuse old calculations"], tip:"Use an online position size calculator (myfxbook.com/tools/position-size or babypips.com calculators). There is no reason to calculate manually — these tools are free and instant." },
      { title:"Risk-Reward Ratios", icon:"fa-scale-balanced", body:"Your risk-reward ratio is the relationship between what you risk (stop loss) vs what you target (take profit). This is the mathematical foundation of your strategy's profitability. A good R:R means you don't need to win the majority of trades.", example:"Strategy with 1:2 R:R: You risk 50 pips to make 100 pips. Win rate: 40% (lose 60%). Results: 10 trades = 4 wins × 100 pips = +400 pips. 6 losses × 50 pips = -300 pips. Net: +100 pips PROFIT despite losing 60% of trades. Math wins.", pts:["1:1 R:R: need 51%+ win rate just to break even — very hard to achieve","1:2 R:R: need only 34% win rate to profit — achievable with discipline","1:3 R:R: need only 25% win rate to profit — excellent ratio","Minimum acceptable: NEVER take a trade with less than 1:2 R:R — period","Partial exits: take 50% profit at 1:2, move stop to breakeven, let rest run","R:R is calculated BEFORE entering — if it doesn't meet minimum, skip the trade"], tip:"1:2 R:R is the professional standard minimum. If a setup only offers 1:1 or less, skip it. There will always be another setup. Protecting your R:R is what keeps you profitable long-term." },
      { title:"Drawdown Management", icon:"fa-chart-simple", body:"Drawdown is an inevitable part of trading — every strategy has losing streaks. How you manage drawdown periods determines whether you survive long enough for your edge to play out. Strict daily and weekly limits prevent small losing streaks from becoming catastrophic.", example:"3 consecutive losses in a day: Account went from $10,000 to $9,400 (lost $600 = 6%). Rule: stop trading after 3 consecutive losses. Review your trades: Were you following your plan? If yes, the losses are statistical — resume tomorrow fresh. If no, you need to fix your discipline first.", pts:["Daily loss limit: maximum 3% of account per day — stop immediately when hit","Weekly loss limit: maximum 6% — review strategy before resuming Monday","Monthly limit: 10-15% — take extended break and detailed journal review","After 3 consecutive losses: mandatory break — do not take a 4th trade that day","After 5% drawdown: reduce position size by 50% until you recover","Never 'revenge trade' after a losing streak — this multiplies losses consistently"], warning:"The biggest account blow-ups happen when traders abandon their risk rules during drawdown. 'I'll just make it back' thinking is how $2,000 drawdowns become $8,000 drawdowns. Stop. Review. Reset." }
    ]
  },
  psychology: {
    title: "Trading Psychology",
    icon: "fa-heart-pulse",
    intro: "90% of traders fail not because of poor strategy — but because of psychology. Fear, greed, FOMO, and revenge trading destroy more accounts than bad analysis ever will. Mastering your mind is mastering trading.",
    path: ["Emotional Cycle", "Overcoming FOMO", "Dealing With Losses", "Building Consistency"],
    cards: [
      { title:"The Emotional Trading Cycle", icon:"fa-brain", body:"Trading emotions follow a predictable pattern that repeats endlessly if you don't interrupt it with rules and discipline. Understanding this cycle is the first step to breaking free from it. Emotional decisions are losing decisions — always.", example:"Trader has 5 winning trades in a row (euphoria). Doubles position size (overconfidence). Takes a bad setup because 'I'm on a hot streak' (bias). Loses $500 in one trade wiping out 3 previous wins (reality check). Takes another bad trade to recover (revenge). Loses again. Full cycle.", pts:["Euphoria phase: winning streak → overconfidence → excessive risk taking","Hope phase: losing trade → holding instead of cutting → loss grows larger","Fear phase: after losses → refusing valid setups → missed profits accumulate","Despair phase: large drawdown → abandoning strategy at worst possible time","Recovery: discipline and rules → consistency → back to small gains and trust","The only thing that breaks this cycle: pre-defined rules that you follow EVERY time"], tip:"Write your trading rules on paper and stick them next to your trading screen. When emotion rises, look at your rules — not the chart. Rules override feelings. Always." },
      { title:"Overcoming FOMO (Fear of Missing Out)", icon:"fa-running", body:"FOMO causes traders to chase moves that have already happened, enter at terrible prices, and accept risk-reward ratios far below their minimum. It is one of the single most expensive psychological mistakes in trading.", example:"EUR/USD breaks out and rallies 80 pips. You missed the setup. FOMO kicks in — you enter 70 pips into the move. Stop is now only 20 pips away (bad R:R). Price pulls back 30 pips, stops you out. The original entry would have worked perfectly. FOMO cost you 20 pips and the frustration.", pts:["FOMO trigger: watching a trade move strongly while you're sitting on the sidelines","Result: late entry, poor price, forced tight stop, bad R:R = low probability setup","Prevention: write down 'I will wait for my setup. Missing trades is part of trading.'","Truth: the market produces new setups every single day — no setup is irreplaceable","If you missed a breakout: wait for the pullback retest of the breakout level","FOMO is worst in trending markets — remind yourself: trend entries on pullbacks are better"], tip:"Create a rule: 'If I feel FOMO, I will not enter.' This single rule alone will save you a significant amount of money over time. FOMO entries almost never work out." },
      { title:"Dealing With Losses Correctly", icon:"fa-heart-crack", body:"Losses are mathematically inevitable in trading. Even the best strategy in the world has a 35-45% loss rate. Your relationship with individual losses determines your long-term profitability more than your win rate does.", example:"You lose 3 trades in a row. Total loss: $300. You journal each loss. Review: Trades 1 and 2 were valid setups that just didn't work (statistical loss). Trade 3: you entered without full criteria met (discipline failure). Action: accept losses 1 & 2, analyze trade 3 to prevent that specific mistake.", pts:["Expect and budget for losses: even a great strategy loses 35-45% of trades","Size correctly: 1-2% risk means a loss feels manageable, not catastrophic","Journal every loss: write the setup, entry, why it failed, emotion during trade","Distinguish: was it a good setup that lost OR a bad setup you should never have taken?","Good setup loss: accept it, move on. Bad setup loss: fix the discipline issue","Never revenge trade: next trade MUST follow the plan completely — no exceptions"], warning:"Never evaluate your strategy after only 10-20 trades. You need 50-100 trades minimum to see meaningful statistical results. Changing strategies after every losing streak is guaranteed failure." },
      { title:"Building Long-Term Consistency", icon:"fa-repeat", body:"Consistency is the ultimate goal of all trading education. Consistent rules, consistent position sizing, consistent emotional management. Consistency creates the sample size needed to prove your edge actually works over time.", pts:["Trade the same strategy with the same rules on every single trade","Same timeframes, same entry criteria, same risk percentage — every trade","Journal: record entry, exit, reason, emotion, R:R, and result — every single trade","Monthly performance review: win rate, average R:R, total R — based on DATA","Give your strategy minimum 50-100 trades before making any adjustments","Adjust based on journal data patterns — never on feeling or instinct alone","Goal: not to win every trade, but to follow your plan consistently every time"], tip:"Measure your success by how well you followed your rules — not by profit/loss. A trader who followed all rules and lost is more successful than one who broke rules and won. Discipline IS the edge." }
    ]
  },
  journal: {
    title: "Trading Journal",
    icon: "fa-book",
    intro: "A trading journal is the most underused yet most powerful tool for improvement. Without recording and reviewing trades, you're guaranteed to repeat mistakes indefinitely. Professionals journal obsessively.",
    path: ["Why Journal?", "What to Record", "Weekly Review", "Using Data to Improve"],
    cards: [
      { title:"Why Every Trader Needs a Journal", icon:"fa-book", body:"A trading journal creates a systematic review process that transforms losses into learning opportunities and reveals unconscious patterns you would never identify otherwise. It is the difference between repeating mistakes and evolving.", pts:["Identifies which of your setups are most profitable — focus there","Reveals which setups consistently lose — eliminate or fix those","Tracks emotional patterns: do you lose more on Fridays? After winning streaks?","Measures actual win rate and R:R vs what you planned — reality check","Accountability: did you actually follow your rules? Journal reveals the truth","Without a journal, you improve slowly by accident — with one, you improve by design"], tip:"Use a simple spreadsheet or dedicated app (TraderSync, Edgewonk, FXBook). The format doesn't matter — consistency matters. Record EVERY trade, no exceptions, no matter how small." },
      { title:"What to Record in Every Trade Entry", icon:"fa-pen", body:"A complete journal entry captures everything needed to learn from both winning and losing trades. Skip fields and the journal becomes useless. The 5 minutes it takes per trade are the most valuable 5 minutes in your trading day.", example:"Complete entry: Date: 10/05/2025. Pair: EUR/USD. Direction: Long. Timeframe: 4H. Setup: Trend following pullback to EMA50. Entry: 1.0842. Stop: 1.0804 (38 pips). TP: 1.0918 (76 pips). R:R: 1:2. Confidence: 8/10. Emotion: Calm. Result: Win. Exit: 1.0918. Pips: +76. R gained: +2R.", pts:["Basic: date, time, pair, direction (long/short), entry/exit price","Risk: position size, stop loss, take profit, planned R:R ratio","Setup: which strategy used, timeframe, reason for entry criteria met","Confidence: rate 1-10. Emotion: calm/anxious/excited/hesitant","Result: exit price, P&L in pips, P&L in $, P&L in R (most important)","Screenshots: capture chart at entry AND exit — visual review is powerful"] },
      { title:"Weekly Review Process", icon:"fa-magnifying-glass-chart", body:"The weekly review transforms raw journal data into actionable improvements. This is where real learning happens — not during live trading when emotions are running, but in calm reflection and honest analysis.", pts:["Every Sunday: review every trade from the past week systematically","Ask for each trade: Did I follow my entry criteria completely? (yes/no)","Calculate weekly stats: win rate, average R:R, total R, best/worst trade","Identify pattern: is there a time of day/day of week where I lose more?","Which setups performed best this week? Which worst? Note the difference","Action items: write 1-3 specific things to improve next week — not vague, specific"], tip:"Focus first on whether you FOLLOWED YOUR RULES — not on profit. A week where you lost money but followed all your rules is a successful week. A week you made money breaking rules is a dangerous week." }
    ]
  },
  mistakes: {
    title: "Common Trading Mistakes",
    icon: "fa-triangle-exclamation",
    intro: "These are the mistakes that consistently destroy trading accounts. Most traders learn these lessons the hard way — losing thousands of dollars. Study this module and learn them without the cost.",
    path: ["Strategy Mistakes", "Risk Mistakes", "Psychological Mistakes", "Habit Mistakes"],
    cards: [
      { title:"Overtrading — The Most Common Account Destroyer", icon:"fa-skull", body:"Overtrading means taking too many trades without proper setup criteria being met. It stems from boredom, FOMO, or pressure to 'be active'. Quality always beats quantity in trading — always.", example:"A trader with a 3-trade daily limit sees the market ranging. Out of boredom, takes 8 trades. The extra 5 trades: 4 losses + 1 win = net -3R. The original 3 quality trades: 2 wins + 1 loss = net +3R. Overtrading cost 6R in one session.", pts:["Signs: trading when there's 'nothing to trade', taking every minor move","Solution: set maximum daily trade limit (3-5 trades) — stick to it strictly","Quality setups only: enter when 2-3 confluence factors are aligned perfectly","Boredom is not a valid reason to enter a trade — ever, under any circumstance","Walk away from screen when you've hit your daily limit — non-negotiable"], warning:"On days where you don't find quality setups, taking NO trades is the correct decision. Preserving capital on slow days is a skill, not a failure." },
      { title:"Moving Stop Losses Further Away", icon:"fa-ban", body:"Moving a stop loss away from entry to 'give the trade more room' is one of the most dangerous habits. It transforms a planned 1R loss into a 3R, 5R, or 10R catastrophe — and it's driven purely by ego, not analysis.", example:"Long at 1.0850, stop at 1.0800 ($100 risk). Price drops to 1.0810. Instead of accepting the $100 planned loss, you move stop to 1.0760. Price hits stop = $250 loss. You turned a $100 loss into $250 by breaking your rule. This is account destruction behavior.", pts:["Moving stops further away from entry: NEVER acceptable — a hard rule","You set the stop based on analysis before entering — that reason doesn't change","If price is reaching your stop, the analysis was wrong — accept it and exit","Moving to breakeven after reaching 1R profit: acceptable risk management","Trailing stops (moving in profit direction): excellent technique","The only acceptable stop movement is toward profit — never away from it"] },
      { title:"Revenge Trading After Losses", icon:"fa-fire-flame-curved", body:"Revenge trading is entering immediately after a loss with the goal of 'getting the money back'. It bypasses all analysis and strategy — it's driven purely by emotion, and it almost always makes the loss dramatically bigger.", example:"You lose $200 on EUR/USD. Angry, you immediately enter GBP/JPY (no setup) and lose $200. Now down $400. You double your size to 'recover faster' and lose $400. Total: -$800 from an original -$200 loss. Revenge trading quadrupled the damage in 3 trades.", pts:["After any loss: mandatory 15-30 minute break before any next trade","After 2 consecutive losses: stop trading for the day, no exceptions","Revenge trades bypass your strategy — they are gambling with your capital","The market owes you nothing — it doesn't 'owe you back' your losses","Journal the emotion: write what you felt — builds awareness of the pattern","Rule: 'After any loss, I will pause and breathe for 15 minutes before next trade'"] },
      { title:"Ignoring Risk Management Rules", icon:"fa-shield-halved", body:"The most common fatal trading error: breaking risk management when a trade 'looks so obvious'. There is no such thing as an obvious trade. Every setup can fail. Always size based on your rules — never on conviction level.", pts:["'This one looks obvious, I'll risk 15%' — this is how accounts blow in one trade","Professional traders use the same risk percentage on every single trade","The more confident you feel, often the more dangerous the trade actually is","Risk rules must be pre-defined, mechanical, and never overridden by conviction","Your job is process execution and rule following — not prediction and conviction","A single 20% risk trade that loses can take months to recover from — avoid it"], warning:"The most confident trades are often the ones that produce the biggest losses. Markets punish overconfidence. Size by your rule, never by your feeling about a trade." },
      { title:"Not Having a Written Trading Plan", icon:"fa-map", body:"Trading without a written plan is guessing with real money. A plan defines your strategy, entry rules, risk parameters, daily loss limit, trading hours, and which pairs you trade. Without a plan, every decision is made emotionally in real-time under pressure.", pts:["A trading plan defines: pairs traded, strategy, entry criteria, risk per trade","Without a plan, every decision is reactive and emotional — no systematic edge","Write your plan: one page with clear, specific, objective rules is enough","Review your plan before every trading session — programs your mindset","If a setup doesn't match your plan — skip it, regardless of how it looks","Plans evolve based on journal data — review and update them quarterly"], tip:"Create a one-page trading plan today. Print it. Place it next to your screen. Before every trade: 'Does this meet my plan?' If unsure, skip the trade." },
      { title:"Trading Without Confluence — Single-Reason Entries", icon:"fa-crosshairs", body:"Entering a trade based on only one signal (e.g., 'RSI is oversold') ignores the full market context. Professional traders never enter on a single reason alone — they require 2-3 confluent factors before committing capital.", pts:["Single confluence: RSI oversold (not enough alone — price could keep falling)","Double confluence: RSI oversold + price at major support (better, but still risky)","Triple confluence: RSI oversold + major support + bullish engulfing candle = high probability","Confluence stacking: EMA level + Fibonacci 61.8% + Order Block + RSI reset = institutional entry","More confluence = higher probability = larger position size = better risk-adjusted returns","Skip setups with only one reason — wait for convergence of multiple factors at the same price"] },
      { title:"Choosing the Wrong Timeframe for Your Strategy", icon:"fa-timeline", body:"Each strategy works best on specific timeframes. Scalping strategies on daily charts = too slow. Swing trading on 1-minute charts = too noisy. Mismatched timeframe and strategy is one of the most subtle but costly beginner mistakes.", pts:["Scalping: 1m, 5m, 15m charts — requires fast execution and narrow spreads","Intraday trading: 15m, 1H charts — standard for most retail traders","Swing trading: 4H, Daily charts — requires patience but less screen time","Position trading: Weekly, Monthly charts — long-term macro approach","Rule: always use at least 3 timeframes: HTF (bias) + MTF (setup) + LTF (entry)","Never take a 15m trade against the Daily trend — HTF always dominates"] }
    ]
  },
  positionsizing: [
    { icon:"fa-calculator", title:"Position Sizing — The Most Important Skill", body:"Position sizing determines how many lots to trade based on your account size, risk percentage, and stop loss distance. Getting this right is the single most important mathematical skill in trading.", pts:["Formula: Risk Amount ÷ (Stop Loss in Pips × Pip Value) = Lot Size","Example: $1,000 account × 2% risk = $20 max risk","Stop = 40 pips on EUR/USD (pip value = $10/pip for standard lot)","$20 ÷ (40 × $1) = 0.5 mini lots = 0.05 standard lots","Use the position size calculator in our Tools section every single trade","Never skip this calculation — even experienced traders make sizing errors"] },
    { icon:"fa-percent", title:"The 1-2% Rule Explained", body:"Never risk more than 1-2% of your total account balance on any single trade. This is the foundational risk management rule that keeps you in the game long enough to learn and profit.", pts:["$500 account → max $5–$10 risk per trade (1–2%)","$5,000 account → max $50–$100 risk per trade","$50,000 account → max $500–$1,000 risk per trade","Why: a 10-trade losing streak only costs 10-20% of account — recoverable","Violating this: one 20% risk trade loses 20% in a single trade — catastrophic","Professional traders risk 0.5–1% — their accounts grow slowly but never blow up"] },
    { icon:"fa-shield", title:"Stop Loss Placement Strategies", body:"Where you place your stop loss should be determined by market structure, NOT by how much money you want to risk. The structure-based stop is placed BEYOND the level that would invalidate your trade idea.", pts:["Behind swing lows/highs: most common structural stop placement","Behind key S/R zones: price below support invalidates the buy idea","ATR-based stop: 1.5×–2× ATR from entry adapts to current volatility","Order Block stop: below the OB means the institutional zone failed","Never use 'round number' stops like 'exactly 50 pips' — use structure","Adjust lot size to maintain 1-2% risk regardless of stop distance"] },
    { icon:"fa-crosshairs", title:"Take Profit Strategies — Advanced", body:"Where and how you exit profitable trades is as important as where you enter. Poor take profit management can turn winning systems into losing ones.", pts:["Fixed R:R: always target minimum 1:2 ratio (risk $1 to make $2)","Partial profits: close 50% at 1:1 R:R, let 50% run with trailing stop","Structural targets: take profit at next major resistance/support zone","Fibonacci extension targets: 127.2%, 161.8% extensions for measured moves","Avoid greed: don't move take profit further away hoping for more","'Let winners run' only works with a trailing stop — never just hope"] },
    { icon:"fa-chart-line", title:"Risk:Reward Ratio — Why It Matters More Than Win Rate", body:"Your R:R ratio matters more than your win rate. With a 1:3 R:R, you can lose 70% of trades and still be profitable. Most beginners focus on win rate but completely ignore expectancy.", pts:["Expectancy formula: (Win Rate × Avg Win) – (Loss Rate × Avg Loss)","Example: 40% win rate × 3R avg win = 1.2R; 60% loss × 1R = 0.6R → +0.6R per trade","This means: losing 6 out of 10 trades is still profitable with 1:3 R:R","Poor R:R: 60% win rate with 1:1 = barely profitable after spread/slippage","Target: minimum 1:2 R:R on every trade, ideally 1:3 for swing trades","Never enter a trade if you can't find a target that gives at least 1:2 R:R"] },
    { icon:"fa-wallet", title:"Position Sizing for Different Account Sizes", body:"The rules are the same regardless of account size — only the dollar amounts change. Discipline in position sizing at $500 builds the habits that matter when you have $50,000.", pts:["Micro account ($100–$500): trade micro lots (0.01) only, never standard","Mini account ($500–$2,000): 0.01–0.05 lots max, 1% risk rule strictly","Standard account ($2,000–$10,000): 0.01–0.2 lots based on stop size","Professional ($10,000+): position sizing becomes critically important","Never 'grow your account fast' by risking more — this destroys accounts","Compound 1-2% risk consistently over time — it grows exponentially over months"] }
  ],
};
/* ============================================================
   TOOLS — MODAL SYSTEM
============================================================ */
function initTools() {
  DOM.toolCards.forEach(card => {
    card.querySelector(".btn-open")?.addEventListener("click", () => {
      const tool = card.dataset.tool;
      openTool(tool);
    });
  });
  if (DOM.modalClose) DOM.modalClose.addEventListener("click", closeModal);
  DOM.modalOv.addEventListener("click", e => { if (e.target === DOM.modalOv) closeModal(); });
}

function openTool(tool) {
  DOM.modalOv.style.display = "flex";
  let html = "";

  if (tool === "position-calculator") {
    html = `<h3><i class="fa-solid fa-calculator" style="color:var(--purple2);margin-right:8px"></i>Position Size Calculator</h3>
    <label>Account Balance ($)</label><input type="number" id="pb" value="10000" placeholder="10000">
    <label>Risk Percentage (%)</label><input type="number" id="pr" value="1" placeholder="1" step="0.1">
    <label>Stop Loss (pips)</label><input type="number" id="psl" value="50" placeholder="50">
    <label>Pair Type</label><select id="ptype"><option value="1">Standard USD pair (EUR/USD, GBP/USD)</option><option value="0.9">JPY pair (USD/JPY)</option><option value="0.5">Gold (XAU/USD)</option></select>
    <button class="btn-calc" onclick="
      const bal=+document.getElementById('pb').value;
      const risk=+document.getElementById('pr').value/100;
      const sl=+document.getElementById('psl').value;
      const type=+document.getElementById('ptype').value;
      const riskAmt=bal*risk;
      const pipVal=10*type;
      const lots=(riskAmt/(sl*pipVal)).toFixed(2);
      const mini=(lots*10).toFixed(1);
      document.getElementById('pcResult').innerHTML='<div style=\\'margin-top:14px;padding:14px;background:rgba(16,217,160,0.08);border:1px solid rgba(16,217,160,0.2);border-radius:10px;\\'><strong style=\\'color:var(--green)\\'>Results:</strong><br>Risk Amount: <strong>$'+riskAmt.toFixed(2)+'</strong><br>Position Size: <strong>'+lots+' standard lots</strong><br>Mini Lots: <strong>'+mini+' mini lots</strong><br>Max Loss: <strong>$'+riskAmt.toFixed(2)+'</strong></div>';
    ">Calculate Position Size</button>
    <div id="pcResult"></div>`;
  } else if (tool === "risk-calculator") {
    html = `<h3><i class="fa-solid fa-shield-virus" style="color:var(--purple2);margin-right:8px"></i>Risk/Reward Analyzer</h3>
    <label>Entry Price</label><input type="number" id="re" value="1.0850" step="0.0001">
    <label>Stop Loss Price</label><input type="number" id="rsl" value="1.0800" step="0.0001">
    <label>Take Profit Price</label><input type="number" id="rtp" value="1.0950" step="0.0001">
    <button class="btn-calc" onclick="
      const e=+document.getElementById('re').value;
      const sl=+document.getElementById('rsl').value;
      const tp=+document.getElementById('rtp').value;
      const risk=Math.abs(e-sl);
      const reward=Math.abs(tp-e);
      const rr=(reward/risk).toFixed(2);
      const winNeeded=(1/(1+parseFloat(rr))*100).toFixed(1);
      const col=rr>=2?'var(--green)':rr>=1?'var(--gold)':'var(--red)';
      document.getElementById('rrResult').innerHTML='<div style=\\'margin-top:14px;padding:14px;background:rgba(124,92,252,0.07);border:1px solid rgba(124,92,252,0.2);border-radius:10px;\\'><strong>Risk:</strong> '+risk.toFixed(5)+' ('+Math.round(risk*10000)+' pips)<br><strong>Reward:</strong> '+reward.toFixed(5)+' ('+Math.round(reward*10000)+' pips)<br><strong>R:R Ratio:</strong> <span style=\\'color:'+col+';font-size:1.1rem;font-weight:800\\'>1:'+rr+'</span><br><strong>Min Win Rate Needed:</strong> '+winNeeded+'%</div>';
    ">Analyze Risk/Reward</button>
    <div id="rrResult"></div>`;
  } else if (tool === "pip-calculator") {
    html = `<h3><i class="fa-solid fa-ruler" style="color:var(--purple2);margin-right:8px"></i>Pip Value Calculator</h3>
    <label>Lot Size</label><input type="number" id="pls" value="1" step="0.01">
    <label>Pair Type</label><select id="ppt"><option value="10">Standard USD pair (EUR/USD etc.) — Standard Lot</option><option value="0.10">Standard USD pair — Mini Lot (0.1)</option><option value="0.01">Standard USD pair — Micro Lot (0.01)</option><option value="1000">Gold (XAU/USD) — per oz</option></select>
    <button class="btn-calc" onclick="
      const lots=+document.getElementById('pls').value;
      const val=+document.getElementById('ppt').value;
      const pipVal=(lots*val).toFixed(2);
      document.getElementById('ppResult').innerHTML='<div style=\\'margin-top:14px;padding:14px;background:rgba(0,229,255,0.07);border:1px solid rgba(0,229,255,0.2);border-radius:10px;\\'><strong>Pip Value: $'+pipVal+' per pip</strong><br>10 pip move = $'+(lots*val*10).toFixed(2)+'<br>50 pip move = $'+(lots*val*50).toFixed(2)+'<br>100 pip move = $'+(lots*val*100).toFixed(2)+'</div>';
    ">Calculate Pip Value</button>
    <div id="ppResult"></div>`;
  } else if (tool === "fibonacci") {
    html = `<h3><i class="fa-solid fa-percent" style="color:var(--purple2);margin-right:8px"></i>Fibonacci Level Calculator</h3>
    <label>Swing Low Price</label><input type="number" id="fl" value="1.0800" step="0.0001">
    <label>Swing High Price</label><input type="number" id="fh" value="1.0950" step="0.0001">
    <button class="btn-calc" onclick="
      const low=+document.getElementById('fl').value;
      const high=+document.getElementById('fh').value;
      if(low&&high&&high>low){
        const diff=high-low;
        const levels=[0,0.236,0.382,0.5,0.618,0.786,1,1.272,1.618];
        const names=['0% (High)','23.6%','38.2%','50%','61.8% 🎯 Golden Zone','78.6%','100% (Low)','127.2% Extension','161.8% Extension'];
        document.getElementById('fibResult').style.display='block';
        document.getElementById('fibResult').innerHTML='<div style=\\'color:var(--purple2);font-weight:700;margin-bottom:10px;\\'>Fibonacci Levels:</div>'+levels.map((l,i)=>{const price=(high-diff*l).toFixed(5);const isGolden=i===4;return'<div style=\\'display:flex;justify-content:space-between;padding:5px 0;border-bottom:1px solid rgba(255,255,255,0.05);'+(isGolden?'color:var(--gold);font-weight:800;background:rgba(240,180,41,0.05);padding:7px 5px;border-radius:6px;':'color:var(--t2);')+'\\'><span>'+names[i]+'</span><span>'+price+'</span></div>';}).join('');
      }
    ">Calculate Levels</button>
    <div id="fibResult" style="display:none;margin-top:14px;padding:14px;background:rgba(124,92,252,0.07);border:1px solid rgba(124,92,252,0.2);border-radius:10px;"></div>`;
  } else if (tool === "session-clock") {
    html = `<h3><i class="fa-solid fa-globe" style="color:var(--cyan);margin-right:8px"></i>Trading Session Clock</h3>
    <div id="sessionClock"></div>`;
    DOM.modalOv.style.display = "flex";
    DOM.modalContent.innerHTML = html;
    renderSessionClock();
    return;
  } else if (tool === "journal") {
    html = `<h3><i class="fa-solid fa-book-open" style="color:var(--purple2);margin-right:8px"></i>Trade Journal Entry</h3>
    <label>Pair / Asset</label><input type="text" id="jpair" placeholder="EUR/USD">
    <label>Direction</label><select id="jdir"><option>LONG (Buy)</option><option>SHORT (Sell)</option></select>
    <label>Entry Price</label><input type="number" id="jentry" step="0.0001">
    <label>Stop Loss</label><input type="number" id="jsl" step="0.0001">
    <label>Take Profit</label><input type="number" id="jtp" step="0.0001">
    <label>Result (pips, use - for loss)</label><input type="number" id="jresult" placeholder="25">
    <button class="btn-calc" onclick="toast('Trade logged to journal! 📓 Keep building your data.','success');closeModal();">Log Trade</button>`;
  } else if (tool === "correlation") {
    html = `<h3><i class="fa-solid fa-link" style="color:var(--purple2);margin-right:8px"></i>Key Pair Correlations</h3>
    <div style="font-size:.83rem;color:var(--t3);margin-bottom:14px;line-height:1.7;">Correlations help avoid overexposure. Positive = move together, Negative = move opposite.</div>
    ${[
      ["EUR/USD","GBP/USD","+0.92","Very Strong Positive"],
      ["EUR/USD","USD/CHF","-0.91","Very Strong Negative"],
      ["EUR/USD","USD/JPY","-0.72","Strong Negative"],
      ["AUD/USD","NZD/USD","+0.87","Strong Positive"],
      ["USD/CAD","WTI Oil","-0.78","Strong Negative (Oil-CAD)"],
      ["XAU/USD","USD/JPY","-0.68","Moderate Negative"],
      ["BTC/USD","NASDAQ","+0.72","Strong Positive (Risk-On)"],
    ].map(([a,b,c,d]) => `<div style="display:flex;align-items:center;justify-content:space-between;padding:9px 12px;background:rgba(255,255,255,0.03);border-radius:8px;margin-bottom:7px;font-size:.82rem;gap:8px;">
      <span style="color:#fff;font-weight:700;">${a} / ${b}</span>
      <span style="color:${c.startsWith('+') ? 'var(--green)' : 'var(--red)'};font-weight:800;font-family:var(--font-m)">${c}</span>
      <span style="color:var(--t3);font-size:.75rem">${d}</span>
    </div>`).join("")}
    <div style="margin-top:12px;padding:12px;background:rgba(240,180,41,0.07);border-radius:8px;font-size:.78rem;color:var(--t3);line-height:1.6;">⚠️ Correlations change over time. Always verify current correlations before trading correlated pairs simultaneously.</div>`;
  } else if (tool === "profit-calculator") {
    html = `<h3><i class="fa-solid fa-coins" style="color:var(--purple2);margin-right:8px"></i>Profit/Loss Simulator</h3>
    <label>Position Size (lots)</label><input type="number" id="simLots" value="1" step="0.01">
    <label>Price Change (pips)</label><input type="number" id="simPips" value="50">
    <label>Pip Value per lot ($)</label><input type="number" id="simPipVal" value="10">
    <button class="btn-calc" onclick="
      const lots=+document.getElementById('simLots').value;
      const pips=+document.getElementById('simPips').value;
      const pipVal=+document.getElementById('simPipVal').value;
      const result=lots*pips*pipVal;
      const col=result>=0?'var(--green)':'var(--red)';
      document.getElementById('simResult').innerHTML='<div style=\\'margin-top:14px;padding:14px;background:rgba(124,92,252,0.07);border:1px solid rgba(124,92,252,0.18);border-radius:10px;\\'><strong>Simulated P&L:</strong> <span style=\\'color:'+col+';font-size:1.4rem;font-weight:900\\'>'+(result>=0?'+':'')+result.toFixed(2)+'</span><br><small style=\\'color:var(--t3)\\'>'+lots+' lot × '+pips+' pips × $'+pipVal+'/pip</small></div>';
    ">Simulate P&L</button>
    <div id="simResult"></div>`;
  } else if (tool === "binary-calculator") {
    html = `<h3><i class="fa-solid fa-chart-simple" style="color:var(--purple2);margin-right:8px"></i>Binary Options Calculator</h3>
    <label>Trade Amount ($)</label><input type="number" id="binAmt" value="100" step="1">
    <label>Payout Rate (%)</label><input type="number" id="binPayout" value="82" step="1" min="1" max="100">
    <label>Estimated Win Rate (%)</label><input type="number" id="binWinRate" value="55" step="1" min="1" max="100">
    <label>Number of Trades</label><input type="number" id="binTrades" value="20" step="1" min="1">
    <button class="btn-calc" onclick="
      const amt=+document.getElementById('binAmt').value;
      const payout=+document.getElementById('binPayout').value/100;
      const wr=+document.getElementById('binWinRate').value/100;
      const trades=+document.getElementById('binTrades').value;
      const wins=Math.round(trades*wr);
      const losses=trades-wins;
      const profit=wins*amt*payout;
      const loss=losses*amt;
      const net=profit-loss;
      const col=net>=0?'var(--green)':'var(--red)';
      const be=1/(1+payout);
      document.getElementById('binResult').innerHTML='<div style=\\'margin-top:14px;padding:14px;background:rgba(124,92,252,0.07);border:1px solid rgba(124,92,252,0.2);border-radius:10px;line-height:2;\\'><strong>Over '+trades+' Trades:</strong><br>Expected Wins: <strong>'+wins+'</strong> | Losses: <strong>'+losses+'</strong><br>Gross Profit: <strong style=\\'color:var(--green)\\'>+$'+profit.toFixed(2)+'</strong><br>Gross Loss: <strong style=\\'color:var(--red)\\'>-$'+loss.toFixed(2)+'</strong><br>Net P&L: <strong style=\\'color:'+col+';font-size:1.1rem\\'>'+(net>=0?'+':'')+net.toFixed(2)+'</strong><br><hr style=\\'border:none;border-top:1px solid rgba(255,255,255,0.07);margin:10px 0\\'><span style=\\'font-size:.8rem;color:var(--t3)\\'>Break-even win rate needed: <strong style=\\'color:var(--gold)\\'>'+(be*100).toFixed(1)+'%</strong></span></div>';
    ">Calculate Expected Results</button>
    <div id="binResult"></div>
    <div style="margin-top:10px;padding:10px;background:rgba(255,95,109,0.06);border:1px solid rgba(255,95,109,0.18);border-radius:8px;font-size:.78rem;color:var(--t3);line-height:1.6;"><i class="fa-solid fa-triangle-exclamation" style="color:var(--red);margin-right:5px;"></i>Binary options carry substantial risk. Past performance does not guarantee future results. This is an educational calculator only.</div>`;
  } else {
    html = `<h3>Tool not available</h3><p style="color:var(--t3)">This tool is coming soon.</p>`;
  }

  DOM.modalOv.style.display = "flex";
  DOM.modalContent.innerHTML = html;
}

/* ============================================================
   SESSION CLOCK RENDERER
============================================================ */
function renderSessionClock() {
  const el = $("#sessionClock");
  if (!el) return;
  const sessions = [
    { name:"Sydney",   start:21*60, end:6*60,  color:"#38bdf8", tz:"Sydney (AEDT)" },
    { name:"Tokyo",    start:23*60, end:8*60,  color:"#a78bfa", tz:"Tokyo (JST)" },
    { name:"London",   start:7*60,  end:16*60, color:"#fbbf24", tz:"London (GMT/BST)" },
    { name:"New York", start:12*60, end:21*60, color:"#34d399", tz:"New York (EST/EDT)" },
  ];
  const isActive = (s, e, t) => s > e ? (t >= s || t < e) : (t >= s && t < e);
  function update() {
    const now = new Date();
    const utcH = now.getUTCHours();
    const utcM = now.getUTCMinutes();
    const utcTime = utcH * 60 + utcM;
    const clockEl = document.getElementById("sessionClock");
    if (!clockEl) return;
    clockEl.innerHTML =
      `<div style="font-family:var(--font-m);font-size:.82rem;color:var(--t3);margin-bottom:12px;padding:8px 12px;background:rgba(255,255,255,0.03);border-radius:var(--r8);">UTC Time: <strong style="color:var(--t2)">${String(utcH).padStart(2,'0')}:${String(utcM).padStart(2,'0')}</strong></div>` +
      sessions.map(s => {
        const active = isActive(s.start, s.end, utcTime);
        const startH = Math.floor(s.start/60);
        const endH = Math.floor(s.end/60);
        return `<div style="display:flex;align-items:center;justify-content:space-between;padding:11px 14px;background:${active ? s.color+'18' : 'rgba(255,255,255,0.03)'};border:1px solid ${active ? s.color+'44' : 'rgba(255,255,255,0.06)'};border-radius:var(--r8);margin-bottom:8px;transition:all .3s;">
          <span style="font-weight:700;color:${active ? s.color : 'var(--t2)'};">${s.name}</span>
          <span style="font-size:.74rem;color:var(--t3);">${String(startH).padStart(2,'0')}:00–${String(endH).padStart(2,'0')}:00 UTC</span>
          <span style="padding:3px 10px;border-radius:var(--r99);font-size:.72rem;font-weight:700;background:${active ? s.color+'22' : 'rgba(255,255,255,0.04)'};color:${active ? s.color : 'var(--t3)'};">${active ? '● OPEN' : '○ CLOSED'}</span>
        </div>`;
      }).join("") +
      `<div style="margin-top:12px;padding:11px;background:rgba(240,180,41,0.07);border-radius:var(--r8);font-size:.78rem;color:var(--t3);line-height:1.65;">
        <strong style="color:var(--gold)">💡 Best Window:</strong> London + New York overlap (12:00–16:00 UTC) — highest liquidity, tightest spreads, most opportunity.
      </div>`;
  }
  update();
  const clk = setInterval(() => {
    if (!document.getElementById("sessionClock")) { clearInterval(clk); return; }
    update();
  }, 30000);
}

/* ============================================================
   LEARNING PROGRESS SYSTEM
============================================================ */
const PROGRESS_KEY = "pand-lesson-progress";

// All module IDs that exist in the academy
const ALL_MODULES = [
  "structure","candles","risk","journal","mistakes","technical",
  "liquidity","patterns","indicators","fundamental","strategies","priceaction",
  "trendanalysis","breakout","entryexit","scalping","swingtrading",
  "psychology","sentiment","discipline","capital","tradingplan"
];

function loadProgress() {
  try { return JSON.parse(localStorage.getItem(PROGRESS_KEY) || "{}"); }
  catch(e) { return {}; }
}

function saveProgress(progress) {
  localStorage.setItem(PROGRESS_KEY, JSON.stringify(progress));
}

function toggleLessonComplete(moduleId) {
  const progress = loadProgress();
  progress[moduleId] = !progress[moduleId];
  saveProgress(progress);
  updateProgressUI();
  refreshAcadCards();
  return progress[moduleId];
}

function updateProgressUI() {
  const progress = loadProgress();
  const total = ALL_MODULES.length;
  const completed = ALL_MODULES.filter(id => progress[id]).length;
  const pct = total > 0 ? Math.round((completed / total) * 100) : 0;

  // Overall progress bar in academy
  const fill = document.getElementById("overallProgressFill");
  const text = document.getElementById("overallProgressText");
  if (fill) fill.style.width = pct + "%";
  if (text) text.textContent = `${completed} / ${total} modules completed`;

  // Level-specific progress bars
  const beginnerMods = ["structure","candles","risk","journal","mistakes","technical"];
  const intermediateMods = ["liquidity","patterns","indicators","fundamental","strategies","priceaction","trendanalysis","breakout","entryexit","scalping","swingtrading"];
  const advancedMods = ["psychology","sentiment","discipline","capital","tradingplan"];

  function setLevelBar(id, mods) {
    const el = document.getElementById(id);
    if (!el) return;
    const done = mods.filter(m => progress[m]).length;
    el.style.width = mods.length > 0 ? Math.round((done / mods.length) * 100) + "%" : "0%";
  }
  setLevelBar("prog-beginner", beginnerMods);
  setLevelBar("prog-intermediate", intermediateMods);
  setLevelBar("prog-advanced", advancedMods);

  // Profile page
  const profileCount = document.getElementById("profileLessonsCount");
  const profileFill = document.getElementById("profileLessonsFill");
  if (profileCount) profileCount.textContent = completed;
  if (profileFill) profileFill.style.width = pct + "%";
}

function refreshAcadCards() {
  const progress = loadProgress();
  document.querySelectorAll(".acad-card[data-module]").forEach(card => {
    const mod = card.dataset.module;
    if (progress[mod]) {
      card.classList.add("lesson-done");
      if (!card.querySelector(".lesson-check-badge")) {
        const badge = document.createElement("span");
        badge.className = "lesson-check-badge";
        badge.innerHTML = `<i class="fa-solid fa-circle-check"></i>`;
        card.appendChild(badge);
      }
    } else {
      card.classList.remove("lesson-done");
      const badge = card.querySelector(".lesson-check-badge");
      if (badge) badge.remove();
    }
  });
}

function buildMarkCompleteBtn(moduleId) {
  const progress = loadProgress();
  const done = !!progress[moduleId];
  return `<button class="mark-complete-btn ${done ? 'is-done' : ''}" id="markCompleteBtn" onclick="window.toggleModuleComplete('${moduleId}')">
    <i class="fa-solid ${done ? 'fa-circle-check' : 'fa-circle'}"></i>
    <span>${done ? 'Completed ✔' : 'Mark as Completed'}</span>
  </button>`;
}

window.toggleModuleComplete = function(moduleId) {
  const isDone = toggleLessonComplete(moduleId);
  const btn = document.getElementById("markCompleteBtn");
  if (btn) {
    btn.classList.toggle("is-done", isDone);
    btn.innerHTML = `<i class="fa-solid ${isDone ? 'fa-circle-check' : 'fa-circle'}"></i><span>${isDone ? 'Completed ✔' : 'Mark as Completed'}</span>`;
  }
  toast(isDone ? "Module marked as completed! 🎉" : "Module marked as incomplete.", isDone ? "success" : "info");
};


/* ============================================================
   THEME TOGGLE
============================================================ */
function initTheme() {
  const saved = localStorage.getItem("pand-theme");
  if (saved === "light") {
    STATE.theme = "light";
    document.body.classList.add("light");
    const ic = DOM.themeToggle?.querySelector("i");
    if (ic) ic.className = "fa-solid fa-sun";
  }
  if (DOM.themeToggle) {
    DOM.themeToggle.addEventListener("click", () => {
      STATE.theme = STATE.theme === "dark" ? "light" : "dark";
      document.body.classList.toggle("light", STATE.theme === "light");
      localStorage.setItem("pand-theme", STATE.theme);
      const ic = DOM.themeToggle.querySelector("i");
      if (ic) ic.className = STATE.theme === "dark" ? "fa-solid fa-moon" : "fa-solid fa-sun";
      if (STATE.chartWidget) {
        try { STATE.chartWidget.remove(); STATE.chartWidget = null; initChart(); } catch(e) {}
      }
    });
  }
}

/* ============================================================
   GLOBAL LISTENERS (subscribe, contact, ticker)
============================================================ */
function initGlobals() {
  if (DOM.subBtn) DOM.subBtn.addEventListener("click", () => {
    toast("Premium subscription coming soon! Contact: tredingpand@gmail.com", "info");
  });
  if (DOM.contactBtn) DOM.contactBtn.addEventListener("click", () => {
    window.location.href = "mailto:tredingpand@gmail.com?subject=PAND Academy Contact";
  });
  const tickers = [
    "Live Trading Dashboard • 100+ Pairs • 24/7 Market Updates",
    "New: Smart Money Concepts lesson now available in Academy",
    "London session opening • EUR/USD high-volatility expected",
    "Tip: Never risk more than 1-2% per trade — protect your capital",
    "Academy updated: ICT Order Block & FVG mastery module added",
    "Gold (XAU/USD) session active • Watch for DXY correlation",
    "Tools: Position Calculator, Risk/Reward Analyzer, Fibonacci & more",
  ];
  let tIdx = 0;
  setInterval(() => {
    tIdx = (tIdx + 1) % tickers.length;
    if (DOM.ticker) DOM.ticker.textContent = tickers[tIdx];
  }, 7000);
  // Escape key closes modal
  document.addEventListener("keydown", e => {
    if (e.key === "Escape") closeModal();
  });
}

/* ============================================================
   SCROLL TO TOP BUTTON
============================================================ */
function initScrollTop() {
  const btn = document.getElementById("scrollToTopBtn");
  if (!btn) return;
  window.addEventListener("scroll", () => {
    btn.style.opacity = window.scrollY > 350 ? "1" : "0";
    btn.style.pointerEvents = window.scrollY > 350 ? "auto" : "none";
  });
  btn.addEventListener("click", () => window.scrollTo({ top: 0, behavior: "smooth" }));
}

/* ============================================================
   PROFILE PAGE — Track progress counters
============================================================ */
function initProfile() {
  // Update upgrade button
  const upgBtn = document.querySelector(".btn-upg");
  if (upgBtn) upgBtn.addEventListener("click", () => {
    toast("Premium upgrade coming soon! Contact: tredingpand@gmail.com 📧", "info");
  });
}

/* ============================================================
   HERO TYPEWRITER EFFECT
============================================================ */
function initHeroTypewriter() {
  const el = $("#heroText");
  if (!el) return;
  const texts = ["Master the Markets","Learn Smart Money","Trade with Precision","Control Your Risk","Build Consistency"];
  let idx = 0, ci = 0, del = false;
  function tick() {
    const cur = texts[idx];
    if (!del) {
      el.textContent = cur.slice(0, ci + 1); ci++;
      if (ci === cur.length) { del = true; setTimeout(tick, 2400); return; }
    } else {
      el.textContent = cur.slice(0, ci - 1); ci--;
      if (ci === 0) { del = false; idx = (idx + 1) % texts.length; }
    }
    setTimeout(tick, del ? 42 : 78);
  }
  tick();
}

/* ============================================================
   QUIZ DATA — questions per academy module
============================================================ */
const QUIZ_DATA = {
  structure: [
    { q:"What does BOS stand for in market structure?", opts:["Break of Support","Break of Structure","Bounce on Support","Base of Swing"], correct:1, explanation:"BOS = Break of Structure. It confirms trend continuation — price breaks the previous swing high (uptrend) or swing low (downtrend)." },
    { q:"In an uptrend, what pattern of highs and lows do you see?", opts:["Lower Highs and Lower Lows","Equal Highs and Equal Lows","Higher Highs and Higher Lows","Higher Highs and Lower Lows"], correct:2, explanation:"An uptrend is defined by Higher Highs (HH) and Higher Lows (HL). This is the foundation of market structure analysis." },
    { q:"What does CHoCH (Change of Character) signal?", opts:["Trend continuation","A potential trend reversal","A sideways market","A breakout above resistance"], correct:1, explanation:"CHoCH signals a potential trend reversal. It appears when price breaks structure in the opposite direction for the first time, indicating the trend may be changing." },
    { q:"Which timeframe carries more weight in market structure?", opts:["Lower timeframes (1-min, 5-min)","Higher timeframes (Daily, Weekly)","All timeframes are equal","Only the current trading timeframe"], correct:1, explanation:"Higher timeframe structure (Daily, Weekly, Monthly) carries significantly more weight. Always trade in the direction of the higher timeframe trend." },
    { q:"What is a swing high in market structure?", opts:["The lowest point before a move up","A candle with a wick below the body","A peak where price reverses downward, with lower highs on both sides","Any candle that closes higher than the previous one"], correct:2, explanation:"A swing high is a price peak where the candles on both sides have lower highs — it's the point where price reversed from going up to going down." }
  ],
  candles: [
    { q:"What does a Hammer candlestick signal?", opts:["Bearish continuation","Bullish reversal at support","Bearish reversal at resistance","Market indecision"], correct:1, explanation:"The Hammer appears at the bottom of a downtrend at a support level. Its long lower wick shows buyers rejected lower prices — a bullish reversal signal." },
    { q:"Which candlestick pattern consists of 3 candles and signals a bullish reversal?", opts:["Evening Star","Bearish Engulfing","Morning Star","Dark Cloud Cover"], correct:2, explanation:"The Morning Star is a 3-candle bullish reversal pattern: a large red candle, followed by a small doji/indecision candle, followed by a large green candle." },
    { q:"A Doji candle means:", opts:["Strong buying pressure","Strong selling pressure","Balance between buyers and sellers — indecision","A guaranteed reversal"], correct:2, explanation:"A Doji has open ≈ close, showing perfect balance between buyers and sellers. At key levels, it signals potential reversal, but always requires confirmation from the next candle." },
    { q:"The Shooting Star candle is:", opts:["Small body at bottom with long upper wick — bearish reversal at resistance","Small body at top with long lower wick — bullish reversal","A two-candle reversal pattern","A continuation pattern"], correct:0, explanation:"Shooting Star: small body near the bottom, long upper wick. It appears at resistance and shows sellers rejected higher prices — bearish reversal signal." },
    { q:"What makes an Engulfing pattern valid?", opts:["The second candle must be any size","The second candle must completely engulf the body of the first candle","Both candles must be the same color","The candles must appear on a 5-minute chart"], correct:1, explanation:"A valid Engulfing pattern requires the second candle's body to completely engulf (cover) the body of the first candle. The second candle's body is larger than the first." }
  ],
  risk: [
    { q:"The standard professional rule for risk per trade is:", opts:["10% of account per trade","5% of account per trade","1-2% of account per trade","Whatever you can afford to lose"], correct:2, explanation:"Professional traders never risk more than 1-2% of their account on any single trade. This allows you to survive 50+ consecutive losses without blowing your account." },
    { q:"If your account is $10,000 and you risk 2%, what is your maximum loss per trade?", opts:["$1,000","$200","$500","$2,000"], correct:1, explanation:"$10,000 × 2% = $200. This means no single trade should lose more than $200. Always calculate this before entering any position." },
    { q:"What is a Risk-Reward Ratio of 1:2?", opts:["You risk $2 to make $1","You risk $1 to make $2","You win 2 trades for every 1 loss","You need a 50% win rate to break even"], correct:1, explanation:"1:2 R:R means you risk $1 (stop loss) to potentially make $2 (take profit). With this ratio, you only need a 34% win rate to be profitable." },
    { q:"What should you do when you hit your daily loss limit?", opts:["Double your position size to recover","Continue trading with smaller sizes","Stop trading for the day completely","Switch to a different market"], correct:2, explanation:"When you hit your daily loss limit (typically 3% of account), stop trading completely for the day. No exceptions. This prevents small losing days from becoming catastrophic ones." },
    { q:"Moving your stop loss further away from entry when price is going against you is:", opts:["A smart risk management technique","An acceptable adjustment for volatile markets","One of the most dangerous habits that turns small losses into large ones","Recommended for swing trading"], correct:2, explanation:"Moving a stop loss further away from entry violates your trade plan. It turns a planned 1R loss into a 3R or 5R disaster. Your stop was placed based on analysis — that reason doesn't change." }
  ],
  technical: [
    { q:"Support is best defined as:", opts:["A level where price always bounces","An area where buyers consistently overpower sellers, creating a floor","A resistance level that has been broken","The 200-day moving average"], correct:1, explanation:"Support is a price zone where buying demand has historically exceeded selling pressure, causing price to bounce. It's an area (zone), not a single line." },
    { q:"What happens when a support level is broken?", opts:["It disappears completely","It becomes a new resistance level (role reversal)","It becomes an even stronger support","Nothing — the concept is invalidated"], correct:1, explanation:"Role reversal is fundamental: when a support level is convincingly broken, it often becomes resistance. Old support = new resistance. This repeats throughout all markets." },
    { q:"The 200 EMA is primarily used as:", opts:["An entry signal on its own","A long-term trend filter — above = buy bias, below = sell bias","A short-term scalping indicator","A measure of market volatility"], correct:1, explanation:"The 200 EMA is the most widely watched trend filter. Price above = bullish bias (only look for longs). Price below = bearish bias (only look for shorts). It filters out low-probability trades." },
    { q:"A Head and Shoulders pattern signals:", opts:["Trend continuation","Bullish breakout","Bearish reversal — the trend is turning from up to down","A range-bound market"], correct:2, explanation:"Head and Shoulders is a bearish reversal pattern with three peaks — the middle peak (head) is highest, flanked by two lower peaks (shoulders). Breaking the neckline confirms the reversal." },
    { q:"What is RSI used for?", opts:["Measuring average daily range","Identifying overbought (>70) and oversold (<30) conditions for potential reversals","Calculating pip values","Determining lot sizes"], correct:1, explanation:"RSI (Relative Strength Index) is a momentum oscillator (0-100). Above 70 = overbought (potential sell zone). Below 30 = oversold (potential buy zone). Used with other signals, not alone." }
  ],
  liquidity: [
    { q:"Why do institutions target equal highs and equal lows?", opts:["Because they are strong support/resistance","Because retail stop losses cluster there — institutions need liquidity to fill large orders","Because they always break those levels","Because price always bounces from equal levels"], correct:1, explanation:"Equal highs and lows attract retail stop losses. Institutions need huge amounts of liquidity (buy/sell orders) to fill their massive positions — they target these clusters before reversing price." },
    { q:"A liquidity sweep (stop hunt) typically leads to:", opts:["Continued movement in the same direction","A high-probability reversal opportunity","A sideways consolidation","Always a trend continuation"], correct:1, explanation:"After a liquidity sweep, institutions have filled their orders and often reverse price in the opposite direction. This creates high-probability reversal entries for retail traders who recognize the pattern." },
    { q:"What is a Fair Value Gap (FVG)?", opts:["The difference between bid and ask price","A 3-candle imbalance where one side's orders weren't filled during fast price movement","A gap in the daily chart","The daily pip range"], correct:1, explanation:"An FVG occurs when a candle moves so fast that buy and sell orders on one side couldn't be matched. Price frequently returns to fill this imbalance before continuing in the original direction." },
    { q:"An Order Block (OB) is:", opts:["Any strong candle","The last opposing candle before a strong displacement move — where institutional orders were originally placed","A cluster of pending orders on a broker platform","A support/resistance zone from round numbers"], correct:1, explanation:"An Order Block is the last bearish candle before a strong bullish move (bullish OB) or the last bullish candle before a strong bearish move (bearish OB). Price often returns to these for entry." },
    { q:"In ICT methodology, buying in a 'discount' zone means:", opts:["Buying below fair value — below the 50% Fibonacci level of the current range","Buying at the highest price of the day","Buying during low liquidity periods","Buying when RSI is above 70"], correct:0, explanation:"In ICT, below 50% Fibonacci (the midpoint of the current range) = discount — cheap prices. Above 50% = premium — expensive. Buy at discount, sell at premium for best probability entries." }
  ],
  patterns: [
    { q:"A Double Top pattern signals:", opts:["Bullish continuation","Bearish reversal after two failed attempts to break the same resistance","A sideways range","Bullish breakout"], correct:1, explanation:"Double Top forms when price tests the same resistance twice and fails both times. Breaking the neckline (the low between the two tops) confirms a bearish reversal — targets the height of the pattern below." },
    { q:"An Ascending Triangle is typically a:", opts:["Bearish reversal pattern","Neutral reversal pattern","Bullish continuation pattern — breakout usually to the upside","Always a false breakout pattern"], correct:2, explanation:"An Ascending Triangle has a flat resistance top and higher lows (ascending support). It signals buying pressure building. A breakout above the flat resistance is the trade signal — typically bullish." },
    { q:"The measured move target of a Head and Shoulders pattern is:", opts:["Twice the height of the right shoulder","The height of the pattern (head to neckline) projected below the neckline","The distance to the next support level","Random — no reliable target"], correct:1, explanation:"Measured move: measure the height from the head to the neckline. Project that same distance downward from the neckline breakout point. This gives a reliable initial profit target." },
    { q:"A Bull Flag pattern consists of:", opts:["A sharp down move followed by sideways consolidation","A strong up move (the flagpole) followed by a brief downward channel (the flag)","Two equal highs with a flag shape","A triangle with upward slope"], correct:1, explanation:"Bull Flag = strong upward impulse (flagpole) followed by a brief downward-sloping channel (the flag). The breakout of the upper flag line is the entry. Target = flagpole height added to breakout point." },
    { q:"What is the key difference between a Symmetrical Triangle and a Wedge?", opts:["There is no difference — they are the same","A triangle has converging trendlines that are roughly equal in angle; a wedge has both lines sloping in the same direction","A wedge always breaks to the upside","Triangles only form on daily charts"], correct:1, explanation:"Symmetrical triangles have one line sloping up and one down (converging symmetrically). Wedges have BOTH lines sloping in the same direction (both up = rising wedge, both down = falling wedge) — typically a reversal signal." }
  ],
  indicators: [
    { q:"When is RSI considered oversold?", opts:["Above 70","Below 50","Below 30","Above 80"], correct:2, explanation:"RSI below 30 = oversold territory. This means price may have fallen too far too fast and could be due for a bounce. Always combine with price action at key support levels for confirmation." },
    { q:"A MACD bullish crossover occurs when:", opts:["The MACD line crosses above the signal line","The histogram turns negative","Price crosses above the 200 EMA","RSI goes above 50"], correct:0, explanation:"MACD bullish crossover: the MACD line (faster) crosses above the Signal line (slower). This signals increasing bullish momentum. Most powerful when it occurs below the zero line." },
    { q:"What does a Bollinger Bands squeeze indicate?", opts:["The trend is accelerating","Volatility has been very low and a breakout is likely coming soon","Price is at support","RSI is oversold"], correct:1, explanation:"When Bollinger Bands squeeze together (narrow), it signals very low volatility — a period of consolidation before a significant move. Traders watch for the direction of the breakout from the squeeze." },
    { q:"The 50 EMA crossing above the 200 EMA is known as:", opts:["Death Cross — bearish signal","Golden Cross — bullish long-term signal","MACD crossover","Stochastic divergence"], correct:1, explanation:"Golden Cross: 50 EMA crosses above 200 EMA — a major long-term bullish signal. Many institutional traders use this as a buy signal. The opposite (50 below 200) is a Death Cross — bearish." },
    { q:"ATR (Average True Range) is primarily used for:", opts:["Finding entry points","Measuring trend direction","Setting stop losses based on current market volatility","Identifying overbought conditions"], correct:2, explanation:"ATR measures volatility — the average range price moves. Traders use it to set stop losses proportional to current volatility. A stop of 1-2× ATR accounts for normal price fluctuation without being too tight." }
  ],
  fundamental: [
    { q:"Which economic release has the highest impact on USD pairs?", opts:["PMI data","Consumer Confidence","Non-Farm Payrolls (NFP)","Retail Sales"], correct:2, explanation:"NFP (Non-Farm Payrolls) is released the first Friday of every month and is the most anticipated US economic release. It directly influences Fed policy expectations and causes significant USD volatility." },
    { q:"A 'hawkish' central bank statement means:", opts:["The bank expects to cut interest rates — bearish for currency","The bank is neutral — no change expected","The bank signals interest rate hikes — bullish for currency","The bank is pausing all decisions"], correct:2, explanation:"Hawkish = aggressive monetary policy leaning toward rate hikes. Higher interest rates attract foreign capital (better returns), increasing demand for the currency. Hawkish = currency strengthens." },
    { q:"During 'risk-off' market conditions, which assets typically strengthen?", opts:["AUD, NZD, emerging market currencies","USD, JPY, CHF, Gold (safe havens)","Crypto and tech stocks","Oil and commodity currencies"], correct:1, explanation:"Risk-off = investors fear. Capital flows to safety: USD (reserve currency), JPY (Japan's huge foreign asset holdings), CHF (Swiss stability), and Gold (traditional safe haven). These strengthen while riskier assets fall." },
    { q:"CPI (Consumer Price Index) measures:", opts:["Stock market performance","Employment levels","Inflation — the rate at which prices for goods and services are rising","GDP growth"], correct:2, explanation:"CPI is the primary inflation gauge. High CPI = high inflation → central bank may raise rates (hawkish) → currency strengthens. Low CPI → may cut rates (dovish) → currency weakens." },
    { q:"The FOMC meets approximately how many times per year?", opts:["2 times","4 times","8 times","12 times"], correct:2, explanation:"The Federal Open Market Committee (FOMC) meets 8 times per year to review US monetary policy and decide on interest rates. Each meeting is a major USD volatility event for forex traders." }
  ],
  strategies: [
    { q:"In a trend-following strategy, when is the best entry?", opts:["When price is making a new high — chase the momentum","On a pullback to dynamic support (EMA) within an established uptrend","At a random point in the trend","When RSI is at 70"], correct:1, explanation:"In trend-following, you wait for pullbacks to dynamic support (like the 20 or 50 EMA) within an established uptrend. You don't chase price — you wait for it to come back to you at a better price." },
    { q:"For a breakout strategy, when do you enter?", opts:["As soon as price touches the resistance level","When the breakout candle CLOSES outside the range — confirmed by close, not just wick","On the candle before the expected breakout","When RSI is above 70"], correct:1, explanation:"Wait for a breakout candle to CLOSE outside the zone. A wick through resistance without a close is a fake-out. Candle close confirmation significantly reduces the chance of false breakouts." },
    { q:"What is the measured move target for a breakout from a rectangle pattern?", opts:["Twice the pattern height","The height of the rectangle, projected from the breakout point","The nearest Fibonacci level","Random — no reliable target"], correct:1, explanation:"Measured move = height of the consolidation range, projected from the point of breakout. If the range is 100 pips high and price breaks to the upside, the initial target is 100 pips above the breakout level." },
    { q:"The Fibonacci 61.8% level is called the 'Golden Zone' because:", opts:["It was discovered by gold miners","It produces the most reliable pullback entries — historical statistics show highest probability trades form here","It only works on gold (XAU/USD)","It equals the price of gold in some currencies"], correct:1, explanation:"61.8% is the Golden Ratio found throughout nature and financial markets. Statistically, more pullbacks in trending markets reverse near this level than any other Fibonacci level, making it the highest-probability entry zone." },
    { q:"A Reversal strategy entry requires:", opts:["Any candle at a support/resistance level","A strong confirmation candle pattern (pin bar, engulfing) at a SIGNIFICANT S/R level","Only RSI divergence","Just price touching the level quickly"], correct:1, explanation:"Reversals need confirmation: wait for price to reach a SIGNIFICANT level (major S/R, not random) AND see a clear reversal candle (pin bar, engulfing, doji with follow-through). Both conditions together = high probability." }
  ],
  journal: [
    { q:"Why is a trading journal essential for improvement?", opts:["It's not — experienced traders don't need them","It allows you to identify patterns in your mistakes and strengths with objective data","It helps you remember what you traded","Regulators require it"], correct:1, explanation:"A journal gives you objective data on your performance. Without it, you repeat the same mistakes. With it, you identify: which setups work, which timeframes suit you, which emotions cause errors. Data-driven improvement." },
    { q:"What should every journal entry include at minimum?", opts:["Just the profit or loss","Pair, direction, entry/exit prices, reason for entry, result, and emotional state","Only your entry price","Just a screenshot of the chart"], correct:1, explanation:"A complete journal entry: pair traded, direction (long/short), entry/exit/stop/target prices, reason for trade (what setup?), emotional state, and result in pips/R. This combination lets you analyze both strategy and psychology." },
    { q:"How many trades do you need before drawing conclusions about your strategy?", opts:["5-10 trades","At least 50-100 trades for statistically meaningful results","20 trades is enough","Just 1 month of trading"], correct:1, explanation:"50-100 trades minimum is the statistical threshold for meaningful strategy evaluation. With fewer trades, randomness dominates results. Many traders quit good strategies during normal variance before seeing their edge play out." },
    { q:"What is 'R' in trade journaling?", opts:["Return on investment","The dollar amount risked per trade — used to measure results in units of risk","The number of trades taken","The risk/reward ratio only"], correct:1, explanation:"R = the amount you risked on a trade. If you risked $100 and made $200, that's +2R. If you lost $100, that's -1R. Measuring in R (not dollars) lets you compare performance across different account sizes and strategies." },
    { q:"A monthly journal review should focus on:", opts:["Only the most profitable trades","Win rate, average R:R, total R (profit in risk units), most common mistakes","Just counting wins and losses","Comparing your results to other traders"] , correct:1, explanation:"Monthly review: Win rate + Average R:R + Total R (overall profitability) + Pattern of mistakes (what kept going wrong). This combination shows both strategy effectiveness and execution quality." }
  ],
  mistakes: [
    { q:"What is 'revenge trading'?", opts:["Trading with high win rates","Entering trades without proper setups immediately after a loss, trying to recover money emotionally","Using a strategy designed to beat the market","Trading the same pair multiple times"], correct:1, explanation:"Revenge trading is entering impulsive trades after losses to 'get the money back.' It bypasses all analysis, violates your plan, and almost always makes the loss bigger. Mandatory rule: take a 15-30 minute break after any loss." },
    { q:"Overtrading means:", opts:["Taking too many high-quality setups","Taking trades that don't meet your criteria, or trading too frequently out of boredom/greed","Trading on multiple timeframes","Using multiple pairs simultaneously"], correct:1, explanation:"Overtrading: taking low-quality setups, trading when conditions aren't ideal, or trading too many times per day. It increases costs (spread/commission) and reduces average trade quality. More trades ≠ more profit." },
    { q:"Why is the Martingale strategy (doubling after a loss) dangerous?", opts:["It's not — it's a proven profitable strategy","It requires large capital","A losing streak (which every trader has) leads to exponentially growing losses that can wipe the entire account","It's too complicated to calculate"], correct:2, explanation:"Martingale: double bet after every loss. After 7 losses: bet size = 128× original. A 7-loss streak (statistically common) turns a $10 bet into a $1,280 bet. One more loss and it's $2,560. This destroys accounts reliably." },
    { q:"FOMO (Fear of Missing Out) typically results in:", opts:["Better entries at lower prices","Late entries, poor risk-reward, forced tight stops, and low-probability trades","Higher win rates","Missing more profitable trades"], correct:1, explanation:"FOMO forces you to chase moves that have already happened. Result: late entry at poor price, stop has to be very tight (gets hit by normal volatility), R:R is bad. FOMO trades statistically underperform planned trades significantly." },
    { q:"Not having a written trading plan leads to:", opts:["More flexibility and better results","Purely emotional decision-making in real-time under pressure, with no systematic edge","Faster learning","Better intuition development"], correct:1, explanation:"Without a written plan, every decision is made emotionally under live market pressure. A plan defines: which pairs, which setups, when to trade, risk per trade, daily stop. Without it, you're guessing with real money." }
  ],
  psychology: [
    { q:"According to professional traders, what percentage of trading success is psychology?", opts:["20%","50%","80-90%","100%"], correct:2, explanation:"Most professional traders estimate 80-90% of long-term trading success comes from psychology and discipline, with only 10-20% from the actual strategy. A mediocre strategy followed perfectly beats a perfect strategy followed inconsistently." },
    { q:"The best way to deal with a 3-loss streak is:", opts:["Increase position size to recover faster","Switch to a completely different strategy","Take a mandatory break, review your trades, resume fresh tomorrow","Continue trading and trust your edge will return"], correct:2, explanation:"3 consecutive losses = mandatory stop for the day. Review: were they valid setups or discipline failures? Accept the statistical loss if setups were valid. Fix the issue if discipline failed. Fresh start tomorrow with clear head." },
    { q:"What is the most reliable indicator that a trade setup is valid?", opts:["Your gut feeling that this trade is a winner","Strong emotional excitement about the trade","The trade meets ALL your pre-defined criteria in your written plan — nothing more, nothing less","The trade looks good on the chart to you"], correct:2, explanation:"Valid = meets ALL your plan criteria. No more, no less. Gut feeling, excitement, and 'looks good' are emotional judgments that introduce bias. Your plan criteria are objective rules that remove emotion from the decision." },
    { q:"Processing losses as 'business expenses' rather than personal failures helps because:", opts:["It removes accountability for bad trades","It allows you to analyze losses objectively and extract learning without emotional damage","It means you don't need to review losing trades","It increases your win rate automatically"], correct:1, explanation:"Reframing losses as learning data (business expenses) detaches your ego from outcomes. This allows objective analysis: 'What can I learn from this?' instead of 'I'm a failure.' Emotional detachment from results is essential for consistency." },
    { q:"What is the biggest mistake traders make during a winning streak?", opts:["They increase their trading knowledge","They stick too rigidly to their plan","They increase position sizes beyond their plan, take lower-quality setups, and eventually give back all profits","They become too selective about their setups"], correct:2, explanation:"Winning streak danger: overconfidence. Traders increase size ('I'm on fire'), take worse setups ('this will work too'), and eventually one bad trade wipes multiple previous wins. Winning streaks are MORE dangerous than losing streaks psychologically." }
  ],
  sentiment: [
    { q:"The COT (Commitment of Traders) report shows:", opts:["Daily price movements","Net positions held by commercial, non-commercial, and retail traders — updated weekly","News events for the week","Technical indicator readings"], correct:1, explanation:"COT report (from CFTC, released every Friday): shows positions of commercial hedgers, large speculators (non-commercial), and retail traders. When commercials are heavily long, it's a bullish signal — they have the best market information." },
    { q:"When retail traders are massively positioned in one direction, smart money often:", opts:["Follows the same direction","Takes the opposite side — retail positioning is often a contrarian indicator","Exits the market completely","Has no relationship to retail positioning"], correct:1, explanation:"Retail positioning is a contrarian indicator. When 80%+ of retail traders are long a pair, smart money (institutions) often fades that position. Retail is the liquidity — they get hunted. Extreme retail positioning = warning signal." },
    { q:"A 'risk-on' environment is characterized by:", opts:["Investors buying safe haven assets and reducing risk","Investors buying higher-yielding, riskier assets — AUD, NZD, stocks rise while JPY/CHF fall","Gold reaching all-time highs","The VIX (fear index) spiking above 30"], correct:1, explanation:"Risk-on: investors feel confident and chase yield/growth. Money flows into: AUD, NZD (high yield), stocks, commodities, crypto. Money flows out of: USD, JPY, CHF, Gold. Opposite in risk-off environments." },
    { q:"The VIX index measures:", opts:["Stock market performance","Implied volatility of S&P 500 options — also called the 'fear index'","Currency volatility specifically","Interest rate expectations"], correct:1, explanation:"VIX = CBOE Volatility Index. It measures expected future volatility of the S&P 500. Above 30 = fear/uncertainty (risk-off). Below 15 = complacency (risk-on). VIX rising = sell risk assets, buy safe havens." },
    { q:"What does it mean when the DXY (US Dollar Index) is rising strongly?", opts:["All USD pairs are bullish simultaneously","Major USD pairs like EUR/USD, GBP/USD typically fall while USD/JPY, USD/CHF may rise","Gold prices typically rise with the DXY","It has no effect on individual currency pairs"], correct:1, explanation:"DXY rising = USD strengthening against a basket of 6 major currencies. EUR/USD falls (EUR weakens relative to USD). GBP/USD falls. USD/JPY rises. Gold typically falls (inverse DXY relationship). DXY is a key macro filter." }
  ]
};

/* ============================================================
   QUIZ ENGINE
============================================================ */
const QUIZ_STATE = {};

function buildQuiz(moduleKey) {
  const qs = QUIZ_DATA[moduleKey];
  if (!qs || !qs.length) return "";
  const qCount = qs.length;
  const id = `quiz_${moduleKey}`;
  if (!QUIZ_STATE[moduleKey]) {
    QUIZ_STATE[moduleKey] = { current:0, answers:[], score:0 };
  }
  return `
    <div class="quiz-section" id="${id}">
      <div class="quiz-header">
        <i class="fa-solid fa-clipboard-question"></i>
        <h3>Lesson Quiz</h3>
        <span id="${id}_counter">Question 1 of ${qCount}</span>
      </div>
      <div class="quiz-progress" id="${id}_progress">
        ${qs.map((_,i) => `<div class="quiz-dot" id="${id}_dot_${i}"></div>`).join("")}
      </div>
      <div id="${id}_question_area"></div>
      <div class="quiz-score-box" id="${id}_score"></div>
    </div>`;
}

function renderQuizQuestion(moduleKey) {
  const qs = QUIZ_DATA[moduleKey];
  const state = QUIZ_STATE[moduleKey];
  const id = `quiz_${moduleKey}`;
  const qArea = document.getElementById(`${id}_question_area`);
  const counter = document.getElementById(`${id}_counter`);
  const scoreBox = document.getElementById(`${id}_score`);
  if (!qArea) return;

  if (state.current >= qs.length) {
    // Show score
    qArea.style.display = "none";
    if (counter) counter.textContent = "Complete!";
    const pct = Math.round((state.score / qs.length) * 100);
    const msg = pct >= 80 ? "🎉 Excellent! You've mastered this lesson." : pct >= 60 ? "👍 Good work! Review the explanations to strengthen your knowledge." : "📚 Keep studying. Re-read the lesson and try again.";
    if (scoreBox) {
      const deg = Math.round(pct * 3.6);
      scoreBox.style.setProperty("--pct", `${deg}deg`);
      scoreBox.className = "quiz-score-box show";
      scoreBox.innerHTML = `
        <div class="quiz-score-circle" style="background:conic-gradient(var(--green) ${deg}deg, rgba(255,255,255,0.06) 0%)">
          <div style="position:absolute;inset:6px;border-radius:50%;background:var(--bg-2);display:flex;align-items:center;justify-content:center;">
            <span class="quiz-score-num">${pct}%</span>
          </div>
        </div>
        <div style="font-family:var(--font-d);font-size:1.1rem;font-weight:800;color:#fff;margin-bottom:8px;">${state.score}/${qs.length} Correct</div>
        <div class="quiz-score-msg">${msg}</div>
        <button class="quiz-retry-btn" onclick="retryQuiz('${moduleKey}')"><i class="fa-solid fa-rotate-right" style="margin-right:6px"></i>Retry Quiz</button>`;
    }
    // Update dots
    state.answers.forEach((a,i) => {
      const dot = document.getElementById(`${id}_dot_${i}`);
      if (dot) dot.className = `quiz-dot ${a ? 'answered-correct' : 'answered-wrong'}`;
    });
    return;
  }

  const q = qs[state.current];
  const letters = ["A","B","C","D"];
  if (counter) counter.textContent = `Question ${state.current+1} of ${qs.length}`;
  // Update dots
  for (let i=0;i<qs.length;i++){
    const dot = document.getElementById(`${id}_dot_${i}`);
    if (!dot) continue;
    if (i < state.current) dot.className = `quiz-dot ${state.answers[i] ? 'answered-correct' : 'answered-wrong'}`;
    else if (i === state.current) dot.className = "quiz-dot current";
    else dot.className = "quiz-dot";
  }

  qArea.style.display = "block";
  scoreBox.className = "quiz-score-box";
  qArea.innerHTML = `
    <div class="quiz-question">
      <div class="quiz-q-num">Question ${state.current+1}</div>
      <div class="quiz-q-text">${q.q}</div>
      <div class="quiz-options">
        ${q.opts.map((opt,i) => `
          <button class="quiz-opt" id="${id}_opt_${i}" onclick="answerQuiz('${moduleKey}',${i})">
            <span class="quiz-opt-letter">${letters[i]}</span>${opt}
          </button>`).join("")}
      </div>
      <div class="quiz-feedback" id="${id}_feedback"></div>
    </div>
    <div class="quiz-nav">
      <button class="quiz-next-btn" id="${id}_next" onclick="nextQuizQ('${moduleKey}')">
        <i class="fa-solid fa-arrow-right"></i>
        ${state.current+1 < qs.length ? "Next Question" : "See Results"}
      </button>
    </div>`;
}

function answerQuiz(moduleKey, chosenIdx) {
  const qs = QUIZ_DATA[moduleKey];
  const state = QUIZ_STATE[moduleKey];
  const id = `quiz_${moduleKey}`;
  const q = qs[state.current];
  const isCorrect = chosenIdx === q.correct;
  const feedback = document.getElementById(`${id}_feedback`);
  const nextBtn = document.getElementById(`${id}_next`);

  // Disable all options
  q.opts.forEach((_,i) => {
    const btn = document.getElementById(`${id}_opt_${i}`);
    if (!btn) return;
    btn.disabled = true;
    if (i === q.correct) btn.classList.add(isCorrect && i===chosenIdx ? "correct" : "reveal-correct");
    if (!isCorrect && i === chosenIdx) btn.classList.add("wrong");
  });

  if (isCorrect) state.score++;
  state.answers[state.current] = isCorrect;

  if (feedback) {
    feedback.className = `quiz-feedback show ${isCorrect ? "fb-correct" : "fb-wrong"}`;
    feedback.innerHTML = `<strong>${isCorrect ? "✅ Correct!" : "❌ Incorrect."}</strong> ${q.explanation}`;
  }
  if (nextBtn) nextBtn.classList.add("show");
}

function nextQuizQ(moduleKey) {
  QUIZ_STATE[moduleKey].current++;
  renderQuizQuestion(moduleKey);
}

function retryQuiz(moduleKey) {
  QUIZ_STATE[moduleKey] = { current:0, answers:[], score:0 };
  const id = `quiz_${moduleKey}`;
  const qArea = document.getElementById(`${id}_question_area`);
  if (qArea) qArea.style.display = "block";
  renderQuizQuestion(moduleKey);
}

/* ============================================================
   MODAL CLOSE
============================================================ */
function closeModal() {
  if (DOM.modalOv) DOM.modalOv.style.display = "none";
  if (DOM.modalContent) DOM.modalContent.innerHTML = "";
}

/* ============================================================
   EXPOSE GLOBAL FUNCTIONS (needed for inline onclick in dynamic HTML)
============================================================ */
window.answerQuiz = answerQuiz;
window.nextQuizQ = nextQuizQ;
window.retryQuiz = retryQuiz;
window.closeModal = closeModal;
window.toast = toast;

/* ============================================================
   ACADEMY MODULE RENDERER
============================================================ */
function initAcademy() {
  // Load and display saved progress on startup
  updateProgressUI();
  refreshAcadCards();

  // Level tab switching
  document.getElementById("levelTabs")?.addEventListener("click", e => {
    const tab = e.target.closest(".lvl-tab");
    if (!tab) return;
    const level = tab.dataset.level;
    // Update tabs
    document.querySelectorAll(".lvl-tab").forEach(t => t.classList.remove("active-lvl"));
    tab.classList.add("active-lvl");
    // Update groups
    document.querySelectorAll(".lvl-group").forEach(g => g.classList.remove("active-group"));
    const grp = document.getElementById(`lvl-${level}`);
    if (grp) grp.classList.add("active-group");
  });

  // Module card clicks
  $$(".acad-card").forEach(card => {
    card.addEventListener("click", () => {
      const mod = card.dataset.module;
      const data = ACADEMY_DATA[mod];
      if (!data) {
        toast("This module is coming soon!", "info"); return;
      }
      if (DOM.acadGroups) DOM.acadGroups.classList.add("hidden");
      if (DOM.acadContent) DOM.acadContent.classList.add("active");
      if (DOM.acadInner) {
        DOM.acadInner.innerHTML = `
          <div style="display:flex;align-items:center;gap:12px;margin-bottom:8px;">
            <div style="width:48px;height:48px;border-radius:12px;background:rgba(124,92,252,0.15);display:flex;align-items:center;justify-content:center;color:var(--purple2);font-size:1.3rem;flex-shrink:0;"><i class="fa-solid ${data.icon || 'fa-graduation-cap'}"></i></div>
            <div>
              <h2 class="mod-title" style="margin-bottom:4px;">${data.title}</h2>
              ${data.intro ? `<p style="color:var(--t3);font-size:.87rem;line-height:1.65;max-width:680px;">${data.intro}</p>` : ""}
            </div>
          </div>
          ${data.path ? `<div style="background:rgba(124,92,252,0.06);border:1px solid rgba(124,92,252,0.18);border-radius:12px;padding:14px 18px;margin-bottom:22px;display:flex;align-items:center;gap:10px;flex-wrap:wrap;"><span style="font-size:.75rem;font-weight:700;color:var(--purple3);letter-spacing:.07em;text-transform:uppercase;flex-shrink:0;">Learning Path:</span>${data.path.map((p,i)=>`<span style="display:inline-flex;align-items:center;gap:6px;font-size:.79rem;color:var(--t2);">${i>0?'<i class="fa-solid fa-chevron-right" style="color:var(--t3);font-size:.6rem;"></i>':''}<span style="background:rgba(124,92,252,0.14);padding:3px 10px;border-radius:99px;font-weight:600;">${p}</span></span>`).join("")}</div>` : ""}
          <div class="edu-grid">
            ${data.cards.map((c,idx) => `
              <div class="edu-card" style="${c.highlight ? 'border-color:rgba(240,180,41,0.3);' : ''}">
                <div style="display:flex;align-items:flex-start;justify-content:space-between;gap:10px;margin-bottom:12px;">
                  <h3 style="margin-bottom:0;"><i class="fa-solid ${c.icon}"></i> ${c.title}</h3>
                  <span style="font-size:.68rem;font-weight:700;color:var(--t3);padding:2px 8px;background:rgba(255,255,255,0.04);border-radius:99px;white-space:nowrap;flex-shrink:0;">${idx+1} of ${data.cards.length}</span>
                </div>
                ${c.body ? `<p>${c.body}</p>` : ""}
                ${c.example ? `<div style="background:rgba(0,229,255,0.05);border:1px solid rgba(0,229,255,0.15);border-radius:8px;padding:12px;margin-bottom:12px;"><div style="font-size:.72rem;font-weight:700;color:var(--cyan);letter-spacing:.06em;text-transform:uppercase;margin-bottom:6px;"><i class="fa-solid fa-lightbulb" style="margin-right:5px;"></i>Real Example</div><p style="font-size:.82rem;color:var(--t2);line-height:1.65;margin:0;">${c.example}</p></div>` : ""}
                <div class="kpoints"><strong style="display:block;font-size:.75rem;color:var(--cyan);letter-spacing:.05em;text-transform:uppercase;margin-bottom:8px;"><i class="fa-solid fa-list-check" style="margin-right:5px;"></i>Key Points</strong><ul>${c.pts.map(p => `<li>${p}</li>`).join("")}</ul></div>
                ${c.warning ? `<div style="background:rgba(255,95,109,0.06);border:1px solid rgba(255,95,109,0.2);border-radius:8px;padding:10px 12px;margin-top:10px;font-size:.79rem;color:var(--red);line-height:1.6;"><i class="fa-solid fa-triangle-exclamation" style="margin-right:5px;"></i>${c.warning}</div>` : ""}
                ${c.tip ? `<div style="background:rgba(16,217,160,0.05);border:1px solid rgba(16,217,160,0.18);border-radius:8px;padding:10px 12px;margin-top:10px;font-size:.79rem;color:var(--green);line-height:1.6;"><i class="fa-solid fa-circle-check" style="margin-right:5px;"></i>${c.tip}</div>` : ""}
              </div>`).join("")}
          </div>`;
      }
      // Inject Mark as Completed button
      if (DOM.acadInner) {
        const completeBtnDiv = document.createElement("div");
        completeBtnDiv.className = "mark-complete-wrap";
        completeBtnDiv.innerHTML = buildMarkCompleteBtn(mod);
        DOM.acadInner.appendChild(completeBtnDiv);
      }
      // Render quiz
      const quizEl = document.getElementById("quizSection");
      if (quizEl && QUIZ_DATA[mod]) {
        quizEl.innerHTML = buildQuiz(mod);
        renderQuizQuestion(mod);
      } else if (quizEl) {
        quizEl.innerHTML = "";
      }
      window.scrollTo({ top: 0, behavior: "smooth" });
    });
  });

  if (DOM.acadBack) {
    DOM.acadBack.addEventListener("click", () => {
      if (DOM.acadGroups) DOM.acadGroups.classList.remove("hidden");
      if (DOM.acadContent) DOM.acadContent.classList.remove("active");
      const quizEl = document.getElementById("quizSection");
      if (quizEl) quizEl.innerHTML = "";
    });
  }
}

/* ============================================================
   FOREX TAB SYSTEM
============================================================ */
function initTabs() {
  // Forex tabs
  $$("[data-tab='forex']").forEach(btn => {
    btn.addEventListener("click", () => {
      $$("[data-tab='forex']").forEach(b => b.classList.remove("active"));
      btn.classList.add("active");
      const target = btn.dataset.target;
      $$("#forexTabContent .tab-content").forEach(tc => tc.classList.remove("active"));
      const el = $(`#forex-${target}`);
      if (el) {
        el.classList.add("active");
        if (el.children.length === 0 && target !== "basics") renderForexTab(target, el);
      }
    });
  });
  // Binary tabs
  $$("[data-tab='binary']").forEach(btn => {
    btn.addEventListener("click", () => {
      $$("[data-tab='binary']").forEach(b => b.classList.remove("active"));
      btn.classList.add("active");
      const target = btn.dataset.target;
      $$("#binaryTabContent .tab-content").forEach(tc => tc.classList.remove("active"));
      const el = $(`#binary-${target}`);
      if (el) {
        el.classList.add("active");
        if (el.children.length === 0 && target !== "intro") renderBinaryTab(target, el);
      }
    });
  });
  // Indicator tabs — switch between indicator sections
  $$(".ind-tab").forEach(btn => {
    btn.addEventListener("click", () => {
      // Update active tab button
      $$(".ind-tab").forEach(b => b.classList.remove("active"));
      btn.classList.add("active");
      // Show the matching ind-section, hide all others
      const target = btn.dataset.ind;
      $$(".ind-section").forEach(sec => sec.classList.remove("active"));
      const section = $(`#ind-${target}`);
      if (section) {
        section.classList.add("active");
        // Smooth scroll to the indicator section top
        section.scrollIntoView({ behavior: "smooth", block: "start" });
      }
    });
  });
}

/* ============================================================
   FOREX PAIR INFO MODAL
============================================================ */
function initForexPairs() {
  $$(".pbtn").forEach(btn => {
    btn.addEventListener("click", () => {
      $$(".pbtn").forEach(b => b.classList.remove("active"));
      btn.classList.add("active");
      const info = btn.dataset.info;
      if (info && DOM.pairInfoBox) {
        DOM.pairInfoBox.style.display = "block";
        DOM.pairInfoBox.innerHTML = `
          <div style="display:flex;align-items:center;gap:10px;margin-bottom:12px;">
            <span style="font-family:var(--font-d);font-size:1.1rem;font-weight:800;color:var(--purple2);">${btn.dataset.pair}</span>
            <span style="font-size:.73rem;color:var(--t3);padding:2px 8px;background:rgba(124,92,252,0.1);border-radius:99px;">Click pair to learn</span>
          </div>
          <p style="color:var(--t2);font-size:.85rem;line-height:1.75;">${info}</p>`;
      }
    });
  });
}

/* ============================================================
   CANDLESTICK INTERACTIVE DATA & SYSTEM
============================================================ */
const CANDLESTICK_DATA = {
  "Doji": {
    emoji: "🕯️",
    signal: "neutral",
    signalLabel: "Indecision / Potential Reversal",
    meaning: "A Doji forms when the opening and closing prices are virtually identical, creating a very small or nonexistent body. It visually looks like a cross or plus sign. The Doji represents a moment of complete equilibrium between buyers and sellers — neither side is winning.",
    usage: [
      "Appears at key support or resistance levels — very powerful reversal signal in this context",
      "After a long uptrend: Doji suggests bulls are exhausted and bears may take over",
      "After a long downtrend: Doji suggests bears are losing control — potential bullish reversal",
      "Confirmation required: wait for the next candle to confirm the direction before entering",
      "Works best on H4, Daily, and Weekly timeframes — lower timeframe Dojis have less significance",
      "Different Doji variants: Long-Legged (most indecision), Dragonfly (bullish), Gravestone (bearish)"
    ],
    tip: "A Doji alone is not a trade signal — it is a WARNING. The candle that follows the Doji gives you the direction. If a bullish candle follows a Doji at support, that's your entry signal.",
    visual: { type: "doji" }
  },
  "Hammer": {
    emoji: "🔨",
    signal: "bull",
    signalLabel: "Bullish Reversal Signal",
    meaning: "A Hammer has a small body at the TOP of the candle with a long lower wick (shadow) that is at least 2× the body length. Very little or no upper wick. It forms after a downtrend and shows that sellers drove price down hard, but buyers stepped in powerfully and pushed price back up near the open.",
    usage: [
      "Must appear after a downtrend or at a key support level — context is everything",
      "The longer the lower wick, the stronger the rejection of lower prices by buyers",
      "Bullish Hammer: the body can be green or red — a green body (close > open) is stronger",
      "Enter long on the OPEN of the next candle if it confirms bullish momentum (closes above hammer)",
      "Stop loss: below the low of the hammer's wick — that's where your thesis is invalidated",
      "Best confirmation: appears at Fibonacci 61.8% level, key S/R, or EMA zone simultaneously"
    ],
    tip: "The Hammer is one of the most reliable single-candle reversal patterns. When it appears at a major support zone after a strong down move, the probability of a bounce is very high. Look for the next candle to be bullish before entering.",
    visual: { type: "hammer" }
  },
  "Shooting Star": {
    emoji: "⭐",
    signal: "bear",
    signalLabel: "Bearish Reversal Signal",
    meaning: "The Shooting Star is the bearish mirror image of the Hammer. It has a small body at the BOTTOM with a long upper wick (at least 2× the body) and little or no lower wick. It forms after an uptrend and shows buyers tried to push price higher, but sellers overwhelmed them and slammed price back down near the open.",
    usage: [
      "Must appear after an uptrend or at a key resistance level for maximum significance",
      "The long upper wick shows a failed attempt by bulls — sellers are in control",
      "Enter short on the OPEN of the next candle if it closes below the Shooting Star's body",
      "Stop loss: above the high of the upper wick — that's the invalidation level",
      "A red body (close below open) Shooting Star is more powerful than a green body",
      "Common at swing highs, round number resistance, and Fibonacci extension levels"
    ],
    tip: "The Shooting Star at a known resistance zone is a high-probability short entry. When you see it at the top of a move near a major resistance, the risk:reward for a short trade is excellent — tight stop above the wick, target at next support.",
    visual: { type: "shootingstar" }
  },
  "Bullish Engulfing": {
    emoji: "📈",
    signal: "bull",
    signalLabel: "Strong Buy Signal",
    meaning: "The Bullish Engulfing is a two-candle pattern. The first candle is bearish (red). The second candle is bullish (green) and its body completely engulfs (covers) the previous red candle's body — it opens below the previous low and closes above the previous high. This dramatic shift shows bulls have completely overwhelmed bears.",
    usage: [
      "A two-candle pattern — you need BOTH candles to form the pattern",
      "The second (green) candle must COMPLETELY engulf the first (red) candle's body",
      "Stronger signal when it appears at key support, EMA, or after a prolonged downtrend",
      "High volume on the engulfing candle makes the signal much more reliable",
      "Enter on the CLOSE or next candle OPEN of the bullish engulfing candle",
      "Stop: below the low of the entire two-candle pattern (below the first red candle's low)"
    ],
    tip: "The larger the bullish candle relative to the bearish candle it engulfs, the stronger the signal. A massive green candle engulfing a tiny red candle is a very powerful institutional buying signal — often seen at Order Block zones.",
    visual: { type: "engulfing_bull" }
  },
  "Bearish Engulfing": {
    emoji: "📉",
    signal: "bear",
    signalLabel: "Strong Sell Signal",
    meaning: "The Bearish Engulfing is the opposite — a two-candle pattern where a large bearish (red) candle completely engulfs the previous bullish (green) candle's body. It signals a decisive shift in power from buyers to sellers. The bears have taken complete control in a single candle.",
    usage: [
      "The red (bearish) candle must fully engulf the previous green (bullish) candle's body",
      "Most powerful when appearing at a known resistance level or after a strong uptrend",
      "Enter short on the CLOSE of the bearish engulfing candle or the OPEN of the next candle",
      "Stop: above the high of the two-candle pattern (above the engulfing candle's high)",
      "High trading volume during the bearish candle dramatically increases reliability",
      "Particularly effective at Daily and H4 resistance zones, Fibonacci extensions, and supply zones"
    ],
    tip: "When a Bearish Engulfing appears after a long rally at a major resistance zone, it often marks a significant swing high. This is where institutional sellers enter — they push price down hard enough to engulf multiple prior buy candles.",
    visual: { type: "engulfing_bear" }
  },
  "Morning Star": {
    emoji: "🌟",
    signal: "bull",
    signalLabel: "3-Candle Bullish Reversal",
    meaning: "The Morning Star is a powerful 3-candle bullish reversal pattern: (1) A large bearish candle continuing the downtrend, (2) A small body candle (Doji or Spinning Top) showing indecision — the 'star', (3) A large bullish candle that closes at least 50% into the first bearish candle's body. This pattern signals the downtrend is ending and buyers are taking control.",
    usage: [
      "Three candles required: large bearish → small indecision → large bullish",
      "The third candle must close at least halfway into the first candle's body — the more, the better",
      "Strongest when appearing after a prolonged downtrend at a major support level",
      "The 'gap' between the star and the other candles in traditional markets adds strength",
      "Enter long on the CLOSE of the third candle or the OPEN of the fourth candle",
      "Stop: below the low of the second candle (the star) — that's the invalidation"
    ],
    tip: "The Morning Star is one of the most complete reversal signals because it shows the entire reversal story in 3 candles: selling climax → exhaustion/indecision → buyers take charge. When this forms at major monthly/weekly support, take it seriously.",
    visual: { type: "morningstar" }
  },
  "Evening Star": {
    emoji: "🌑",
    signal: "bear",
    signalLabel: "3-Candle Bearish Reversal",
    meaning: "The Evening Star is the bearish mirror of the Morning Star: (1) A large bullish candle showing the uptrend in force, (2) A small candle with a little body showing indecision at the highs, (3) A large bearish candle that closes at least 50% into the first bullish candle's body, confirming sellers have taken over.",
    usage: [
      "Three-candle pattern: large bullish → small indecision → large bearish",
      "Third (bearish) candle must close at least halfway into the first candle's body",
      "Most powerful at major resistance zones, round numbers, and previous swing highs",
      "Enter short on the CLOSE of the third candle or the OPEN of the fourth candle",
      "Stop: above the high of the second candle (the star) — this is where the pattern fails",
      "Works excellently at Daily and Weekly chart resistance for swing trading entries"
    ],
    tip: "The Evening Star often appears at the top of extended rallies where buyers have pushed too far too fast. The small middle candle (star) represents buyers losing momentum at resistance before sellers crush the advance. Watch for this at key HTF resistance.",
    visual: { type: "eveningstar" }
  },
  "Pin Bar": {
    emoji: "🎯",
    signal: "neutral",
    signalLabel: "Level Rejection Signal",
    meaning: "A Pin Bar (Pinocchio Bar) has a very small body and an extremely long wick on one side, with little or no wick on the other side. The long wick represents a sharp price rejection — the market tested a level aggressively but completely reversed. Pin bars are price action's way of saying 'this level was REJECTED hard.'",
    usage: [
      "Bullish Pin Bar: long lower wick — price rejected lower prices, buyers in control",
      "Bearish Pin Bar: long upper wick — price rejected higher prices, sellers in control",
      "Context is critical: a pin bar AT support or resistance carries 10× more weight",
      "The longer the wick relative to the body, the more aggressive the rejection",
      "Enter on the CLOSE of the pin bar or the OPEN of the next candle in direction of rejection",
      "Stop: beyond the tip of the wick — if price goes past the wick's extreme, the rejection has failed"
    ],
    tip: "The Pin Bar is one of the most versatile and reliable price action signals. A pin bar at a Daily level is like the market leaving a fingerprint — institutional traders rejected that price zone. These setups recur reliably at the same levels repeatedly.",
    visual: { type: "pinbar" }
  }
};

function buildCandleVisualHTML(type) {
  const candles = {
    doji: `<div class="cand-candle"><div class="cand-wick" style="height:45px;background:var(--t2);"></div><div class="cand-body" style="height:3px;background:var(--gold);"></div><div class="cand-wick" style="height:45px;background:var(--t2);"></div></div>`,
    hammer: `<div class="cand-candle"><div class="cand-wick" style="height:5px;background:var(--green);"></div><div class="cand-body" style="height:18px;background:var(--green);"></div><div class="cand-wick" style="height:55px;background:var(--green);"></div></div>`,
    shootingstar: `<div class="cand-candle"><div class="cand-wick" style="height:55px;background:var(--red);"></div><div class="cand-body" style="height:18px;background:var(--red);"></div><div class="cand-wick" style="height:5px;background:var(--red);"></div></div>`,
    engulfing_bull: `<div class="cand-candle"><div class="cand-wick" style="height:6px;background:var(--red);"></div><div class="cand-body" style="height:28px;background:var(--red);"></div><div class="cand-wick" style="height:6px;background:var(--red);"></div></div><div class="cand-candle" style="margin-left:4px"><div class="cand-wick" style="height:8px;background:var(--green);"></div><div class="cand-body" style="height:48px;background:var(--green);"></div><div class="cand-wick" style="height:8px;background:var(--green);"></div></div>`,
    engulfing_bear: `<div class="cand-candle"><div class="cand-wick" style="height:6px;background:var(--green);"></div><div class="cand-body" style="height:28px;background:var(--green);"></div><div class="cand-wick" style="height:6px;background:var(--green);"></div></div><div class="cand-candle" style="margin-left:4px"><div class="cand-wick" style="height:8px;background:var(--red);"></div><div class="cand-body" style="height:48px;background:var(--red);"></div><div class="cand-wick" style="height:8px;background:var(--red);"></div></div>`,
    morningstar: `<div class="cand-candle"><div class="cand-wick" style="height:6px;background:var(--red);"></div><div class="cand-body" style="height:38px;background:var(--red);"></div><div class="cand-wick" style="height:6px;background:var(--red);"></div></div><div class="cand-candle" style="margin-left:3px;margin-bottom:20px"><div class="cand-wick" style="height:5px;background:var(--gold);"></div><div class="cand-body" style="height:9px;background:var(--gold);"></div><div class="cand-wick" style="height:5px;background:var(--gold);"></div></div><div class="cand-candle" style="margin-left:3px"><div class="cand-wick" style="height:6px;background:var(--green);"></div><div class="cand-body" style="height:38px;background:var(--green);"></div><div class="cand-wick" style="height:6px;background:var(--green);"></div></div>`,
    eveningstar: `<div class="cand-candle"><div class="cand-wick" style="height:6px;background:var(--green);"></div><div class="cand-body" style="height:38px;background:var(--green);"></div><div class="cand-wick" style="height:6px;background:var(--green);"></div></div><div class="cand-candle" style="margin-left:3px;margin-bottom:20px"><div class="cand-wick" style="height:5px;background:var(--gold);"></div><div class="cand-body" style="height:9px;background:var(--gold);"></div><div class="cand-wick" style="height:5px;background:var(--gold);"></div></div><div class="cand-candle" style="margin-left:3px"><div class="cand-wick" style="height:6px;background:var(--red);"></div><div class="cand-body" style="height:38px;background:var(--red);"></div><div class="cand-wick" style="height:6px;background:var(--red);"></div></div>`,
    pinbar: `<div class="cand-candle"><div class="cand-wick" style="height:4px;background:var(--gold);"></div><div class="cand-body" style="height:10px;background:var(--gold);"></div><div class="cand-wick" style="height:65px;background:var(--gold);"></div></div>`
  };
  return `<div class="cand-visual-svg">${candles[type] || ""}</div>`;
}

function openCandlestickDetail(name) {
  const data = CANDLESTICK_DATA[name];
  if (!data) { toast("Pattern info coming soon!", "info"); return; }
  const sigClass = data.signal === "bull" ? "cand-sig-bull" : data.signal === "bear" ? "cand-sig-bear" : "cand-sig-neutral";
  const sigIcon = data.signal === "bull" ? "fa-arrow-trend-up" : data.signal === "bear" ? "fa-arrow-trend-down" : "fa-circle";
  DOM.modalContent.innerHTML = `
    <div class="cand-detail-wrap">
      <div class="cand-detail-header">
        <span class="cand-emoji">${data.emoji}</span>
        <div>
          <div class="cand-name-big">${name}</div>
          <div class="cand-sig-badge ${sigClass}"><i class="fa-solid ${sigIcon}"></i> ${data.signalLabel}</div>
        </div>
      </div>
      ${buildCandleVisualHTML(data.visual.type)}
      <div class="cand-section">
        <div class="cand-section-title"><i class="fa-solid fa-info-circle" style="margin-right:5px;color:var(--purple2)"></i> What It Means</div>
        <p class="cand-body-text">${data.meaning}</p>
      </div>
      <div class="cand-section">
        <div class="cand-section-title"><i class="fa-solid fa-crosshairs" style="margin-right:5px;color:var(--cyan)"></i> How to Trade It</div>
        <ul class="cand-usage-list">${data.usage.map(u => `<li>${u}</li>`).join("")}</ul>
      </div>
      <div class="cand-section">
        <div class="cand-section-title"><i class="fa-solid fa-lightbulb" style="margin-right:5px;color:var(--gold)"></i> Pro Tip</div>
        <div class="cand-tip-box"><i class="fa-solid fa-circle-check" style="margin-right:7px;"></i>${data.tip}</div>
      </div>
    </div>`;
  DOM.modalOv.style.display = "flex";
}

function initCandlestickCards() {
  $$(".cq-card").forEach(card => {
    const name = card.querySelector(".cq-name")?.textContent?.trim();
    if (!name) return;
    card.addEventListener("click", () => openCandlestickDetail(name));
    card.title = `Click to learn about ${name}`;
    card.style.cursor = "pointer";
  });
}

/* ============================================================
   VIDEO COURSE MODAL SYSTEM
============================================================ */
function openVideoCourseModal() {
  DOM.modalContent.innerHTML = `
    <div class="course-locked-screen">
      <span class="cls-icon"><i class="fa-solid fa-lock"></i></span>
      <div class="cls-title">Premium Trading Video Course</div>
      <div class="cls-price">$50 USD</div>
      <span class="cls-price-label">One-time payment · Lifetime access to all videos</span>
      <div class="cls-effort-note">
        <i class="fa-solid fa-heart" style="margin-right:7px;color:var(--red)"></i>
        <strong>Why is this course paid?</strong> This course represents months of research, professional recording, editing, and the real-world experience of traders who built and lost real accounts. Every lesson is the result of real effort, real time, and genuine quality — not generic content. We charge $50 to ensure only serious, committed traders access it.
      </div>
      <div class="cls-free-note">
        <strong><i class="fa-solid fa-circle-check" style="margin-right:6px;color:var(--green)"></i> Important Note — Free Platform</strong>
        This platform allows you to learn trading completely for free without purchasing this video course. All Academy lessons, Forex & Binary guides, Trading Tools, quizzes, and community features are fully accessible at zero cost. The video course is an optional premium upgrade offering advanced structured video content, live trade walkthroughs, and deeper strategy breakdowns for serious traders who want to accelerate their learning.
      </div>
      <p class="cls-message">To purchase the course or ask questions before buying, enter your email below and click Contact Support. We will respond within 24 hours with payment instructions and full course details.</p>
      <div class="cls-email-wrap">
        <input class="cls-email-inp" type="email" id="courseEmailInp" placeholder="Your email address...">
        <button class="cls-contact-btn" onclick="submitCourseContact()"><i class="fa-solid fa-paper-plane" style="margin-right:7px;"></i>Contact Support / Buy Course</button>
      </div>
      <p style="font-size:.76rem;color:var(--t3);margin-top:8px;">Or email us directly: <a href="mailto:tredingpand@gmail.com" style="color:var(--purple3);">tredingpand@gmail.com</a></p>
    </div>`;
  DOM.modalOv.style.display = "flex";
}

function submitCourseContact() {
  const emailInp = document.getElementById("courseEmailInp");
  const email = emailInp ? emailInp.value.trim() : "";
  if (!email || !email.includes("@")) {
    toast("Please enter a valid email address.", "error");
    if (emailInp) { emailInp.focus(); emailInp.style.borderColor = "var(--red)"; }
    return;
  }
  if (emailInp) emailInp.style.borderColor = "";
  // Show confirmation
  DOM.modalContent.innerHTML = `
    <div style="text-align:center;padding:20px 0;">
      <i class="fa-solid fa-circle-check" style="font-size:3.5rem;color:var(--green);margin-bottom:16px;display:block;filter:drop-shadow(0 0 16px rgba(15,214,160,0.5));"></i>
      <div style="font-family:var(--font-d);font-size:1.35rem;font-weight:800;color:#fff;margin-bottom:10px;">Request Sent!</div>
      <p style="color:var(--t2);font-size:.88rem;line-height:1.75;max-width:360px;margin:0 auto 18px;">Thank you! We have received your interest for the Premium Video Course. We will contact <strong style="color:var(--purple3);">${email}</strong> within 24 hours with full details and payment instructions.</p>
      <div style="background:rgba(15,214,160,0.07);border:1px solid rgba(15,214,160,0.2);border-radius:12px;padding:14px 18px;font-size:.82rem;color:var(--green);line-height:1.65;margin-bottom:16px;text-align:left;">
        <i class="fa-solid fa-circle-check" style="margin-right:7px;"></i>While you wait, continue using all of the FREE educational content available on this platform — Academy lessons, Live Charts, Trading Tools, and more are all completely free.
      </div>
      <button onclick="closeModal()" style="padding:10px 24px;background:linear-gradient(135deg,var(--purple),#9333ea);border:none;border-radius:999px;color:#fff;font-weight:700;font-size:.88rem;cursor:pointer;transition:all .2s;">Back to Platform</button>
    </div>`;
  toast("Course request submitted! Check your email for our response.", "success");
}

function initVideoCourse() {
  const vcBtn = document.getElementById("openVideoCourse");
  if (vcBtn) vcBtn.addEventListener("click", openVideoCourseModal);
  const navVcBtn = document.getElementById("navVideoCourseBtn");
  if (navVcBtn) navVcBtn.addEventListener("click", openVideoCourseModal);
}

window.submitCourseContact = submitCourseContact;

/* ============================================================
   DOMContentLoaded — BOOT SEQUENCE
============================================================ */
document.addEventListener("DOMContentLoaded", () => {
  cacheDOM();
  createParticles();
  initSplash();
  initLogin();
  initNavigation();
  initMobileNav();
  initChartControls();
  initTabs();
  initForexPairs();
  initAcademy();
  initTools();
  initTheme();
  initGlobals();
  initScrollTop();
  initProfile();
  initHeroTypewriter();
  initCandlestickCards();
  initVideoCourse();
});

/* ============================================================
   RENDER FOREX TAB CONTENT (on-demand for empty tabs)
============================================================ */

/* ============================================================
   RENDER BINARY TAB CONTENT (on-demand for empty tabs)
============================================================ */

window.renderForexTab = renderForexTab;
window.renderBinaryTab = renderBinaryTab;

})();
