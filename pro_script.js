const menuToggle = document.getElementById("menuToggle");
const navLinks = document.getElementById("navLinks");
const yearEl = document.getElementById("year");
const contactForm = document.getElementById("contactForm");
const formNote = document.getElementById("formNote");

const galleryItems = document.querySelectorAll(".gallery-item");
const lightbox = document.getElementById("lightbox");
const lightboxImage = document.getElementById("lightboxImage");
const lightboxCaption = document.getElementById("lightboxCaption");
const lightboxClose = document.getElementById("lightboxClose");

if (menuToggle && navLinks) {
  menuToggle.addEventListener("click", () => {
    navLinks.classList.toggle("show");
    const expanded = navLinks.classList.contains("show");
    menuToggle.setAttribute("aria-expanded", expanded ? "true" : "false");
  });
}

document.querySelectorAll(".nav-links a").forEach((link) => {
  link.addEventListener("click", () => {
    if (navLinks) {
      navLinks.classList.remove("show");
    }
    if (menuToggle) {
      menuToggle.setAttribute("aria-expanded", "false");
    }
  });
});

if (yearEl) {
  yearEl.textContent = new Date().getFullYear();
}

if (contactForm) {
  contactForm.addEventListener("submit", async (event) => {
    event.preventDefault();

    const name = document.getElementById("name")?.value.trim();
    const phone = document.getElementById("phone")?.value.trim();
    const email = document.getElementById("email")?.value.trim();
    const message = document.getElementById("message")?.value.trim();

    if (!name || !phone || !email || !message) {
      formNote.textContent =
        "Please fill out your name, phone number, email, and project details.";
      formNote.style.color = "#b91c1c";
      return;
    }

    const submitButton = contactForm.querySelector('button[type="submit"]');
    if (submitButton) submitButton.disabled = true;

    formNote.textContent = "Sending your request...";
    formNote.style.color = "#1f2937";

    try {
      await emailjs.sendForm(
        "service_mrxdcjj",
        "template_7f9596o",
        contactForm
      );

      formNote.textContent =
        "Thank you. Your quote request was sent successfully.";
      formNote.style.color = "#166534";
      contactForm.reset();
    } catch (error) {
      console.error("EmailJS error:", error);
      formNote.textContent =
        "Sorry, something went wrong. Please call us directly at 903-327-2243.";
      formNote.style.color = "#b91c1c";
    } finally {
      if (submitButton) submitButton.disabled = false;
    }
  });
}

function openLightbox(imageSrc, captionText) {
  if (!lightbox || !lightboxImage || !lightboxCaption) return;

  lightboxImage.src = imageSrc;
  lightboxCaption.textContent = captionText || "";
  lightbox.classList.add("show");
  lightbox.setAttribute("aria-hidden", "false");
  document.body.style.overflow = "hidden";
}

function closeLightbox() {
  if (!lightbox || !lightboxImage || !lightboxCaption) return;

  lightbox.classList.remove("show");
  lightbox.setAttribute("aria-hidden", "true");
  lightboxImage.src = "";
  lightboxCaption.textContent = "";
  document.body.style.overflow = "";
}

galleryItems.forEach((item) => {
  item.addEventListener("click", () => {
    const imageSrc = item.getAttribute("data-image");
    const captionText = item.getAttribute("data-caption");

    if (imageSrc) {
      openLightbox(imageSrc, captionText);
    }
  });
});

if (lightboxClose) {
  lightboxClose.addEventListener("click", closeLightbox);
}

if (lightbox) {
  lightbox.addEventListener("click", (event) => {
    if (event.target === lightbox) {
      closeLightbox();
    }
  });
}

document.addEventListener("keydown", (event) => {
  if (event.key === "Escape" && lightbox?.classList.contains("show")) {
    closeLightbox();
  }
});