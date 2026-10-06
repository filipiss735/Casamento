import { CalendarDays, Clock, MapPin } from "lucide-react";

export default function EventDetails({ settings }) {
  const details = [
    { icon: CalendarDays, title: "Data", value: "28 de novembro de 2026" },
    { icon: Clock, title: "Horário", value: "16h30" },
    { icon: MapPin, title: "Local", value: settings?.party_address?.trim() && settings.party_address !== "Endereço a confirmar em breve" ? settings.party_address : "Av. Frei Cirilo, 4340 — Igreja de Jesus Cristo dos Santos dos Últimos Dias" },
  ];

  return (
    <section id="detalhes" className="py-20 sm:py-28 bg-[#FAF7F2]" data-testid="event-details">
      <div className="max-w-5xl mx-auto px-4 sm:px-6">
        <div className="text-center mb-10">
          <p className="font-script text-3xl sm:text-4xl text-[#9E7B36] mb-2">Um encontro especial</p>
          <h2 className="font-serif text-3xl sm:text-4xl text-stone-900">Detalhes da celebração</h2>
        </div>
        <div className="grid gap-6 sm:grid-cols-3">
          {details.map(({ icon: Icon, title, value }) => (
            <div key={title} className="rounded-2xl border border-[#E4DDD3] bg-white p-6 text-center">
              <Icon className="w-6 h-6 mx-auto mb-4 text-[#9E7B36]" aria-hidden="true" />
              <h3 className="font-serif text-2xl mb-2">{title}</h3>
              <p className="text-sm text-stone-500 break-words whitespace-pre-line">{value}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
