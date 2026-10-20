/* 党案百科 · 词条页脚本 v2（全站共用一份，原生 JS，无依赖）
   页面 = 静态文案 × 模板 × 数据：文案已烤入 HTML；本脚本只负责
   从同名 JSON 数据包现读「现行裁定 / 时点注记 / 附册挂链」与
   「全部事件 / 关系」清单。无脚本时页面文案照常可读（见 noscript）。 */
(function () {
  "use strict";
  var root = document.getElementById("entry-root");
  if (!root) return;
  var jsonUrl = root.getAttribute("data-json");
  if (!jsonUrl) return;

  function $(id) { return document.getElementById(id); }
  function el(tag, cls, text) {
    var n = document.createElement(tag);
    if (cls) n.className = cls;
    if (text != null) n.textContent = text;
    return n;
  }
  function yt(vid) { return "https://www.youtube.com/watch?v=" + vid; }
  function fetchJson(url) {
    return fetch(url).then(function (r) {
      if (!r.ok) throw new Error("HTTP " + r.status + " @ " + url);
      return r.json();
    });
  }
  function srcLine(container, date, vid) {
    var p = el("p", "src", "出自 " + (date || "") + " 期 · ");
    var a = el("a", null, "原视频 ↗");
    a.href = yt(vid); a.target = "_blank"; a.rel = "noopener";
    p.appendChild(a);
    container.appendChild(p);
  }

  /* ---------- 现行口径视图：裁定 / 注记 / 挂链 ---------- */
  var REGNAMES = {
    "capital-groups": "资本系册", "fat-posts": "职位交易账",
    "listed-companies": "上市公司册", "dev-projects": "开发项目库"
  };

  function renderCurrent(pkg) {
    var calBox = $("caliber-list");
    if (calBox) {
      calBox.textContent = "";
      if (pkg.current_caliber && pkg.current_caliber.length) {
        var ul = el("ul", "cal");
        pkg.current_caliber.forEach(function (c) {
          var li = el("li");
          li.appendChild(el("span", "cat", c.category || "裁定"));
          li.appendChild(document.createTextNode(c.ruling || ""));
          var meta = "〔" + (c.id || "") + (c.date ? " · " + c.date : "") + "〕";
          if (c.effect) meta += "（" + c.effect + "）";
          li.appendChild(el("span", "meta", meta));
          ul.appendChild(li);
        });
        calBox.appendChild(ul);
      } else {
        calBox.appendChild(el("p", "meta", "本档暂无单独裁定条目，口径散见各期事件卡。"));
      }
    }

    var tnBox = $("timenotes");
    if (tnBox) {
      tnBox.textContent = "";
      if (pkg.time_notes && pkg.time_notes.length) {
        pkg.time_notes.forEach(function (t) {
          var d = el("div", "tn");
          if (t.item) d.appendChild(el("div", "tn-item", t.item));
          if (t.ruling) d.appendChild(el("div", "tn-ruling", t.ruling));
          var bits = [];
          if (t.id) bits.push(t.id);
          if (t.date) bits.push(t.date);
          if (t.basis) bits.push(t.basis);
          if (bits.length) d.appendChild(el("div", "tn-meta", bits.join(" · ")));
          if (t.history) d.appendChild(el("div", "tn-meta", t.history));
          if (t.effect) d.appendChild(el("div", "tn-meta", "效力：" + t.effect));
          tnBox.appendChild(d);
        });
      } else {
        tnBox.appendChild(el("p", "meta", "本档暂无时点注记。"));
      }
    }

    var regBox = $("registers");
    if (regBox && pkg.register_links && pkg.register_links.length) {
      regBox.textContent = "";
      regBox.appendChild(el("h3", null, "附册挂链"));
      var ul2 = el("ul");
      pkg.register_links.forEach(function (r) {
        var li = el("li");
        li.appendChild(document.createTextNode(
          (REGNAMES[r.register] || r.register) + " · " + (r.entry || "")));
        li.appendChild(el("span", "meta", "（提及 " + (r.n_eps || 0) + " 期）"));
        ul2.appendChild(li);
      });
      regBox.appendChild(ul2);
    }
  }

  /* ---------- 诸说并存视图：关系与事件全录 ---------- */
  function makeRelItem(r) {
    var li = el("li");
    li.appendChild(el("b", null, r.subject || ""));
    li.appendChild(document.createTextNode(" — " + (r.relation || "") + " — "));
    li.appendChild(el("b", null, r.object || ""));
    var meta = "〔" + (r.status || "") + (r.date ? " · " + r.date : "") + "〕";
    li.appendChild(el("span", "meta", meta));
    if (r.quote) {
      var q = el("blockquote", null, r.quote);
      li.appendChild(q);
    }
    if (r.episode) srcLine(li, r.date, r.episode);
    return li;
  }

  function makeEventItem(e) {
    var det = el("details", "ev");
    var sum = document.createElement("summary");
    sum.appendChild(el("span", "d", e.date || ""));
    var head = e.title || (e.event ? e.event.slice(0, 90) + "……" : "");
    sum.appendChild(el("span", "t", head));
    det.appendChild(sum);
    var body = el("div", "evbody");
    function fld(k, v) {
      if (!v) return;
      var p = el("p", "fld");
      p.appendChild(el("span", "k", k));
      p.appendChild(document.createTextNode(v));
      body.appendChild(p);
    }
    fld("事件", e.event);
    fld("时段", e.time);
    if (e.persons && e.persons.length) fld("相关人物", e.persons.join("、"));
    fld("口径", e.caliber);
    if (e.quotes) e.quotes.forEach(function (q) { body.appendChild(el("blockquote", null, q)); });
    if (e.episode) srcLine(body, e.date, e.episode);
    det.appendChild(body);
    return det;
  }

  function byDateDesc(a, b) { return (b.date || "") < (a.date || "") ? -1 : (b.date || "") > (a.date || "") ? 1 : 0; }

  var allLoaded = false;
  function loadAll(pkg) {
    if (allLoaded) return;
    allLoaded = true;
    var counts = pkg.counts || {};
    var relBox = $("rel-list"), evBox = $("ev-list"), moreBox = $("ev-more");
    if ($("rel-count")) $("rel-count").textContent = counts.relations != null ? counts.relations + " 条" : "";
    if ($("ev-count")) $("ev-count").textContent = counts.events != null ? counts.events + " 张" : "";

    if (pkg.content_mode === "chunked" && pkg.chunks) {
      /* 分片包：指针 JSON 只给清单，实体在 persons-chunked/<id>/ 下。
         指针里的路径是仓根相对路径，页面在 entries/ 下，故统一加 ../ 前缀。 */
      var base = "../" + (pkg.chunks.base || "");
      /* 关系：分片少，全量载入，新段在前、段内倒序 */
      if (relBox) {
        relBox.textContent = "";
        var ul = el("ul", "rel");
        relBox.appendChild(ul);
        var rshards = (pkg.chunks.relations || []).slice().reverse();
        var chain = Promise.resolve();
        rshards.forEach(function (sh) {
          chain = chain.then(function () {
            return fetchJson(base + sh.file).then(function (d) {
              (d.relations || []).slice().reverse().forEach(function (r) { ul.appendChild(makeRelItem(r)); });
            });
          });
        });
        chain.catch(function (e) { relBox.appendChild(el("p", "err", "关系分片载入失败：" + e.message)); });
      }
      /* 事件：34 段约 6MB，按段渐进载入（最新一段先） */
      if (evBox && moreBox) {
        var queue = (pkg.chunks.events || []).slice().reverse();
        var loaded = 0, total = counts.events || 0;
        function status() {
          moreBox.textContent = "";
          if (!queue.length) {
            moreBox.appendChild(el("p", "meta", "已全部载入 · 共 " + loaded + " 张事件卡。"));
            return;
          }
          var nx = queue[0];
          var b1 = el("button", "loadbtn", "加载更早一段（" + nx.date_from + " 至 " + nx.date_to + " · " + nx.count + " 条）");
          b1.addEventListener("click", function () { loadNext(); });
          var b2 = el("button", "loadbtn", "一次全部加载");
          b2.addEventListener("click", function () { loadRest(); });
          moreBox.appendChild(b1); moreBox.appendChild(b2);
          moreBox.appendChild(el("p", "meta", "已载入 " + loaded + " / " + total + " 条。"));
        }
        function loadNext() {
          if (!queue.length) { status(); return Promise.resolve(); }
          var sh = queue.shift();
          return fetchJson(base + sh.file).then(function (d) {
            (d.events || []).slice().reverse().forEach(function (e) { evBox.appendChild(makeEventItem(e)); });
            loaded += (d.events || []).length;
            status();
          }).catch(function (e) {
            moreBox.appendChild(el("p", "err", "事件分片 " + sh.file + " 载入失败：" + e.message));
          });
        }
        function loadRest() {
          if (!queue.length) { status(); return; }
          loadNext().then(loadRest);
        }
        loadNext();
      }
    } else {
      /* 内联包：事件与关系就在人物 JSON 本体内 */
      if (relBox) {
        relBox.textContent = "";
        var ul2 = el("ul", "rel");
        (pkg.relations || []).slice().sort(byDateDesc).forEach(function (r) { ul2.appendChild(makeRelItem(r)); });
        relBox.appendChild(ul2);
      }
      if (evBox) {
        (pkg.events || []).slice().sort(byDateDesc).forEach(function (e) { evBox.appendChild(makeEventItem(e)); });
      }
      if (moreBox) moreBox.appendChild(el("p", "meta", "已全部载入。"));
    }
  }

  /* ---------- 开关 ---------- */
  function setupToggle(pkg) {
    var bCur = $("btn-current"), bAll = $("btn-all"), secAll = $("sec-all");
    if (!bCur || !bAll || !secAll) return;
    function setMode(all) {
      secAll.hidden = !all;
      bCur.classList.toggle("on", !all);
      bAll.classList.toggle("on", all);
      bCur.setAttribute("aria-selected", String(!all));
      bAll.setAttribute("aria-selected", String(all));
      if (all) loadAll(pkg);
    }
    bCur.addEventListener("click", function () { setMode(false); });
    bAll.addEventListener("click", function () { setMode(true); });
  }

  fetchJson(jsonUrl).then(function (pkg) {
    renderCurrent(pkg);
    setupToggle(pkg);
  }).catch(function (e) {
    ["caliber-list", "timenotes"].forEach(function (id) {
      var n = $(id);
      if (n) { n.textContent = ""; n.appendChild(el("p", "err", "数据包载入失败：" + e.message + "（可直接打开上方数据包链接查阅）")); }
    });
  });
})();
