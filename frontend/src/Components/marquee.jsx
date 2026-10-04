const ITEMS = [
  "Chá de Casa Nova",
  "Filipi & Larissa",
  "31 de Outubro",
  "Uma nova história começa",
  "Sua presença é o maior presente",
];

export default function Marquee() {
  const row = [...ITEMS, ...ITEMS, ...ITEMS];
  return (
    <div className="border-y border-[#C5A059]/40 bg-[#F3EFE6] py-5 overflow-hidden" data-testid="editorial-marquee">
      <div className="marquee-track flex whitespace-nowrap w-max">
        {[0, 1].map((half) => (
          <div key={half} className="flex shrink-0">
            {row.map((item, i) => (
              <span key={`${half}-${i}`} className="flex items-center">
                <span className="font-serif italic text-xl sm:text-2xl text-stone-700 px-6">{item}</span>
                <span className="text-[#C5A059] text-sm">✦</span>
              </span>
            ))}
          </div>
        ))}
      </div>
    </div>
  );
}
