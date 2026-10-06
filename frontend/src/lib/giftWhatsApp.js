export const giftContacts = [
  { name: "Filipi", phone: "5585981482346" },
  { name: "Larissa", phone: "5585997344078" },
];

export function giftWhatsAppLink(contact, product, guest, origin) {
  const isPix = product.tier === "pix";
  const lines = [
    `Olá, ${contact.name}! Sou ${guest.guest_name.trim()}.`,
    isPix
      ? `Reservei no site uma cota Pix: ${product.title}.`
      : `Meu presente é esse: ${product.title}. Já reservei no site!`,
    `Telefone: ${guest.phone.trim()}`,
  ];
  if (isPix) lines.push("Este aviso é da reserva e não confirma o pagamento.");
  if (guest.message.trim()) lines.push(`Mensagem: ${guest.message.trim()}`);
  if (!isPix && product.image) {
    try {
      const image = new URL(product.image, origin);
      if (["https:", "http:"].includes(image.protocol)) lines.push(`Foto do presente: ${image.href}`);
    } catch { /* A malformed image must not prevent the notification. */ }
  }
  return `https://wa.me/${contact.phone}?text=${encodeURIComponent(lines.join("\n\n"))}`;
}
