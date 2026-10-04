import { useEffect, useState } from "react";

// Horário da festa no fuso de Fortaleza (UTC-3).
const EVENT_DATE = new Date("2026-12-10T16:30:00-03:00").getTime();

export default function Countdown({ dark = false }) {
  const [remaining, setRemaining] = useState(() => Math.max(0, EVENT_DATE - Date.now()));

  useEffect(() => {
    const timer = setInterval(() => setRemaining(Math.max(0, EVENT_DATE - Date.now())), 1000);
    return () => clearInterval(timer);
  }, []);

  const seconds = Math.floor(remaining / 1000);
  const units = [
    ["Dias", Math.floor(seconds / 86400)],
    ["Horas", Math.floor(seconds / 3600) % 24],
    ["Minutos", Math.floor(seconds / 60) % 60],
    ["Segundos", seconds % 60],
  ];

  return (
    <div data-testid="countdown" className={dark ? "text-white" : "text-stone-900"}>
      {remaining === 0 ? (
        <p className="font-script text-3xl">Chegou o grande dia!</p>
      ) : (
        <div className="flex justify-center gap-4 sm:gap-8" role="timer" aria-label="Contagem regressiva para 10 de dezembro de 2026 às 16h30">
          {units.map(([label, value]) => (
            <div key={label} className="text-center min-w-12">
              <span className="block font-serif text-3xl sm:text-4xl tabular-nums">{String(value).padStart(2, "0")}</span>
              <span className="text-[10px] sm:text-xs uppercase tracking-widest">{label}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
