const body = document.body;
const menuToggle = document.getElementById("menuToggle");
const navLinks = document.getElementById("navLinks");
const navAnchors = Array.from(document.querySelectorAll("[data-scroll-link]"));
const yearEl = document.getElementById("year");
const contactForm = document.getElementById("contactForm");
const formNote = document.getElementById("formNote");
const announcer = document.getElementById("announcer");
const scrollProgressBar = document.getElementById("scrollProgressBar");
const backToTop = document.getElementById("backToTop");

const galleryItems = Array.from(document.querySelectorAll(".gallery-item"));
const lightbox = document.getElementById("lightbox");
const lightboxDialog = document.getElementById("lightboxDialog");
const lightboxImage = document.getElementById("lightboxImage");
const lightboxCaption = document.getElementById("lightboxCaption");
const lightboxClose = document.getElementById("lightboxClose");
const lightboxPrev = document.getElementById("lightboxPrev");
const lightboxNext = document.getElementById("lightboxNext");

const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
let activeGalleryIndex = 0;
let lastFocusedElement = null;

body.classList.add("js-ready");

function announce(message) {
  if (!announcer) return;
  announcer.textContent = "";
  window.setTimeout(() => {
    announcer.textContent = message;
  }, 50);
}

function updateMenuState(isOpen) {
  if (!menuToggle || !navLinks) return;
  navLinks.classList.toggle("show", isOpen);
  menuToggle.setAttribute("aria-expanded", String(isOpen));
  menuToggle.setAttribute(
    "aria-label",
    isOpen ? "Close navigation menu" : "Open navigation menu"
  );
}

if (menuToggle && navLinks) {
  menuToggle.addEventListener("click", () => {
    const isOpen = !navLinks.classList.contains("show");
    updateMenuState(isOpen);
  });
}

navAnchors.forEach((link) => {
  link.addEventListener("click", () => {
    if (window.innerWidth <= 720) {
      updateMenuState(false);
    }
  });
});

document.addEventListener("keydown", (event) => {
  if (event.key === "Escape" && navLinks?.classList.contains("show")) {
    updateMenuState(false);
    menuToggle?.focus();
  }
});

if (yearEl) {
  yearEl.textContent = new Date().getFullYear();
}

function clearActiveNavLinks() {
  navAnchors.forEach((link) => {
    link.classList.remove("is-active");
    link.removeAttribute("aria-current");
  });
}

function setActiveNavLink(id) {
  navAnchors.forEach((link) => {
    const href = link.getAttribute("href");
    const shouldParticipateInHighlight = href !== "#contact";
    const isActive = shouldParticipateInHighlight && href === `#${id}`;

    link.classList.toggle("is-active", isActive);

    if (isActive) {
      link.setAttribute("aria-current", "true");
    } else {
      link.removeAttribute("aria-current");
    }
  });
}

/*
  Only sections that should be highlighted in the navbar.
  Contact is intentionally excluded.
*/
const highlightableNavAnchors = navAnchors.filter((link) => {
  const href = link.getAttribute("href");
  return href && href.startsWith("#") && href !== "#contact";
});

const navSections = highlightableNavAnchors
  .map((link) => {
    const href = link.getAttribute("href");
    const section = document.querySelector(href);
    return section || null;
  })
  .filter(Boolean);

function updateActiveSection() {
  if (!navSections.length) return;

  const headerHeight = document.querySelector(".site-header")?.offsetHeight || 78;

  /*
    Use a point a little below the sticky header to decide which section
    is currently active.
  */
  const activationLine = window.scrollY + headerHeight + 40;

  let activeSectionId = null;

  for (let i = 0; i < navSections.length; i += 1) {
    const section = navSections[i];
    const sectionTop = section.offsetTop;
    const sectionBottom = section.offsetTop + section.offsetHeight;

    if (activationLine >= sectionTop && activationLine < sectionBottom) {
      activeSectionId = section.id;
      break;
    }
  }

  if (activeSectionId) {
    setActiveNavLink(activeSectionId);
  } else {
    clearActiveNavLinks();
  }
}

function updateScrollProgress() {
  if (!scrollProgressBar) return;
  const scrollTop = window.scrollY || window.pageYOffset;
  const docHeight = document.documentElement.scrollHeight - window.innerHeight;
  const progress = docHeight > 0 ? (scrollTop / docHeight) * 100 : 0;
  scrollProgressBar.style.width = `${Math.min(progress, 100)}%`;
}

function updateBackToTop() {
  if (!backToTop) return;
  backToTop.classList.toggle("show", window.scrollY > 500);
}

function handleScrollUI() {
  updateScrollProgress();
  updateBackToTop();
  updateActiveSection();
}

window.addEventListener("scroll", handleScrollUI, { passive: true });
window.addEventListener("resize", updateActiveSection);

window.addEventListener("load", () => {
  updateScrollProgress();
  updateBackToTop();
  updateActiveSection();
});

updateScrollProgress();
updateBackToTop();
updateActiveSection();

if (backToTop) {
  backToTop.addEventListener("click", () => {
    window.scrollTo({
      top: 0,
      behavior: prefersReducedMotion ? "auto" : "smooth"
    });
  });
}

const revealItems = document.querySelectorAll(".reveal-on-scroll");

if (revealItems.length) {
  if (prefersReducedMotion || !("IntersectionObserver" in window)) {
    revealItems.forEach((item) => item.classList.add("is-visible"));
  } else {
    const revealObserver = new IntersectionObserver(
      (entries, observer) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) return;
          entry.target.classList.add("is-visible");
          observer.unobserve(entry.target);
        });
      },
      {
        threshold: 0.15
      }
    );

    revealItems.forEach((item) => revealObserver.observe(item));
  }
}

function validateField(field) {
  if (!field) return true;

  const trimmedValue = field.value.trim();
  field.value = trimmedValue;

  let message = "";

  if (!trimmedValue) {
    message = "Please fill out this field.";
  } else if (field.type === "email" && !field.checkValidity()) {
    message = "Please enter a valid email address.";
  }

  if (message) {
    field.setAttribute("aria-invalid", "true");
    field.setCustomValidity(message);
    return false;
  }

  field.setAttribute("aria-invalid", "false");
  field.setCustomValidity("");
  return true;
}

if (contactForm) {
  const requiredFields = Array.from(
    contactForm.querySelectorAll("input[required], textarea[required]")
  );

  requiredFields.forEach((field) => {
    field.addEventListener("input", () => validateField(field));
    field.addEventListener("blur", () => validateField(field));
  });

  contactForm.addEventListener("submit", async (event) => {
    event.preventDefault();

    const isValid = requiredFields.every((field) => validateField(field));

    if (!isValid) {
      const firstInvalidField = requiredFields.find(
        (field) => field.getAttribute("aria-invalid") === "true"
      );

      if (firstInvalidField) {
        firstInvalidField.focus();
        firstInvalidField.reportValidity();
      }

      formNote.textContent =
        "Please fill out your name, phone number, email, and project details.";
      formNote.style.color = "#b91c1c";
      announce("Please review the form and correct the highlighted fields.");
      return;
    }

    const submitButton = contactForm.querySelector('button[type="submit"]');
    if (submitButton) {
      submitButton.disabled = true;
    }

    formNote.textContent = "Sending your request...";
    formNote.style.color = "#1f2937";
    announce("Sending your quote request.");

    try {
      if (typeof emailjs === "undefined") {
        throw new Error("EmailJS is not available.");
      }

      await emailjs.sendForm(
        "service_mrxdcjj",
        "template_7f9596o",
        contactForm
      );

      formNote.textContent =
        "Thank you. Your quote request was sent successfully.";
      formNote.style.color = "#166534";
      announce("Your quote request was sent successfully.");
      contactForm.reset();

      requiredFields.forEach((field) => {
        field.setAttribute("aria-invalid", "false");
        field.setCustomValidity("");
      });
    } catch (error) {
      console.error("EmailJS error:", error);
      formNote.textContent =
        "Sorry, something went wrong. Please call us directly at 903-327-2243.";
      formNote.style.color = "#b91c1c";
      announce("There was a problem sending the form.");
    } finally {
      if (submitButton) {
        submitButton.disabled = false;
      }
    }
  });
}

function getFocusableElements(container) {
  if (!container) return [];
  return Array.from(
    container.querySelectorAll(
      'button, [href], input, textarea, select, [tabindex]:not([tabindex="-1"])'
    )
  ).filter((element) => !element.hasAttribute("disabled"));
}

function renderLightboxImage(index) {
  if (!galleryItems.length || !lightboxImage || !lightboxCaption) return;

  activeGalleryIndex = (index + galleryItems.length) % galleryItems.length;
  const activeItem = galleryItems[activeGalleryIndex];
  const imageSrc = activeItem.getAttribute("data-image") || "";
  const captionText = activeItem.getAttribute("data-caption") || "";
  const imgAlt =
    activeItem.querySelector("img")?.getAttribute("alt") || "Expanded project image";

  lightboxImage.src = imageSrc;
  lightboxImage.alt = imgAlt;
  lightboxCaption.textContent = captionText;
}

function openLightbox(index) {
  if (!lightbox || !lightboxDialog) return;

  lastFocusedElement = document.activeElement;
  renderLightboxImage(index);
  lightbox.classList.add("show");
  lightbox.setAttribute("aria-hidden", "false");
  body.classList.add("no-scroll");
  lightboxDialog.focus();
  announce("Image viewer opened. Use left and right arrow keys to browse images.");
}

function closeLightbox() {
  if (!lightbox) return;

  lightbox.classList.remove("show");
  lightbox.setAttribute("aria-hidden", "true");
  body.classList.remove("no-scroll");

  if (lightboxImage) {
    lightboxImage.src = "";
    lightboxImage.alt = "Expanded project image";
  }

  if (lightboxCaption) {
    lightboxCaption.textContent = "";
  }

  if (lastFocusedElement instanceof HTMLElement) {
    lastFocusedElement.focus();
  }
}

galleryItems.forEach((item, index) => {
  item.addEventListener("click", () => openLightbox(index));
});

lightboxClose?.addEventListener("click", closeLightbox);

lightboxPrev?.addEventListener("click", () => {
  renderLightboxImage(activeGalleryIndex - 1);
});

lightboxNext?.addEventListener("click", () => {
  renderLightboxImage(activeGalleryIndex + 1);
});

lightbox?.addEventListener("click", (event) => {
  if (event.target === lightbox) {
    closeLightbox();
  }
});

document.addEventListener("keydown", (event) => {
  const isLightboxOpen = lightbox?.classList.contains("show");

  if (!isLightboxOpen) return;

  if (event.key === "Escape") {
    closeLightbox();
    return;
  }

  if (event.key === "ArrowRight") {
    renderLightboxImage(activeGalleryIndex + 1);
    return;
  }

  if (event.key === "ArrowLeft") {
    renderLightboxImage(activeGalleryIndex - 1);
    return;
  }

  if (event.key === "Tab" && lightboxDialog) {
    const focusableElements = getFocusableElements(lightboxDialog);
    if (!focusableElements.length) return;

    const firstElement = focusableElements[0];
    const lastElement = focusableElements[focusableElements.length - 1];

    if (event.shiftKey && document.activeElement === firstElement) {
      event.preventDefault();
      lastElement.focus();
    } else if (!event.shiftKey && document.activeElement === lastElement) {
      event.preventDefault();
      firstElement.focus();
    }
  }
});