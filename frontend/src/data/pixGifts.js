// Dez cotas de cada valor. IDs estáveis preservam as reservas no banco.
export const pixGifts = Array.from({ length: 10 }, (_, index) =>
  [50, 100, 200].map(amount => ({
    id: `pix-${amount}-${String(index + 1).padStart(2, "0")}`,
    title: `Pix de R$ ${amount},00`,
    description: `Cota ${index + 1} de 10 deste valor`,
    category: "Pix",
    tier: "pix",
    price: `R$ ${amount},00`,
    image: "/monogram.svg",
    link_ml: "",
  }))
).flat();
