import { motion } from "framer-motion";

const IMGS = {
  table: "/imagens/img4.jpeg",
  celebration: "/imagens/img1.jpeg",
  flowers: "/imagens/img2.jpeg",
};

const reveal = {
  hidden: { opacity: 0, y: 28 },
  show: (i = 0) => ({
    opacity: 1,
    y: 0,
    transition: { duration: 0.9, delay: i * 0.15, ease: [0.22, 1, 0.36, 1] },
  }),
};

export default function CoupleStory() {
  return (
    <section id="historia" className="py-20 sm:py-28 lg:py-36 texture-grain" data-testid="couple-story-section">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 grid grid-cols-1 md:grid-cols-12 gap-10 lg:gap-16 items-center">
        <motion.div
          className="md:col-span-5"
          variants={reveal}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, margin: "-80px" }}
        >
          <p className="font-script text-3xl sm:text-4xl text-[#9E7B36] mb-3">Nossa nova história</p>
          <h2 className="font-serif text-3xl sm:text-4xl lg:text-5xl text-stone-900 tracking-tight leading-tight mb-6">
            Um lar para o nosso felizes para sempre
          </h2>
          <div className="h-px w-20 bg-[#C5A059] mb-6" />
          <p className="text-stone-600 leading-relaxed mb-4 text-sm sm:text-base">
            Depois de tantas paginas escritas a dois, chegamos em uma das mais bonitas: aquela historia que deixa de ser apenas encontrar alguem e passa a ser contruir um mundo juntos.
          </p>
          <p className="text-stone-600 leading-relaxed text-sm sm:text-base">
           Um mundo de portas abertas, manhãs compartilhadas, planos no papel e memórias esperando para acontecer.
            Nosso pequeno conto de fadas está ganhando um lugar para existir.
E é daqui que começa o nosso felizes para sempre.
          </p>
          <p className="font-script text-2xl sm:text-3xl text-[#9E7B36] mt-8">Com amor, Filipi & Larissa</p>
        </motion.div>

        <div className="md:col-span-7 grid grid-cols-12 gap-4 sm:gap-6 items-start">
          <motion.div
            className="col-span-7 rounded-[2rem] overflow-hidden gold-frame"
            variants={reveal}
            custom={1}
            initial="hidden"
            whileInView="show"
            viewport={{ once: true, margin: "-80px" }}
          >
            <img src={IMGS.celebration} alt="Celebração do casal" className="block w-full h-auto object-contain" />
          </motion.div>
          <motion.div
            className="col-span-5 rounded-[2rem] overflow-hidden gold-frame mt-10"
            variants={reveal}
            custom={2}
            initial="hidden"
            whileInView="show"
            viewport={{ once: true, margin: "-80px" }}
          >
            <img src={IMGS.table} alt="Filipi e Larissa juntos" className="block w-full h-auto object-contain" />
          </motion.div>
          <motion.div
            className="col-span-12 sm:col-span-6 sm:col-start-4 rounded-[2rem] overflow-hidden gold-frame -mt-4 float-soft"
            variants={reveal}
            custom={3}
            initial="hidden"
            whileInView="show"
            viewport={{ once: true, margin: "-80px" }}
          >
            <img src={IMGS.flowers} alt="Uma lembrança do casal" className="block w-full h-auto object-contain" />
          </motion.div>
        </div>
      </div>
    </section>
  );
}
