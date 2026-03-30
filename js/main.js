const body = document.body;
const menu = document.querySelector("[data-menu]");
const menuToggle = document.querySelector("[data-menu-toggle]");
const menuCloseButtons = document.querySelectorAll("[data-menu-close], [data-menu-link]");
const header = document.querySelector("[data-site-header]");
const revealItems = document.querySelectorAll("[data-reveal]");
const contactForm = document.querySelector("[data-contact-form]");
const contactModal = document.querySelector("[data-contact-modal]");
const contactModalCloseButtons = document.querySelectorAll("[data-contact-modal-close]");
const pathwaysPreviewImage = document.querySelector("[data-pathways-preview-image]");
const pathwaysItems = document.querySelectorAll("[data-pathways-item]");
const faqItems = document.querySelectorAll(".faq-list details");
const menuNavGroups = document.querySelectorAll(".menu-nav-group");
const hashLinks = document.querySelectorAll('a[href*="#"]');
const cookieConsentKey = "whc-cookie-consent";

const hasLucide = Boolean(window.lucide && typeof window.lucide.createIcons === "function");
const hasGsap = Boolean(window.gsap && window.ScrollTrigger);

const appendIcon = (element, iconName, position = "end") => {
  if (!element || element.querySelector(".ui-icon")) return;

  const iconSlot = document.createElement("span");
  iconSlot.className = "ui-icon";
  iconSlot.setAttribute("aria-hidden", "true");
  iconSlot.innerHTML = `<i data-lucide="${iconName}"></i>`;

  if (position === "start") {
    element.prepend(iconSlot);
  } else {
    element.append(iconSlot);
  }
};

const decorateUiWithIcons = () => {
  if (!hasLucide) return;

  document.querySelectorAll(".brand-mark").forEach((mark) => {
    if (mark.querySelector("svg, [data-lucide]")) return;

    mark.classList.add("has-icon");
    mark.setAttribute("aria-hidden", "true");
    mark.innerHTML = '<i data-lucide="paw-print"></i>';
  });

  appendIcon(menuToggle, "menu");
  document.querySelectorAll("[data-menu-close]").forEach((button) => appendIcon(button, "x"));
  document.querySelectorAll(".header-mobile-cta").forEach((button) => appendIcon(button, "phone"));
  document.querySelectorAll(".header-phone").forEach((item) => appendIcon(item, "phone", "start"));
  document.querySelectorAll(".button:not(.button-text):not(.header-mobile-cta)").forEach((button) =>
    appendIcon(button, "arrow-up-right"),
  );
  document.querySelectorAll(".button-text").forEach((button) =>
    appendIcon(button, "move-right"),
  );

  window.lucide.createIcons();
};

const animateMenuEntries = () => {
  if (!hasGsap || !menu) return;

  const menuItems = menu.querySelectorAll(".menu-topline > *, .menu-nav a, .menu-support > *");
  window.gsap.killTweensOf(menuItems);
  window.gsap.fromTo(
    menuItems,
    { autoAlpha: 0, x: -28 },
    {
      autoAlpha: 1,
      x: 0,
      duration: 0.72,
      stagger: 0.05,
      ease: "power3.out",
      delay: 0.12,
      overwrite: true,
    },
  );
};

const setMenuState = (isOpen) => {
  if (!menu || !menuToggle) return;

  menu.classList.toggle("is-open", isOpen);
  menu.setAttribute("aria-hidden", String(!isOpen));
  menuToggle.setAttribute("aria-expanded", String(isOpen));
  body.classList.toggle("menu-open", isOpen);

  if (!isOpen && menuNavGroups.length) {
    menuNavGroups.forEach((group) => {
      group.open = false;
      group.style.height = "";
    });
  }

  if (isOpen) {
    animateMenuEntries();
  }
};

const initHeader = () => {
  if (!header) return;

  const updateHeader = () => {
    const currentScrollY = window.scrollY;
    header.classList.toggle("is-scrolled", currentScrollY > 18);
  };

  updateHeader();
  window.addEventListener("scroll", updateHeader, { passive: true });
};

const initMenu = () => {
  if (!menu || !menuToggle) return;

  menuToggle.addEventListener("click", () => {
    const nextState = menuToggle.getAttribute("aria-expanded") !== "true";
    setMenuState(nextState);
  });

  menuCloseButtons.forEach((button) => {
    button.addEventListener("click", () => setMenuState(false));
  });

  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape") {
      setMenuState(false);
    }
  });
};

const initMenuDropdowns = () => {
  if (!menuNavGroups.length) return;

  const animateMenuGroup = (details, shouldOpen) => {
    const summary = details.querySelector("summary");
    if (!summary) return;

    const startHeight = details.offsetHeight;

    if (shouldOpen) {
      details.open = true;
    }

    const endHeight = shouldOpen ? details.scrollHeight : summary.offsetHeight;

    details.style.height = `${startHeight}px`;
    details.style.overflow = "hidden";

    requestAnimationFrame(() => {
      details.style.transition = "height 280ms ease";
      details.style.height = `${endHeight}px`;
    });

    const onTransitionEnd = (event) => {
      if (event.propertyName !== "height") return;

      details.style.transition = "";
      details.style.height = "";
      details.style.overflow = "";

      if (!shouldOpen) {
        details.open = false;
      }

      details.removeEventListener("transitionend", onTransitionEnd);
    };

    details.addEventListener("transitionend", onTransitionEnd);
  };

  menuNavGroups.forEach((group) => {
    const summary = group.querySelector("summary");
    if (!summary) return;

    summary.addEventListener("click", (event) => {
      event.preventDefault();

      const shouldOpen = !group.open;

      menuNavGroups.forEach((entry) => {
        if (entry !== group && entry.open) {
          animateMenuGroup(entry, false);
        }
      });

      animateMenuGroup(group, shouldOpen);
    });

    group.querySelectorAll("[data-menu-link]").forEach((link) => {
      link.addEventListener("click", () => {
        group.open = false;
        group.style.height = "";
      });
    });
  });
};

const scrollToHashTarget = (hash, shouldPushState = false) => {
  if (!hash || hash === "#") return;

  const target = document.querySelector(hash);
  if (!target) return;

  const headerOffset = header ? header.offsetHeight + 24 : 24;
  const targetTop = target.getBoundingClientRect().top + window.scrollY - headerOffset;

  window.scrollTo({
    top: Math.max(targetTop, 0),
    behavior: "smooth",
  });

  if (shouldPushState) {
    window.history.pushState(null, "", hash);
  }
};

const initHashNavigation = () => {
  hashLinks.forEach((link) => {
    const href = link.getAttribute("href");
    if (!href || href === "#") return;

    const url = new URL(href, window.location.href);
    const isSamePage = url.pathname === window.location.pathname && url.hash;

    if (!isSamePage) return;

    link.addEventListener("click", (event) => {
      event.preventDefault();
      scrollToHashTarget(url.hash, true);
    });
  });

  if (window.location.hash) {
    window.addEventListener(
      "load",
      () => {
        window.setTimeout(() => scrollToHashTarget(window.location.hash), 60);
      },
      { once: true },
    );
  }

  window.addEventListener("hashchange", () => {
    scrollToHashTarget(window.location.hash);
  });
};

const initGsapEffects = () => {
  if (!hasGsap || !revealItems.length) return false;

  window.gsap.registerPlugin(window.ScrollTrigger);

  revealItems.forEach((item) => {
    window.gsap.to(item, {
      opacity: 1,
      y: 0,
      duration: 0.9,
      ease: "power3.out",
      scrollTrigger: {
        trigger: item,
        start: "top 84%",
        once: true,
      },
    });
  });

  document.querySelectorAll(".image-placeholder.has-media img").forEach((image) => {
    const wrapper = image.closest(".image-placeholder");
    if (!wrapper) return;

    window.gsap.fromTo(
      image,
      { scale: 1.06, yPercent: -2 },
      {
        scale: 1.01,
        yPercent: 4,
        ease: "none",
        scrollTrigger: {
          trigger: wrapper,
          start: "top bottom",
          end: "bottom top",
          scrub: true,
        },
      },
    );
  });

  document.querySelectorAll(".hero-note, .hero-side-note").forEach((note) => {
    const trigger = note.closest(".hero-stage, .service-hero-media");
    if (!trigger) return;

    window.gsap.fromTo(
      note,
      { y: 18, opacity: 0 },
      {
        y: 0,
        opacity: 1,
        duration: 0.9,
        ease: "power3.out",
        delay: 0.1,
        scrollTrigger: {
          trigger,
          start: "top 82%",
          once: true,
        },
      },
    );
  });

  window.addEventListener(
    "load",
    () => {
      window.ScrollTrigger.refresh();
    },
    { once: true },
  );

  return true;
};

const initRevealFallback = () => {
  if ("IntersectionObserver" in window && revealItems.length) {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("is-visible");
            observer.unobserve(entry.target);
          }
        });
      },
      {
        threshold: 0.15,
        rootMargin: "0px 0px -40px 0px",
      },
    );

    revealItems.forEach((item) => observer.observe(item));
  } else {
    revealItems.forEach((item) => item.classList.add("is-visible"));
  }
};

const setContactModalState = (isOpen) => {
  if (!contactModal) return;

  contactModal.classList.toggle("is-open", isOpen);
  contactModal.setAttribute("aria-hidden", String(!isOpen));
  body.classList.toggle("modal-open", isOpen);
};

const initContactForm = () => {
  if (!contactForm) return;

  contactForm.addEventListener("submit", (event) => {
    event.preventDefault();
    contactForm.reset();
    setContactModalState(true);
  });

  contactModalCloseButtons.forEach((button) => {
    button.addEventListener("click", () => setContactModalState(false));
  });

  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape" && contactModal?.classList.contains("is-open")) {
      setContactModalState(false);
    }
  });
};

const initPathwaysPreview = () => {
  if (!pathwaysItems.length) return;

  pathwaysItems.forEach((item) => {
    const previewSrc = item.getAttribute("data-preview-src");
    if (previewSrc) {
      item.style.setProperty("--card-image", `url("${previewSrc}")`);
    }
  });

  if (!pathwaysPreviewImage) return;

  const setPreview = (item) => {
    if (!item) return;

    const nextSrc = item.getAttribute("data-preview-src");
    const nextAlt = item.getAttribute("data-preview-alt");
    if (!nextSrc) return;

    pathwaysItems.forEach((entry) => entry.classList.toggle("is-active", entry === item));
    pathwaysPreviewImage.setAttribute("src", nextSrc);

    if (nextAlt) {
      pathwaysPreviewImage.setAttribute("alt", nextAlt);
    }
  };

  pathwaysItems.forEach((item) => {
    item.addEventListener("mouseenter", () => setPreview(item));
    item.addEventListener("focusin", () => setPreview(item));
  });

  setPreview(pathwaysItems[0]);
};

const initFaqAnimation = () => {
  if (!faqItems.length) return;

  const animateFaq = (details, shouldOpen) => {
    const summary = details.querySelector("summary");
    if (!summary) return;

    const startHeight = details.offsetHeight;

    if (shouldOpen) {
      details.open = true;
    }

    const endHeight = shouldOpen ? details.scrollHeight : summary.offsetHeight;

    details.style.height = `${startHeight}px`;
    details.style.overflow = "hidden";

    requestAnimationFrame(() => {
      details.style.transition = "height 320ms ease";
      details.style.height = `${endHeight}px`;
    });

    const onTransitionEnd = (event) => {
      if (event.propertyName !== "height") return;

      details.style.transition = "";
      details.style.height = "";
      details.style.overflow = "";

      if (!shouldOpen) {
        details.open = false;
      }

      details.removeEventListener("transitionend", onTransitionEnd);
    };

    details.addEventListener("transitionend", onTransitionEnd);
  };

  faqItems.forEach((details) => {
    const summary = details.querySelector("summary");
    if (!summary) return;

    summary.addEventListener("click", (event) => {
      event.preventDefault();
      animateFaq(details, !details.open);
    });
  });
};

const initCookieBanner = () => {
  try {
    if (window.localStorage.getItem(cookieConsentKey)) return;
  } catch {
    // Ignore storage access issues and still show the banner for this session.
  }

  const banner = document.createElement("div");
  banner.className = "cookie-banner";
  banner.setAttribute("role", "dialog");
  banner.setAttribute("aria-label", "Cookie notice");
  banner.innerHTML = `
    <div class="cookie-banner-inner">
      <div class="cookie-banner-copy">
        <p class="cookie-banner-title">Cookie Notice</p>
        <p>
          Wildlife Home Connect uses cookies and similar technologies for core site function and
          analytics. You can accept all cookies or continue with only necessary cookies. See our
          <a href="cookie-policy.html">Cookie Policy</a>.
        </p>
      </div>
      <div class="cookie-banner-actions">
        <button class="button button-ghost cookie-banner-button" type="button" data-cookie-choice="necessary">
          Only Necessary
        </button>
        <button class="button cookie-banner-button" type="button" data-cookie-choice="accepted">
          Accept All
        </button>
      </div>
    </div>
  `;

  body.append(banner);

  requestAnimationFrame(() => {
    banner.classList.add("is-visible");
  });

  banner.querySelectorAll("[data-cookie-choice]").forEach((button) => {
    button.addEventListener("click", () => {
      const value = button.getAttribute("data-cookie-choice");

      try {
        window.localStorage.setItem(cookieConsentKey, value || "accepted");
      } catch {
        // Ignore storage access issues and still dismiss the banner.
      }

      banner.classList.remove("is-visible");
      window.setTimeout(() => banner.remove(), 260);
    });
  });
};

decorateUiWithIcons();
initMenu();
initMenuDropdowns();
initHeader();
initHashNavigation();
initContactForm();
initPathwaysPreview();
initFaqAnimation();
initCookieBanner();

if (!initGsapEffects()) {
  initRevealFallback();
}
