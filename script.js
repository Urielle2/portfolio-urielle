/* =====================================================
   PORTFOLIO — Urielle GOMA
   ===================================================== */
(() => {
  "use strict";

  const $ = (s, el = document) => el.querySelector(s);
  const $$ = (s, el = document) => [...el.querySelectorAll(s)];
  const reduceMotion = window.matchMedia(
    "(prefers-reduced-motion: reduce)",
  ).matches;

  /* ---------- Année du pied de page ---------- */
  $("#year").textContent = new Date().getFullYear();

  /* ---------- Texte qui s'écrit tout seul ---------- */
  const phrases = [
    "Je crée des sites web.",
    "Je programme en Java et en Python.",
    "Je vise le développement full-stack.",
    "Je cherche toujours à apprendre.",
  ];
  const typedEl = $(".typed");
  if (reduceMotion) {
    typedEl.textContent = phrases[0];
  } else {
    let p = 0,
      c = 0,
      deleting = false;
    const tick = () => {
      const full = phrases[p];
      c += deleting ? -1 : 1;
      typedEl.textContent = full.slice(0, c);
      let delay = deleting ? 28 : 65;
      if (!deleting && c === full.length) {
        deleting = true;
        delay = 1600;
      } else if (deleting && c === 0) {
        deleting = false;
        p = (p + 1) % phrases.length;
        delay = 400;
      }
      setTimeout(tick, delay);
    };
    setTimeout(tick, 1400);
  }

  /* ---------- Vidéo de fond ----------
     Elle démarre toujours, même si le système demande de réduire les animations.
     Le bouton en bas à droite permet de la mettre en pause. */
  const bgVideo = $(".bg-video");
  const vBtn = $(".video-toggle");
  const hero = $("#accueil");
  if (bgVideo) {
    let userPaused = false;
    const tryPlay = () => {
      const p = bgVideo.play();
      if (p && p.catch) p.catch(() => {});
    };
    tryPlay();
    // si le navigateur a bloqué le démarrage (mode économie d'énergie…), on réessaie au premier geste
    ["pointerdown", "touchstart", "keydown", "scroll"].forEach((ev) =>
      window.addEventListener(
        ev,
        () => {
          if (bgVideo.paused && !userPaused) tryPlay();
        },
        { passive: true },
      ),
    );

    const syncBtn = () => {
      const playing = !bgVideo.paused;
      vBtn.dataset.state = playing ? "playing" : "paused";
      vBtn.setAttribute("aria-pressed", !playing);
      vBtn.setAttribute(
        "aria-label",
        playing
          ? "Mettre la vidéo de fond en pause"
          : "Lancer la vidéo de fond",
      );
    };
    bgVideo.addEventListener("play", syncBtn);
    bgVideo.addEventListener("pause", syncBtn);
    vBtn.addEventListener("click", () => {
      if (bgVideo.paused) {
        userPaused = false;
        tryPlay();
      } else {
        userPaused = true;
        bgVideo.pause();
      }
    });
    syncBtn();
  }

  /* ---------- Lueur qui suit la souris (accueil) + halo des cartes ---------- */
  hero.addEventListener("pointermove", (e) => {
    const r = hero.getBoundingClientRect();
    hero.style.setProperty("--mx", `${e.clientX - r.left}px`);
    hero.style.setProperty("--my", `${e.clientY - r.top}px`);
  });
  $$(".project-card").forEach((card) => {
    card.addEventListener("pointermove", (e) => {
      const r = card.getBoundingClientRect();
      card.style.setProperty("--mx", `${e.clientX - r.left}px`);
      card.style.setProperty("--my", `${e.clientY - r.top}px`);
    });
  });

  /* ---------- Apparition au défilement ---------- */
  const revealObserver = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        const el = entry.target;
        el.classList.add("in");
        revealObserver.unobserve(el);
      });
    },
    { threshold: 0.15, rootMargin: "0px 0px -8% 0px" },
  );
  $$("[data-reveal], .sec-title, .timeline").forEach((el) =>
    revealObserver.observe(el),
  );

  /* ---------- Section active : menu + couleur d'ambiance ---------- */
  const sections = $$("main > section");
  const links = $$(".nav-links a");
  const pill = $(".nav-pill");
  const navUl = $(".nav-links");
  let currentId = null;

  const movePill = (link) => {
    if (!link || getComputedStyle(pill).display === "none") return;
    const ur = navUl.getBoundingClientRect();
    const lr = link.getBoundingClientRect();
    pill.style.width = lr.width + "px";
    pill.style.transform = `translateX(${lr.left - ur.left}px)`;
    pill.style.opacity = 1;
  };

  const setActive = (id) => {
    if (id === currentId) return;
    currentId = id;
    links.forEach((a) => {
      const on = a.getAttribute("href") === "#" + id;
      a.classList.toggle("active", on);
      if (on) {
        a.setAttribute("aria-current", "true");
        movePill(a);
      } else {
        a.removeAttribute("aria-current");
      }
    });
    const sec = document.getElementById(id);
    document.body.style.setProperty("--glow", sec.dataset.glow || "#3d8bff");
  };

  /* ---------- Défilement : barre de progression, section courante, léger parallaxe ---------- */
  const bar = $(".progress");
  const heroText = $(".hero-text");
  let ticking = false;

  const onScroll = () => {
    const y = window.scrollY;
    const max = document.documentElement.scrollHeight - window.innerHeight;
    bar.style.transform = `scaleX(${max > 0 ? y / max : 0})`;

    const probe = y + window.innerHeight * 0.4;
    let found = sections[0];
    sections.forEach((s) => {
      if (s.offsetTop <= probe) found = s;
    });
    setActive(found.id);

    if (!reduceMotion && y < window.innerHeight) {
      heroText.style.transform = `translateY(${y * 0.12}px)`;
    }
    ticking = false;
  };
  window.addEventListener(
    "scroll",
    () => {
      if (!ticking) {
        ticking = true;
        requestAnimationFrame(onScroll);
      }
    },
    { passive: true },
  );
  window.addEventListener("resize", () => {
    movePill($(".nav-links a.active"));
  });
  onScroll();

  /* ---------- Menu mobile ---------- */
  const burger = $(".burger");
  const menu = $("#menu");
  const setMenu = (open) => {
    menu.classList.toggle("open", open);
    burger.setAttribute("aria-expanded", open);
    burger.setAttribute(
      "aria-label",
      open ? "Fermer le menu" : "Ouvrir le menu",
    );
    document.body.classList.toggle("dlg-open", open);
  };
  burger.addEventListener("click", () =>
    setMenu(!menu.classList.contains("open")),
  );
  links.forEach((a) => a.addEventListener("click", () => setMenu(false)));
  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape") setMenu(false);
  });

  /* ---------- Fenêtre de détail des projets ---------- */
  const projects = {
    voyage: {
      title: "Agence de voyage",
      stack: ["HTML", "CSS", "VS Code"],
      text: "Maquette d'un site d'agence de voyage. Chaque destination (Rio de Janeiro, Londres, Los Angeles, Sydney) est présentée dans une carte avec une photo, un court texte d'accroche et un bouton « En savoir plus ». Ce projet m'a permis de soigner la mise en page, de structurer le contenu de façon sémantique et de penser à l'expérience utilisateur.",
      images: [
        ["assets/img/img.jpg", "Rendu du site de l'agence de voyage"],
        ["assets/img/p1.jpg", "Code HTML du site de voyage"],
      ],
    },
    java: {
      title: "Mini-projet Java : authentification et tarification",
      stack: ["Java", "Eclipse"],
      text: "Application Java simple avec interface graphique qui simule une authentification. L'utilisateur saisit son identifiant et son mot de passe dans des boîtes de dialogue ; si les informations sont correctes, un message de bienvenue s'affiche. Le programme définit aussi plusieurs tarifs (normal, réduit, enfant, senior) pour illustrer l'usage des variables et des structures conditionnelles. Ce projet a renforcé ma compréhension des interactions utilisateur en Java et de la logique applicative.",
      images: [
        ["assets/img/projet2.jpg", "Code Java dans Eclipse"],
        ["assets/img/p2.jpg", "Code Java : authentification"],
        ["assets/img/p21.jpg", "Code Java : tarifs"],
      ],
    },
    blog: {
      title: "Blog de recettes",
      stack: ["HTML", "CSS", "VS Code"],
      text: "Page web de blog présentant plusieurs recettes simples et rapides. La structure met en avant les titres, une description appétissante, les ingrédients, les étapes de préparation et des informations pratiques (temps de cuisson, difficulté, nombre de portions). Une section « Astuce du chef » ajoute une touche personnelle. Ce travail m'a permis de soigner la mise en page et de penser à l'expérience d'un public débutant.",
      images: [
        ["assets/img/projet3.jpg", "Rendu du blog de recettes"],
        ["assets/img/p3.jpg", "Code HTML du blog (1/3)"],
        ["assets/img/p31.jpg", "Code HTML du blog (2/3)"],
        ["assets/img/p32.jpg", "Code HTML du blog (3/3)"],
      ],
    },
  };

  const dlg = $(".project-dialog");
  let lastTrigger = null;

  $$(".project-card").forEach((card) => {
    card.addEventListener("click", () => {
      const d = projects[card.dataset.project];
      if (!d) return;
      lastTrigger = card;
      $("#dlg-title").textContent = d.title;
      const st = $(".dlg-stack");
      st.className = "dlg-stack stack";
      st.innerHTML = d.stack.map((s) => `<i>${s}</i>`).join("");
      $(".dlg-text").textContent = d.text;
      $(".dlg-gallery").innerHTML = d.images
        .map(([src, alt]) => `<img src="${src}" alt="${alt}" loading="lazy">`)
        .join("");
      dlg.scrollTop = 0;
      dlg.showModal();
      document.body.classList.add("dlg-open");
    });
  });
  $(".dlg-close").addEventListener("click", () => dlg.close());
  dlg.addEventListener("click", (e) => {
    if (e.target === dlg) dlg.close();
  });
  dlg.addEventListener("close", () => {
    document.body.classList.remove("dlg-open");
    lastTrigger && lastTrigger.focus({ preventScroll: true });
  });

  /* ---------- Formulaire : ouvre ta messagerie avec le message prérempli ---------- */
  const form = $(".contact-form");
  const status = $(".form-status");
  const MAIL = "gomaurielle08@gmail.com";

  form.addEventListener("submit", (e) => {
    e.preventDefault();
    const { nom, email, message } = form.elements;
    let ok = true;
    [nom, email, message].forEach((f) => {
      const valid = f.value.trim() !== "" && f.checkValidity();
      f.setAttribute("aria-invalid", !valid);
      if (!valid) ok = false;
    });
    status.className = "form-status";
    if (!ok) {
      status.classList.add("err");
      status.textContent =
        "Merci de remplir le nom, un e-mail valide et ton message.";
      return;
    }
    const subject = encodeURIComponent(
      `Portfolio : message de ${nom.value.trim()}`,
    );
    const body = encodeURIComponent(
      `${message.value.trim()}\n\n— ${nom.value.trim()} (${email.value.trim()})`,
    );
    window.location.href = `mailto:${MAIL}?subject=${subject}&body=${body}`;
    status.classList.add("ok");
    status.textContent =
      "Ta messagerie s'ouvre avec le message prêt à envoyer.";
  });
})();
