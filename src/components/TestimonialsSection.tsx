'use client';

const testimonials = [
  {
    name: 'Valentina R.',
    location: 'Salta Capital',
    text: 'Los imanes personalizados quedaron increíbles! Pedí 50 para los souvenirs del casamiento y todos mis invitados los adoraron. La calidad del MDF y el acabado son impecables.',
    stars: 5,
  },
  {
    name: 'Marcos D.',
    location: 'Salta',
    text: 'Compré portacelulares con el nombre de mi empresa para regalar a los empleados. Muy buen trabajo, entrega rápida y el diseño quedó tal cual lo pedí. Los recomiendo 100%.',
    stars: 5,
  },
  {
    name: 'Camila F.',
    location: 'Rosario de la Frontera',
    text: 'Me hicieron un cuadro personalizado para el cumple de 15 de mi hija y fue el regalo más lindo de la fiesta. Muy amables y atentos con los detalles del diseño.',
    stars: 5,
  },
];

function Stars({ count }: { count: number }) {
  return (
    <div className="flex gap-0.5 mb-3">
      {Array.from({ length: 5 }).map((_, i) => (
        <svg
          key={i}
          width="16"
          height="16"
          viewBox="0 0 24 24"
          fill={i < count ? '#D4A054' : 'none'}
          stroke="#D4A054"
          strokeWidth="1.5"
        >
          <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
        </svg>
      ))}
    </div>
  );
}

export default function TestimonialsSection() {
  return (
    <section className="bg-cream py-16 px-4 sm:px-6 lg:px-8">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-12">
          <p className="text-earth font-medium uppercase tracking-widest text-sm mb-3">
            Reseñas
          </p>
          <h2 className="font-heading text-4xl sm:text-5xl font-bold text-brown-dark mb-6">
            Lo que dicen nuestros clientes
          </h2>
          <div className="flex items-center justify-center gap-4">
            <div className="h-px w-12 bg-brown-light" />
            <div className="w-1.5 h-1.5 rounded-full bg-brown-light" />
            <div className="h-px w-12 bg-brown-light" />
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
          {testimonials.map((t, i) => (
            <div
              key={i}
              className="bg-white rounded-2xl border border-beige p-6 flex flex-col shadow-sm hover:shadow-md transition-shadow"
            >
              <Stars count={t.stars} />
              <p className="text-brown-medium/80 text-sm leading-relaxed flex-1 italic mb-5">
                &ldquo;{t.text}&rdquo;
              </p>
              <div className="border-t border-beige pt-4">
                <p className="font-heading font-semibold text-brown-dark text-sm">{t.name}</p>
                <p className="text-xs text-brown-medium/60">{t.location}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
