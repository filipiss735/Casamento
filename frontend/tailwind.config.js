const colors = Object.fromEntries(
  ["background", "foreground", "border", "input", "ring"].map(name => [name, `hsl(var(--${name}))`])
);
for (const name of ["primary", "secondary", "muted", "accent", "destructive", "card", "popover"]) {
  colors[name] = { DEFAULT: `hsl(var(--${name}))`, foreground: `hsl(var(--${name}-foreground))` };
}

module.exports = {
  content: ["./src/**/*.{js,jsx}", "./public/index.html"],
  theme: {
    extend: {
      colors,
      fontFamily: {
        sans: ["Plus Jakarta Sans", "sans-serif"],
        serif: ["Cormorant Garamond", "serif"],
        script: ["Great Vibes", "cursive"],
        cinzel: ["Cinzel", "serif"],
      },
      borderRadius: { lg: "var(--radius)", md: "calc(var(--radius) - 2px)", sm: "calc(var(--radius) - 4px)" },
    },
  },
  plugins: [require("tailwindcss-animate")],
};
