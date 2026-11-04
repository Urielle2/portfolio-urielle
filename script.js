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

  /* ---------- Vidéo de fond : toujours en lecture ---------- */
  const bgVideo = $(".bg-video");
  const hero = $("#accueil");
  if (bgVideo) {
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
          if (bgVideo.paused) tryPlay();
        },
        { passive: true },
      ),
    );
    document.addEventListener("visibilitychange", () => {
      if (!document.hidden) tryPlay();
    });
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
    django: {
      title: "Application web Django",
      stack: ["Python", "Django"],
      // Complète avec le sujet de ton projet et tes fonctionnalités
      text: "Projet de deuxième année réalisé avec Django. Il m'a permis de mettre en pratique la structure d'une application web (modèles, vues, templates) et de découvrir un framework qui favorise un développement rapide et sécurisé.",
      images: [
        ["assets/img/django1.png", "Rendu"], //  Ajoute tes captures : ["assets/img/mon-image.jpg", "Description de l'image"]
        ["assets/img/django2.png", "Rendu"],
      ],
    },
    mininagios: {
      title: "Mininagios",
      stack: ["PHP"],
      //  Complète avec le langage utilisé, ce que le projet surveille, etc.
      text: "Mini-Nagios est une application web de supervision de serveurs, conteneurisée avec Docker (PHP/Apache, PostgreSQL, Redis, serveur SMTP de test). Je l’ai développée en programmation orientée objet avec une couche d’accès aux données (pattern Repository), puis durcie séance après séance selon les risques du Top 10 OWASP. J’ai sécurisé l’authentification (hachage Argon2id, enrôlement des comptes par Magic Link, régénération de session, protection contre l’énumération de comptes et les attaques temporelles). J’ai mis en place une journalisation applicative des évènements, avec détection de la force brute et verrouillage temporaire des adresses IP. J’ai appliqué le principe de moindre privilège au niveau du SGBD, avec des rôles distincts (application, audit, lecture seule) et un journal en écriture seule pour garantir la traçabilité. J’ai aussi étudié l’injection SQL de l’attaque à la défense, dans un laboratoire isolé, puis audité le code pour passer à des requêtes préparées. Enfin, j’ai fait évoluer le schéma de la base (groupes de serveurs, modèle de droits par fonction avec table d’association) et j’ai commencé à historiser les mots de passe par déclencheur. Ce projet m’a appris à raisonner en défense en profondeur, où chaque couche de protection limite les dégâts si la précédente cède.",
      images: [],
    },
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
      ],
    },
    blog: {
      title: "Blog de recettes",
      stack: ["HTML", "CSS", "VS Code"],
      text: "Page web de blog présentant plusieurs recettes simples et rapides. La structure met en avant les titres, une description appétissante, les ingrédients, les étapes de préparation et des informations pratiques (temps de cuisson, difficulté, nombre de portions). Une section « Astuce du chef » ajoute une touche personnelle. Ce travail m'a permis de soigner la mise en page et de penser à l'expérience d'un public débutant.",
      images: [
        ["assets/img/projet3.jpg", "Rendu du blog de recettes"],
        ["assets/img/p3.jpg", "Code HTML du blog"],
      ],
    },
  };

  const dlg = $(".project-dialog");
  const dlgGallery = $(".dlg-gallery");
  const dlgGithub = $(".dlg-github");
  let lastTrigger = null;

  const openProject = (card) => {
    const d = projects[card.dataset.project];
    if (!d) return;
    lastTrigger = $(".project-open", card);
    $("#dlg-title").textContent = d.title;
    const st = $(".dlg-stack");
    st.className = "dlg-stack stack";
    st.innerHTML = d.stack.map((s) => `<i>${s}</i>`).join("");
    $(".dlg-text").textContent = d.text;
    // le lien GitHub de la fenêtre est celui de la carte (un seul endroit à modifier)
    dlgGithub.href = $(".gh-link", card).href;
    dlgGallery.innerHTML = d.images
      .map(([src, alt]) => `<img src="${src}" alt="${alt}" loading="lazy">`)
      .join("");
    dlgGallery.hidden = d.images.length === 0;
    dlg.scrollTop = 0;
    dlg.showModal();
    document.body.classList.add("dlg-open");
  };

  $$(".project-card").forEach((card) => {
    // un clic n'importe où sur la carte ouvre le détail, sauf sur le lien GitHub
    card.addEventListener("click", (e) => {
      if (e.target.closest("a")) return;
      openProject(card);
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

  /* ---------- Formulaire : envoi direct (sans ouvrir de messagerie) ----------
     Le message arrive dans ta boîte mail via le service gratuit FormSubmit.
     ⚠️ Au tout premier envoi, FormSubmit t'envoie un e-mail d'activation :
     clique sur le lien qu'il contient, et c'est bon pour toujours. */
  const form = $(".contact-form");
  const status = $(".form-status");
  const submitBtn = $('button[type="submit"]', form);
  const MAIL = "gomaurielle08@gmail.com";
  const ENDPOINT = `https://formsubmit.co/ajax/${MAIL}`;

  const showStatus = (kind, text) => {
    status.className = "form-status " + kind;
    status.textContent = text;
  };

  form.addEventListener("submit", async (e) => {
    e.preventDefault();
    const { nom, email, message, _honey } = form.elements;
    if (_honey && _honey.value) return; // robot : on ignore

    let ok = true;
    [nom, email, message].forEach((f) => {
      const valid = f.value.trim() !== "" && f.checkValidity();
      f.setAttribute("aria-invalid", !valid);
      if (!valid) ok = false;
    });
    if (!ok) {
      showStatus(
        "err",
        "Merci de remplir le nom, un e-mail valide et ton message.",
      );
      return;
    }

    const label = submitBtn.textContent;
    submitBtn.disabled = true;
    submitBtn.textContent = "Envoi en cours…";
    showStatus("", "");

    try {
      const res = await fetch(ENDPOINT, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
        },
        body: JSON.stringify({
          name: nom.value.trim(),
          email: email.value.trim(),
          message: message.value.trim(),
          _subject: `Portfolio : message de ${nom.value.trim()}`,
          _template: "table",
          _captcha: "false",
        }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok || !(data.success === true || data.success === "true")) {
        throw new Error(data.message || "Échec de l'envoi");
      }
      showStatus(
        "ok",
        "Merci ! Ton message a bien été envoyé, je te réponds très vite.",
      );
      form.reset();
    } catch (err) {
      showStatus(
        "err",
        "L'envoi n'a pas fonctionné. Tu peux m'écrire directement à ",
      );
      const a = document.createElement("a");
      a.href = `mailto:${MAIL}`;
      a.textContent = MAIL;
      status.append(a, ".");
    } finally {
      submitBtn.disabled = false;
      submitBtn.textContent = label;
    }
  });
})();
