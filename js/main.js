const body = document.body;
const menu = document.querySelector("[data-menu]");
const menuToggle = document.querySelector("[data-menu-toggle]");
const menuCloseButtons = document.querySelectorAll("[data-menu-close], [data-menu-link]");
const header = document.querySelector("[data-site-header]");
const revealItems = document.querySelectorAll("[data-reveal]");
const demoForm = document.querySelector("[data-demo-form]");
const pathwaysPreviewImage = document.querySelector("[data-pathways-preview-image]");
const pathwaysItems = document.querySelectorAll("[data-pathways-item]");
const faqItems = document.querySelectorAll(".faq-list details");

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

  appendIcon(menuToggle, "menu");
  document.querySelectorAll("[data-menu-close]").forEach((button) => appendIcon(button, "x"));
  document.querySelectorAll(".button:not(.button-text)").forEach((button) =>
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

const initFormDemo = () => {
  if (!demoForm) return;

  demoForm.addEventListener("submit", (event) => {
    event.preventDefault();
    const note = demoForm.querySelector("[data-form-note]");

    if (note) {
      note.hidden = false;
    }

    demoForm.reset();
  });
};

const initPathwaysPreview = () => {
  if (!pathwaysPreviewImage || !pathwaysItems.length) return;

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

decorateUiWithIcons();
initMenu();
initHeader();
initFormDemo();
initPathwaysPreview();
initFaqAnimation();

if (!initGsapEffects()) {
  initRevealFallback();
}
