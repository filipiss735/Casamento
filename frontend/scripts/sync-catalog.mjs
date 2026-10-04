import { readFile, writeFile } from 'node:fs/promises';
const root = new URL('../', import.meta.url);
async function load(path) {
  const source = await readFile(new URL(path, root), 'utf8');
  return import(`data:text/javascript;base64,${Buffer.from(source).toString('base64')}`);
}
const { featuredGifts } = await load('src/data/featuredGifts.js');
const { premiumGifts } = await load('src/data/premiumGifts.js');
const { pixGifts } = await load('src/data/pixGifts.js');
const products = [...featuredGifts.map(p => ({ ...p, tier: 'standard' })), ...premiumGifts.map(p => ({ ...p, tier: 'premium' })), ...pixGifts].filter(p => !p.placeholder);
const ids = new Set();
for (const product of products) {
  if (!product.id || ids.has(product.id)) throw new Error(`ID ausente ou repetido: ${product.id}`);
  ids.add(product.id);
  if (!product.title?.trim() || !product.image?.trim()) throw new Error(`Preencha título e foto: ${product.id}`);
  if (product.tier === 'standard' && (!product.price?.trim() || !product.link_ml?.trim())) throw new Error(`Preencha preço e link: ${product.id}`);
}
await writeFile(new URL('../backend/catalog.generated.json', root), JSON.stringify(products, null, 2));
console.log(`Catálogo sincronizado: ${products.length} presentes reais.`);
