export const scrollToId = (id) => {
  if (window.__lenis) {
    window.__lenis.scrollTo(id, { offset: -72, duration: 1.4 });
  } else {
    document.querySelector(id)?.scrollIntoView({ behavior: "smooth" });
  }
};
