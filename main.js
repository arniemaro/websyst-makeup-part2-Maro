/* Arnie Maro — Portfolio
   Vanilla JavaScript only. No inline handlers — everything is
   wired up here with addEventListener. */

(function () {
  "use strict";

  /* =========================================================
     1. Dark / light theme toggle, persisted in localStorage
     ========================================================= */
  function initTheme() {
    var toggleBtn = document.getElementById("theme-toggle");
    var icon = document.getElementById("theme-icon");
    var saved = localStorage.getItem("am-theme");
    var initial = saved === "light" || saved === "dark" ? saved : "dark";

    applyTheme(initial);

    if (toggleBtn) {
      toggleBtn.addEventListener("click", function () {
        var current = document.documentElement.getAttribute("data-theme") || "dark";
        var next = current === "dark" ? "light" : "dark";
        applyTheme(next);
        localStorage.setItem("am-theme", next);
      });
    }

    function applyTheme(theme) {
      document.documentElement.setAttribute("data-theme", theme);
      if (toggleBtn) toggleBtn.setAttribute("aria-pressed", theme === "light" ? "true" : "false");
      if (icon) icon.textContent = theme === "light" ? "\u2600\uFE0F" : "\uD83C\uDF19";
    }
  }

  /* =========================================================
     2. Mark active nav link
     ========================================================= */
  function markActiveNav() {
    var current = window.location.pathname.split("/").pop() || "index.html";
    document.querySelectorAll(".nav-links a").forEach(function (link) {
      var href = link.getAttribute("href").split("#")[0];
      if (href === current || (current === "" && href === "index.html")) {
        link.setAttribute("aria-current", "page");
      }
    });
  }

  /* =========================================================
     3. Smooth scroll for same-page anchor links (nav -> sections)
     ========================================================= */
  function initSmoothScroll() {
    document.querySelectorAll('a[href*="#"]').forEach(function (link) {
      var url = new URL(link.href, window.location.href);
      var samePage = url.pathname === window.location.pathname || url.pathname.endsWith(window.location.pathname);

      if (!samePage || !url.hash) return;

      link.addEventListener("click", function (event) {
        var target = document.querySelector(url.hash);
        if (!target) return;
        event.preventDefault();
        target.scrollIntoView({ behavior: "smooth", block: "start" });
        target.setAttribute("tabindex", "-1");
        target.focus({ preventScroll: true });
      });
    });

    // If the page was loaded with a hash already in the URL, ease into it.
    if (window.location.hash) {
      var initialTarget = document.querySelector(window.location.hash);
      if (initialTarget) {
        window.requestAnimationFrame(function () {
          initialTarget.scrollIntoView({ behavior: "smooth", block: "start" });
        });
      }
    }
  }

  /* =========================================================
     4. Contact form — regex validation, inline errors, no alert()
     ========================================================= */
  var VALIDATORS = {
    name: {
      test: function (v) { return /^[A-Za-z\s]{3,}$/.test(v.trim()); },
      msg: "Name must contain only letters and spaces (min 3 characters)."
    },
    email: {
      test: function (v) { return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v.trim()); },
      msg: "Enter a valid email address, e.g. name@example.com."
    },
    "inquiry-type": {
      test: function (v) { return v.trim() !== ""; },
      msg: "Please choose an inquiry type."
    },
    message: {
      test: function (v) { return /^.{20,}$/s.test(v.trim()) || v.trim().length >= 20; },
      msg: "Message must be at least 20 characters long."
    }
  };

  function initContactForm() {
    var form = document.getElementById("contact-form");
    if (!form) return;

    var status = document.getElementById("form-status");

    form.addEventListener("submit", function (event) {
      event.preventDefault();
      var allValid = true;

      Object.keys(VALIDATORS).forEach(function (fieldName) {
        var field = form.elements[fieldName];
        if (!field) return;
        var wrapper = field.closest(".field");
        var errorEl = wrapper ? wrapper.querySelector(".error-msg") : null;
        var valid = VALIDATORS[fieldName].test(field.value);

        if (!valid) {
          allValid = false;
          if (wrapper) wrapper.classList.add("has-error");
          if (errorEl) errorEl.textContent = VALIDATORS[fieldName].msg;
        } else if (wrapper) {
          wrapper.classList.remove("has-error");
        }
      });

      if (!allValid) {
        if (status) {
          status.textContent = "Please fix the highlighted fields and try again.";
          status.style.borderColor = "var(--color-danger)";
          status.style.color = "var(--color-danger)";
          status.classList.add("is-visible");
        }
        return;
      }

      if (status) {
        status.style.borderColor = "var(--color-secondary)";
        status.style.color = "var(--color-secondary)";
        status.textContent = "Thanks! Your message looks good — opening your email client to finish sending.";
        status.classList.add("is-visible");
      }

      var name = form.elements["name"].value;
      var email = form.elements["email"].value;
      var inquiry = form.elements["inquiry-type"].value;
      var message = form.elements["message"].value;

      var subject = encodeURIComponent("[" + inquiry + "] Portfolio message from " + name);
      var body = encodeURIComponent(message + "\n\n— " + name + " (" + email + ")");
      window.location.href = "mailto:arnie.maro.dev@example.com?subject=" + subject + "&body=" + body;

      form.reset();
    });

    // Clear a field's error state as the person retypes it.
    Object.keys(VALIDATORS).forEach(function (fieldName) {
      var field = form.elements[fieldName];
      if (!field) return;
      field.addEventListener("input", function () {
        var wrapper = field.closest(".field");
        if (wrapper && VALIDATORS[fieldName].test(field.value)) {
          wrapper.classList.remove("has-error");
        }
      });
    });
  }

  /* =========================================================
     5. Dynamic project cards — built from a JS array, not
        hard-coded in projects.html
     ========================================================= */
  var PROJECTS = [
    {
      title: "Library Management System",
      file: "01_library-system.md",
      description: "A desktop app for issuing, returning, and tracking books. Handles overdue fines and member records.",
      tags: ["Java", "MySQL", "Swing"],
      image: "assets/project-library.svg",
      alt: "Illustration of stacked, color-coded books representing the library management system",
      link: "#"
    },
    {
      title: "Campus Event Finder",
      file: "02_event-finder.md",
      description: "A small web app where students browse and RSVP to campus events, with a clean, mobile-friendly interface.",
      tags: ["HTML/CSS", "JavaScript", "PHP"],
      image: "assets/project-events.svg",
      alt: "Illustration of a calendar with highlighted dates representing the campus event finder app",
      link: "#"
    },
    {
      title: "Network Monitoring Dashboard",
      file: "03_network-monitor.md",
      description: "A lightweight script and dashboard that pings devices on a LAN and flags ones that go offline.",
      tags: ["Python", "Sockets", "Linux"],
      image: "assets/project-network.svg",
      alt: "Illustration of connected network nodes representing the monitoring dashboard",
      link: "#"
    }
  ];

  function renderProjectCards() {
    var row = document.getElementById("projects-row");
    if (!row) return;

    PROJECTS.forEach(function (project) {
      var article = document.createElement("article");
      article.className = "project-card";

      var figure = document.createElement("figure");
      var img = document.createElement("img");
      img.src = project.image;
      img.alt = project.alt;
      img.loading = "lazy";
      var figcaption = document.createElement("figcaption");
      figcaption.textContent = project.file;
      figure.appendChild(img);
      figure.appendChild(figcaption);

      var body = document.createElement("div");
      body.className = "card-body";

      var h3 = document.createElement("h3");
      h3.textContent = project.title;

      var p = document.createElement("p");
      p.textContent = project.description;

      var tagRow = document.createElement("div");
      tagRow.className = "tag-row";
      project.tags.forEach(function (tag) {
        var span = document.createElement("span");
        span.className = "tag";
        span.textContent = tag;
        tagRow.appendChild(span);
      });

      var link = document.createElement("a");
      link.className = "card-link";
      link.href = project.link;
      link.textContent = "View details \u2192";

      body.appendChild(h3);
      body.appendChild(p);
      body.appendChild(tagRow);
      body.appendChild(link);

      article.appendChild(figure);
      article.appendChild(body);
      row.appendChild(article);
    });
  }

  /* =========================================================
     6. Footer year
     ========================================================= */
  function setFooterYear() {
    var el = document.querySelector("[data-year]");
    if (el) el.textContent = new Date().getFullYear();
  }

  document.addEventListener("DOMContentLoaded", function () {
    initTheme();
    markActiveNav();
    renderProjectCards();
    initSmoothScroll();
    initContactForm();
    setFooterYear();
  });
})();
