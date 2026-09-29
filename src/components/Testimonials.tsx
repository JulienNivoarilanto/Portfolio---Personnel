import { Section } from './Section';
import { useStore } from '../store';
import { Quote } from 'lucide-react';

export function Testimonials() {
  const testimonials = useStore((state) => state.testimonials);

  if (!testimonials || testimonials.length === 0) {
    return null;
  }

  return (
    <Section id="testimonials">
      <div className="max-w-[1600px] mx-auto px-6 md:px-16 lg:px-32">
        <div className="mb-16 md:mb-24 transform-gpu border-b border-black/10 dark:border-white/10 pb-8">
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-display font-bold tracking-tight mb-4">
            Témoignages
          </h2>
          <p className="text-lg opacity-80 max-w-xl">
            Ce que disent les professionnels avec qui j'ai eu l'opportunité de collaborer.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {testimonials.map((testimonial) => (
            <div
              key={testimonial.id}
              className="bg-white/40 dark:bg-black/40 text-zinc-900 dark:text-zinc-100 backdrop-blur-xl border border-white/20 dark:border-white/10 rounded-3xl p-8 flex flex-col justify-between hover:bg-white/50 dark:hover:bg-black/50 transition-colors shadow-lg"
            >
              <div>
                <Quote className="w-8 h-8 opacity-20 mb-6" />
                <p className="text-lg leading-relaxed opacity-90 mb-8 italic">
                  "{testimonial.content}"
                </p>
              </div>
              
              <div className="flex items-center space-x-4 mt-auto">
                {testimonial.avatarUrl && testimonial.avatarUrl.trim() !== '' ? (
                  <img
                    src={testimonial.avatarUrl}
                    alt={`Portrait de ${testimonial.name}`}
                    className="w-12 h-12 rounded-full object-cover bg-black/10"
                    loading="lazy"
                  />
                ) : (
                  <div className="w-12 h-12 rounded-full bg-black/10 dark:bg-white/10 flex items-center justify-center font-bold text-sm">
                    {testimonial.name ? testimonial.name.charAt(0) : 'U'}
                  </div>
                )}
                <div>
                  <div className="font-semibold text-inherit">
                    {testimonial.name}
                  </div>
                  <div className="text-sm opacity-70">
                    {testimonial.role}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </Section>
  );
}
