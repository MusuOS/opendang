/* 党案百科 · 首页脚本：数据现读 preview/仓内同名 JSON，与词条页「静态＋JSON」同构。
   全部文本以 textContent 建 DOM，不拼原始 HTML。 */
(function () {
  "use strict";
  function el(tag, cls, text) {
    var n = document.createElement(tag);
    if (cls) n.className = cls;
    if (text != null) n.textContent = text;
    return n;
  }
  function fmt(n) { return Number(n).toLocaleString("en-US"); }
  function fetchText(url) {
    return fetch(url).then(function (r) {
      if (!r.ok) throw new Error(url + " " + r.status);
      return r.text();
    });
  }
  function fetchJSON(url) { return fetchText(url).then(function (t) { return JSON.parse(t); }); }

  /* ---------- Agent 引导按钮 ---------- */
  var promptText = null;
  var fallbackNode = document.getElementById("agent-prompt-fallback");
  if (fallbackNode) promptText = fallbackNode.textContent.replace(/^\n+|\n+$/g, "");
  fetchText("agent-prompt.txt").then(function (t) { promptText = t.replace(/\n+$/, ""); }).catch(function () {});
  var btn = document.getElementById("agent-btn");
  if (btn) {
    var btnLabel = btn.textContent;
    btn.addEventListener("click", function () {
      function done() {
        btn.textContent = "已复制 · 粘给自己的 Agent 即可";
        btn.classList.add("copied");
        setTimeout(function () { btn.textContent = btnLabel; btn.classList.remove("copied"); }, 2600);
      }
      var text = promptText || "";
      if (navigator.clipboard && navigator.clipboard.writeText) {
        navigator.clipboard.writeText(text).then(done, function () { legacyCopy(text); done(); });
      } else { legacyCopy(text); done(); }
    });
  }
  function legacyCopy(text) {
    var ta = document.createElement("textarea");
    ta.value = text;
    ta.style.position = "fixed"; ta.style.opacity = "0";
    document.body.appendChild(ta); ta.select();
    try { document.execCommand("copy"); } catch (e) {}
    document.body.removeChild(ta);
  }

  /* ---------- 搜索 + 全站索引（共用 search-index.json） ---------- */
  var indexData = null;
  var input = document.getElementById("search-input");
  var results = document.getElementById("search-results");
  var indexBox = document.getElementById("full-index");
  function personRow(p, showCount) {
    var row = el("div", "hit");
    var a = el("a", null, p.name);
    a.href = "entries/" + p.id + ".html";
    row.appendChild(a);
    if (p.aliases && p.aliases.length) row.appendChild(el("span", "aka", p.aliases.join("、")));
    if (showCount) row.appendChild(el("span", "cnt", "提及 " + fmt(p.mentions)));
    return row;
  }
  function renderIndex(list) {
    if (!indexBox) return;
    indexBox.innerHTML = "";
    var frag = document.createDocumentFragment();
    list.forEach(function (p) {
      var d = el("div", "ix");
      var a = el("a", null, p.name);
      a.href = "entries/" + p.id + ".html";
      d.appendChild(a);
      if (p.aliases && p.aliases.length) d.appendChild(el("span", "aka", "（" + p.aliases.join("、") + "）"));
      d.appendChild(el("span", "cnt", fmt(p.mentions)));
      frag.appendChild(d);
    });
    indexBox.appendChild(frag);
  }
  fetchJSON("search-index.json").then(function (list) {
    indexData = list;
    var byId = list.slice().sort(function (a, b) { return a.id < b.id ? -1 : a.id > b.id ? 1 : 0; });
    renderIndex(byId);
    if (input) {
      input.addEventListener("input", function () {
        var q = input.value.trim();
        results.innerHTML = "";
        if (!q) return;
        var hits = indexData.filter(function (p) {
          if (p.name.indexOf(q) >= 0) return true;
          return (p.aliases || []).some(function (x) { return x.indexOf(q) >= 0; });
        });
        if (!hits.length) { results.appendChild(el("div", "search-empty", "无此人。")); return; }
        hits.slice(0, 40).forEach(function (p) { results.appendChild(personRow(p, true)); });
        if (hits.length > 40) results.appendChild(el("div", "search-empty", "共 " + hits.length + " 人，仅列前 40。"));
      });
    }
  }).catch(function () {
    if (indexBox) indexBox.appendChild(el("div", "loading", "索引载入失败。"));
  });

  /* ---------- 派系人马 · 页签切换（现读 faction-members.json，与 factions.html 同源同口径：
       构建时由 build_hubs.compute_members 生成，裁定优先、无裁定取最晚一期断言） ---------- */
  var tabsBox = document.getElementById("faction-tabs");
  var panelBox = document.getElementById("faction-panel");
  if (tabsBox && panelBox) {
    fetchJSON("faction-members.json").then(function (data) {
      var list = data.factions || [];
      var TABDEF = [{ name: "江派", label: "江" }, { name: "胡锦涛派", label: "胡" }, { name: "习包子派系", label: "习" }];
      function tabRank(f) { for (var k = 0; k < TABDEF.length; k++) if (TABDEF[k].name === f.name) return k; return 99; }
      function tabLabel(f) { for (var k = 0; k < TABDEF.length; k++) if (TABDEF[k].name === f.name) return TABDEF[k].label; return f.name; }
      list.sort(function (a, b) { return tabRank(a) - tabRank(b); });
      tabsBox.innerHTML = "";
      panelBox.innerHTML = "";
      var tabs = [];
      function renderPanel(f) {
        panelBox.innerHTML = "";
        var card = el("div", "faction-card");
        if (f.aliases && f.aliases.length) card.appendChild(el("div", "f-aka", "又称 " + f.aliases.join("、")));
        card.appendChild(el("div", "f-stats", "正文提及 " + fmt(f.body_mentions || 0) + " · 标题见 " + fmt(f.title_eps || 0) + " 期 · 简介见 " + fmt(f.desc_eps || 0) + " 期"));
        if (f.units && f.units.length) card.appendChild(el("div", "f-units", "构成：" + f.units.join("、")));
        var ms = f.members || [];
        if (ms.length) {
          var box = el("div", "f-members");
          box.appendChild(el("span", "fm-h", "现行归派 " + ms.length + " 人（裁定 " + f.ruled + " 人 · 据最晚断言 " + (ms.length - f.ruled) + " 人）："));
          ms.forEach(function (m, i) {
            if (i) box.appendChild(document.createTextNode("、"));
            if (m.id) {
              var a = el("a", null, m.name);
              a.href = "entries/" + m.id + ".html";
              box.appendChild(a);
            } else {
              box.appendChild(document.createTextNode(m.name));
            }
            box.appendChild(el("span", "meta", "（" + m.tag + "）"));
          });
          card.appendChild(box);
        }
        panelBox.appendChild(card);
      }
      function renderCard(f) {
        var card = el("div", "faction-card");
        card.appendChild(el("div", "f-name", f.name));
        if (f.aliases && f.aliases.length) card.appendChild(el("div", "f-aka", "又称 " + f.aliases.join("、")));
        card.appendChild(el("div", "f-stats", (f.status ? f.status + " · " : "") + "正文提及 " + fmt(f.body_mentions || 0) + " · 标题见 " + fmt(f.title_eps || 0) + " 期 · 简介见 " + fmt(f.desc_eps || 0) + " 期"));
        if (f.units && f.units.length) card.appendChild(el("div", "f-units", "构成：" + f.units.join("、")));
        if (f.note) card.appendChild(el("div", "f-units", f.note));
        var ms = f.members || [];
        if (ms.length) {
          var box = el("div", "f-members");
          box.appendChild(el("span", "fm-h", "现行归派 " + ms.length + " 人（裁定 " + f.ruled + " 人 · 据最晚断言 " + (ms.length - f.ruled) + " 人）："));
          ms.forEach(function (m, i) {
            if (i) box.appendChild(document.createTextNode("、"));
            if (m.id) {
              var a = el("a", null, m.name);
              a.href = "entries/" + m.id + ".html";
              box.appendChild(a);
            } else {
              box.appendChild(document.createTextNode(m.name));
            }
            box.appendChild(el("span", "meta", "（" + m.tag + "）"));
          });
          card.appendChild(box);
        }
        return card;
      }
      var tabList = list.filter(function (f) { return tabRank(f) < 99; });
      tabList.forEach(function (f, i) {
        var b = el("button", null, tabLabel(f));
        b.type = "button";
        b.setAttribute("role", "tab");
        b.setAttribute("aria-selected", i === 0 ? "true" : "false");
        b.addEventListener("click", function () {
          tabs.forEach(function (t) { t.setAttribute("aria-selected", "false"); });
          b.setAttribute("aria-selected", "true");
          renderPanel(f);
        });
        tabs.push(b);
        tabsBox.appendChild(b);
      });
      var cardsBox = document.getElementById("faction-cards");
      if (cardsBox) {
        cardsBox.innerHTML = "";
        list.forEach(function (f) { if (tabRank(f) === 99) cardsBox.appendChild(renderCard(f)); });
      }
      if (tabList.length) renderPanel(tabList[0]);
    }).catch(function () {
      tabsBox.innerHTML = "";
      tabsBox.appendChild(el("div", "loading", "派系表载入失败。"));
    });
  }

  /* ---------- 时间线 + 罗生门 + 最近更新（现读 home-data.json） ---------- */
  fetchJSON("home-data.json").then(function (d) {
    var fresh = document.getElementById("freshline");
    if (fresh && d.fresh) {
      fresh.innerHTML = "";
      fresh.appendChild(el("span", "dot", "● "));
      fresh.appendChild(document.createTextNode(d.fresh));
    }
    var ybox = document.getElementById("year-rows");
    if (ybox && d.years) {
      var max = Math.max.apply(null, d.years.map(function (y) { return y.count; }));
      ybox.innerHTML = "";
      d.years.forEach(function (y) {
        var row = el("div", "year-row");
        row.appendChild(el("span", "y", String(y.year)));
        var bar = el("span", "bar");
        var fill = document.createElement("i");
        fill.style.width = Math.max(1.5, (y.count / max) * 100) + "%";
        bar.appendChild(fill);
        row.appendChild(bar);
        row.appendChild(el("span", "n", fmt(y.count) + " 期"));
        ybox.appendChild(row);
      });
    }
    var rbox = document.getElementById("recent-list");
    if (rbox && d.recent) {
      rbox.innerHTML = "";
      d.recent.forEach(function (e) {
        var li = document.createElement("li");
        li.appendChild(el("span", "r-date", e.date));
        li.appendChild(el("span", "r-ep", "第" + e.ep + "期"));
        var t = el("span", "r-title");
        var a = el("a", null, e.title);
        a.href = e.url; a.target = "_blank"; a.rel = "noopener";
        t.appendChild(a);
        li.appendChild(t);
        rbox.appendChild(li);
      });
    }
    var lbox = document.getElementById("lsm-grid");
    if (lbox && d.luoshengmen) {
      lbox.innerHTML = "";
      d.luoshengmen.forEach(function (c) {
        var card = el("div", "lsm-card");
        var name = el("div", "p-name");
        var a = el("a", null, c.person);
        a.href = "entries/" + c.person_id + ".html";
        name.appendChild(a);
        card.appendChild(name);
        var now = el("div", "row");
        var t1 = el("span", "tag tag-now", "现行口径");
        now.appendChild(t1);
        now.appendChild(document.createTextNode(c.current));
        card.appendChild(now);
        var old = el("div", "row old");
        var t2 = el("span", "tag tag-old", "旧说曾为");
        old.appendChild(t2);
        old.appendChild(document.createTextNode(c.old));
        card.appendChild(old);
        lbox.appendChild(card);
      });
    }
  }).catch(function () {});
})();
