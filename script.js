(() => {
  "use strict";
  const C = window.SALON_CONFIG;
  const $ = (s, root = document) => root.querySelector(s),
    $$ = (s, root = document) => Array.from(root.querySelectorAll(s));
  const wa = (msg) =>
    `https://wa.me/${C.whatsappNumber}?text=${encodeURIComponent(msg)}`;
  function el(tag, cls, txt) {
    const n = document.createElement(tag);
    if (cls) n.className = cls;
    if (txt !== undefined) n.textContent = txt;
    return n;
  }
  function pic(key, alt) {
    const i = el("img");
    i.src = C.images[key] || "";
    i.alt = alt;
    i.loading = "lazy";
    return i;
  }
  document.title = `${C.businessName} | ${C.artistName}`;
  $$("[data-business]").forEach((n) => {
    n.textContent = C.businessName;
    if (n.classList.contains("brand-name")) {
      const sm = el("small", "", `BY ${C.artistName.toUpperCase()}`);
      n.append(sm);
    }
  });
  $$("[data-artist]").forEach((n) => (n.textContent = C.artistName));
  $$("[data-intro]").forEach((n) => (n.textContent = C.intro));
  $$("[data-about]").forEach((n) => (n.textContent = C.about));
  $$("[data-image]").forEach((n) => {
    n.src = C.images[n.dataset.image] || "";
  });
  const hero = $("#hero-image");
  if (hero) hero.style.backgroundImage = `url('${C.images.hero}')`;
  const copyright = $("#copyright");
  if (copyright)
    copyright.textContent = `© ${new Date().getFullYear()} ${C.businessName}. All rights reserved.`;
  $$("[data-social]").forEach((a) => {
    const key = a.dataset.social,
      url =
        key === "whatsapp"
          ? wa(
              `Hello ${C.artistName}, I would like to enquire about your beauty services.`,
            )
          : C[key];
    if (url) {
      a.href = url;
      a.target = "_blank";
      a.rel = "noopener noreferrer";
    } else a.hidden = true;
  });
  const phone = $("#phone-link");
  if (phone) {
    phone.href = `tel:+91${C.phone}`;
    phone.textContent = `+91 ${C.phone}`;
  }
  const menu = $(".menu-toggle"),
    nav = $(".nav-links");
  if (menu && nav) {
    menu.addEventListener("click", () => {
      const active = nav.classList.toggle("open");
      menu.setAttribute("aria-expanded", String(active));
    });
    $$("a", nav).forEach((a) =>
      a.addEventListener("click", () => {
        nav.classList.remove("open");
        menu.setAttribute("aria-expanded", "false");
      }),
    );
  }
  function card(item) {
    const art = el("article", "content-card");
    art.append(pic(item.image, item.name || item.title));
    const b = el("div", "content-pad");
    b.append(
      el("h3", "", item.name || item.title),
      el("p", "", item.description),
    );
    if (item.name) {
      const link = el("a", "underlined-link", "Enquire about this service ↗");
      link.href = "contact.html#booking";
      b.append(link);
    }
    art.append(b);
    return art;
  }
  const services = $("#service-cards");
  if (services) C.services.forEach((s) => services.append(card(s)));
  const bts = $("#bts-cards");
  if (bts) C.behindScenes.forEach((s) => bts.append(card(s)));
  const gallery = $("#gallery-grid");
  if (gallery) {
    [
      "bridal",
      "makeup",
      "hair",
      "color",
      "portrait1",
      "portrait2",
      "portrait3",
      "bts1",
      "bts2",
      "bts3",
      "studio",
      "banner",
    ].forEach((k, i) => {
      const image = pic(k, `Beauty portfolio placeholder ${i + 1}`);
      image.tabIndex = 0;
      image.addEventListener("click", () => lightbox(image.src, image.alt));
      image.addEventListener("keydown", (e) => {
        if (e.key === "Enter") lightbox(image.src, image.alt);
      });
      gallery.append(image);
    });
  }
  function lightbox(src, alt) {
    const modal = el("div", "lightbox"),
      image = el("img"),
      close = el("button", "", "Close ✕");
    image.src = src;
    image.alt = alt;
    close.addEventListener("click", () => modal.remove());
    modal.addEventListener("click", (e) => {
      if (e.target === modal) modal.remove();
    });
    modal.append(image, close);
    document.body.append(modal);
    close.focus();
    const onkey = (e) => {
      if (e.key === "Escape") {
        modal.remove();
        document.removeEventListener("keydown", onkey);
      }
    };
    document.addEventListener("keydown", onkey);
  }
  const comparisons = $("#comparison-list");
  if (comparisons)
    C.comparisons.forEach((x) => {
      const art = el("article", "compare-card"),
        box = el("div", "compare-box"),
        before = pic(x.before, "Before placeholder"),
        after = pic(x.after, "After placeholder"),
        handle = el("div", "compare-handle"),
        range = el("input", "compare-range");
      after.className = "compare-after";
      range.type = "range";
      range.min = 0;
      range.max = 100;
      range.value = 50;
      range.setAttribute("aria-label", `Reveal before and after: ${x.title}`);
      function change() {
        const v = Number(range.value);
        after.style.clipPath = `inset(0 ${100 - v}% 0 0)`;
        handle.style.left = `${v}%`;
      }
      range.addEventListener("input", change);
      box.append(before, after, handle);
      art.append(box, range, el("div", "compare-labels"));
      art.lastChild.append(el("span", "", "BEFORE"), el("span", "", "AFTER"));
      art.append(el("h3", "", x.title));
      comparisons.append(art);
      change();
    });
  const form = $("#booking-form");
  if (form) {
    const select = $("#client-service");
    C.services.forEach((s) => {
      const o = el("option", "", s.name);
      o.value = s.name;
      select.append(o);
    });
    const date = $("#client-date");
    const today = () => {
      const d = new Date();
      return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
    };
    date.min = today();
    form.addEventListener("submit", (e) => {
      e.preventDefault();
      if (!form.reportValidity()) return;
      const data = new FormData(form),
        error = $("#form-error");
      error.hidden = true;
      if (data.get("date") < today()) {
        error.textContent = "Please choose a current or future date.";
        error.hidden = false;
        return;
      }
      const msg = `Hello ${C.artistName}, I would like to request an appointment at ${C.businessName}.
Name: ${data.get("name")}
Phone: ${data.get("phone")}
Service: ${data.get("service")}
Preferred date: ${data.get("date")}
Preferred time: ${data.get("time")}
Notes: ${data.get("note") || "None"}
Please confirm availability.`;
      window.location.href = wa(msg);
    });
  }
  // Continuous leftward review ticker. Prev/next adjust the offset; hover/focus pause it.
  const track = $("#review-track"),
    viewport = $("#review-viewport");
  if (track && viewport) {
    const data = C.reviews || [];
    if (!data.length) {
      track.append(el("p", "", "Client reviews coming soon."));
    } else {
      function slide(r) {
        const n = el("article", "review-item");
        n.append(
          el(
            "div",
            "stars",
            "★".repeat(Math.max(0, Math.min(5, Number(r.rating) || 0))),
          ),
        );
        const q = el("blockquote", "", `“${r.text}”`);
        n.append(
          q,
          el("strong", "", r.name),
          el(
            "small",
            "",
            `${r.service || ""}${r.sample ? " · SAMPLE REVIEW" : ""}`,
          ),
        );
        return n;
      }
      const copies = Math.max(3, Math.ceil(8 / data.length));
      for (let j = 0; j < copies; j++)
        data.forEach((r) => track.append(slide(r)));
      let offset = 0,
        paused = false,
        last = 0;
      const step = () => {
        const item = track.firstElementChild;
        return item ? item.getBoundingClientRect().width + 20 : 410;
      };
      function normalize() {
        const cycle = step() * data.length;
        if (cycle > 0) {
          offset = ((offset % cycle) + cycle) % cycle;
          track.style.transform = `translate3d(${-offset}px,0,0)`;
        }
      }
      function tick(ts) {
        if (
          last &&
          !paused &&
          !window.matchMedia("(prefers-reduced-motion: reduce)").matches
        ) {
          offset += Math.min(40, (ts - last) / 1000) * 27;
          normalize();
        }
        last = ts;
        requestAnimationFrame(tick);
      }
      requestAnimationFrame(tick);
      function jump(dir) {
        offset += dir * step();
        normalize();
      }
      $("#review-prev")?.addEventListener("click", () => jump(-1));
      $("#review-next")?.addEventListener("click", () => jump(1));
      viewport.addEventListener("mouseenter", () => (paused = true));
      viewport.addEventListener("mouseleave", () => (paused = false));
      viewport.addEventListener("focusin", () => (paused = true));
      viewport.addEventListener("focusout", () => (paused = false));
      let touch = null;
      viewport.addEventListener(
        "touchstart",
        (e) => {
          touch = e.touches[0].clientX;
          paused = true;
        },
        { passive: true },
      );
      viewport.addEventListener(
        "touchend",
        (e) => {
          if (touch !== null) {
            const delta = e.changedTouches[0].clientX - touch;
            if (Math.abs(delta) > 35) jump(delta < 0 ? 1 : -1);
          }
          touch = null;
          paused = false;
        },
        { passive: true },
      );
      $("#review-status").textContent = `Reviews`;
      window.addEventListener("resize", normalize);
    }
  }
})();
