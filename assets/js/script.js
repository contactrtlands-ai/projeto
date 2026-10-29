/* =========================================================
   BAU SOLUÇÕES — comportamento da página
   ========================================================= */
(function () {
  "use strict";

  // ---- Configuração (editar aqui) ----
  var WHATSAPP_NUMBER = "5515997065254";
  var DEFAULT_MESSAGE =
    "Olá! Encontrei a Bau Soluções pelo site e gostaria de conversar sobre um serviço de construção. Poderiam me orientar sobre como solicitar um orçamento?";

  function waLink(message) {
    return "https://wa.me/" + WHATSAPP_NUMBER + "?text=" + encodeURIComponent(message);
  }

  // ---- Links do WhatsApp (elementos com data-wa) ----
  document.querySelectorAll("[data-wa]").forEach(function (el) {
    var msg = el.getAttribute("data-msg");
    var service = el.getAttribute("data-service");
    if (!msg && service) {
      msg = "Olá! Encontrei a Bau Soluções pelo site e gostaria de conversar sobre o serviço de " +
            service.toLowerCase() + ". Poderiam me orientar sobre como solicitar um orçamento?";
    }
    el.setAttribute("href", waLink(msg || DEFAULT_MESSAGE));
  });

  // ---- Menu mobile ----
  var toggle = document.querySelector(".menu-toggle");
  var nav = document.getElementById("menu");

  function setMenu(open) {
    nav.classList.toggle("open", open);
    toggle.setAttribute("aria-expanded", String(open));
    toggle.setAttribute("aria-label", open ? "Fechar menu" : "Abrir menu");
  }
  toggle.addEventListener("click", function () {
    setMenu(toggle.getAttribute("aria-expanded") !== "true");
  });
  nav.addEventListener("click", function (e) {
    if (e.target.closest("a")) setMenu(false);
  });
  document.addEventListener("keydown", function (e) {
    if (e.key === "Escape" && nav.classList.contains("open")) {
      setMenu(false);
      toggle.focus();
    }
  });
  window.matchMedia("(min-width: 861px)").addEventListener("change", function (e) {
    if (e.matches) setMenu(false);
  });

  // ---- Cabeçalho: linha divisória ao rolar ----
  var header = document.querySelector(".site-header");
  function onScroll() { header.classList.toggle("scrolled", window.scrollY > 8); }
  window.addEventListener("scroll", onScroll, { passive: true });
  onScroll();

  // ---- Animações de entrada ----
  var reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  var revealTargets = document.querySelectorAll(".hero-head, .split-head, .feature, .facts, .big-title, .lead-line, .card, .gal, .cta-final, .contact-grid > *");
  revealTargets.forEach(function (el) { el.classList.add("reveal"); });
  if ("IntersectionObserver" in window && !reduce) {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) { entry.target.classList.add("in"); io.unobserve(entry.target); }
      });
    }, { threshold: 0.1, rootMargin: "0px 0px -40px 0px" });
    revealTargets.forEach(function (el) { io.observe(el); });
  } else {
    revealTargets.forEach(function (el) { el.classList.add("in"); });
  }

  // ---- Botão flutuante: some quando já há outro CTA/formulário visível ----
  var floatBtn = document.getElementById("wa-float");
  var hideZones = document.querySelectorAll("#cta-final, #contato, .site-footer");
  if ("IntersectionObserver" in window && floatBtn) {
    var visible = new Set();
    var zoneObserver = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) visible.add(entry.target); else visible.delete(entry.target);
      });
      floatBtn.classList.toggle("hidden", visible.size > 0);
    }, { threshold: 0.15 });
    hideZones.forEach(function (z) { zoneObserver.observe(z); });
  }

  // ---- Formulário completo → WhatsApp ----
  var form = document.getElementById("form-orcamento");

  var rules = {
    nome: function (v) { return v.trim().length >= 2 ? "" : "Informe seu nome."; },
    telefone: function (v) {
      var d = v.replace(/\D/g, "");
      if (d.indexOf("55") === 0 && d.length > 11) d = d.slice(2);
      return d.length === 10 || d.length === 11 ? "" : "Informe um telefone com DDD, por exemplo (15) 90000-0000.";
    },
    servico: function (v) { return v ? "" : "Selecione o tipo de serviço."; },
    mensagem: function (v) { return v.trim().length >= 10 ? "" : "Descreva brevemente o que você precisa (mínimo de 10 caracteres)."; }
  };

  function validateField(name) {
    var input = form.elements[name];
    var wrap = input.closest(".field");
    var err = document.getElementById("erro-" + name);
    var msg = rules[name](input.value);
    err.textContent = msg;
    wrap.classList.toggle("invalid", !!msg);
    input.setAttribute("aria-invalid", msg ? "true" : "false");
    return !msg;
  }

  Object.keys(rules).forEach(function (name) {
    var input = form.elements[name];
    input.addEventListener("blur", function () { validateField(name); });
    input.addEventListener("input", function () {
      if (input.closest(".field").classList.contains("invalid")) validateField(name);
    });
  });

  // máscara simples de telefone
  form.elements.telefone.addEventListener("input", function (e) {
    var d = e.target.value.replace(/\D/g, "").slice(0, 11);
    var out = d;
    if (d.length > 2) out = "(" + d.slice(0, 2) + ") " + d.slice(2);
    if (d.length > 6) out = "(" + d.slice(0, 2) + ") " + d.slice(2, d.length > 10 ? 7 : 6) + "-" + d.slice(d.length > 10 ? 7 : 6);
    e.target.value = out;
  });

  form.addEventListener("submit", function (e) {
    e.preventDefault();
    var firstInvalid = null;
    Object.keys(rules).forEach(function (name) {
      if (!validateField(name) && !firstInvalid) firstInvalid = form.elements[name];
    });
    if (firstInvalid) { firstInvalid.focus(); return; }

    var text =
      "Olá! Vim pelo site da Bau Soluções e gostaria de solicitar um orçamento.\n\n" +
      "Nome: " + form.elements.nome.value.trim() + "\n" +
      "Telefone: " + form.elements.telefone.value.trim() + "\n" +
      "Serviço desejado: " + form.elements.servico.value + "\n" +
      "Descrição: " + form.elements.mensagem.value.trim();

    window.open(waLink(text), "_blank", "noopener");
  });

  // ---- Ano no rodapé ----
  var year = document.getElementById("ano");
  if (year) year.textContent = new Date().getFullYear();
})();
