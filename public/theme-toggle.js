// Two-state theme toggle.
//
// Resolved theme lives on <html data-theme="light|dark">. The early-init
// script in BaseLayout sets it before paint (from localStorage, or from
// matchMedia if untouched). This file:
//   - syncs the toggle button's aria-checked to the resolved state;
//   - on click, flips the theme, pins it to localStorage (no going back to
//     "follow OS" once touched — by design);
//   - for users who haven't touched it yet, mirrors OS preference changes
//     onto data-theme in real time.
(function () {
  var STORAGE_KEY = "theme";

  function stored() {
    try {
      const v = localStorage.getItem(STORAGE_KEY);
      return v === "light" || v === "dark" ? v : null;
    } catch {
      return null;
    }
  }

  function resolved() {
    return document.documentElement.getAttribute("data-theme") === "dark"
      ? "dark"
      : "light";
  }

  function apply(theme, persist) {
    document.documentElement.setAttribute("data-theme", theme);
    if (persist) {
      try {
        localStorage.setItem(STORAGE_KEY, theme);
      } catch {
        /* ignore */
      }
    }
    syncButtons(theme);
    syncThemeColor(theme);
  }

  // Keep the browser-chrome colour in step with the resolved theme. The two
  // media-based <meta name=theme-color> tags only follow the OS; a manual dark
  // toggle on a light OS would otherwise leave the address bar light. The
  // early-init script inserts #theme-color-meta first so it wins; here we just
  // update its content. Colours are read from the media metas to avoid drift.
  function syncThemeColor(theme) {
    var meta = document.getElementById("theme-color-meta");
    if (!meta) {
      meta = document.createElement("meta");
      meta.setAttribute("name", "theme-color");
      meta.id = "theme-color-meta";
      document.head.insertBefore(meta, document.head.firstChild);
    }
    var pick = document.querySelector(
      '[name="theme-color"][media*="' + (theme === "dark" ? "dark" : "light") + '"]',
    );
    if (pick) meta.setAttribute("content", pick.getAttribute("content"));
  }

  function syncButtons(theme) {
    var btns = document.querySelectorAll("[data-theme-toggle]");
    for (var i = 0; i < btns.length; i++) {
      var b = btns[i];
      var isDark = theme === "dark";
      b.setAttribute("aria-checked", isDark ? "true" : "false");
      b.setAttribute(
        "aria-label",
        isDark ? "Switch to light theme" : "Switch to dark theme",
      );
    }
  }

  function init() {
    syncButtons(resolved());
    syncThemeColor(resolved());

    document.addEventListener("click", function (e) {
      var t = e.target;
      while (t && t !== document) {
        if (t.hasAttribute && t.hasAttribute("data-theme-toggle")) {
          apply(resolved() === "dark" ? "light" : "dark", true);
          return;
        }
        t = t.parentNode;
      }
    });

    // Mirror live OS changes only while the user hasn't pinned a choice.
    var mq = matchMedia("(prefers-color-scheme: dark)");
    var onChange = function (e) {
      if (stored()) return;
      apply(e.matches ? "dark" : "light", false);
    };
    if (mq.addEventListener) mq.addEventListener("change", onChange);
    else if (mq.addListener) mq.addListener(onChange);
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init, { once: true });
  } else {
    init();
  }
})();
