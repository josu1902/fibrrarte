export default function AboutSection() {
  return (
    <section id="nosotros" style={{ backgroundColor: '#1a0c05' }} className="py-10 border-t border-gold/10">
      <div className="max-w-4xl mx-auto px-6 sm:px-10 text-center">

        <p className="text-gold/50 font-medium uppercase tracking-widest text-xs mb-2">Quiénes somos</p>
        <h2 className="font-heading text-2xl sm:text-3xl font-bold text-cream mb-4">Sobre Nosotros</h2>

        <p className="text-cream/60 text-sm leading-relaxed max-w-xl mx-auto mb-7">
          Somos un emprendimiento familiar de Salta Capital. Creamos souvenirs y productos artesanales
          en MDF hechos a mano, con dedicación y cariño en cada detalle.
        </p>

        <div className="flex items-center justify-center gap-8 sm:gap-12">
          {[
            { icon: '✦', label: 'Personalizado' },
            { icon: '◈', label: 'Artesanal' },
            { icon: '◎', label: 'A pedido' },
          ].map((item) => (
            <div key={item.label} className="flex flex-col items-center gap-1.5">
              <span className="text-gold/60 text-xl">{item.icon}</span>
              <span className="text-cream/70 text-xs font-medium tracking-wide">{item.label}</span>
            </div>
          ))}
        </div>

      </div>
    </section>
  );
}
