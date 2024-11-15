import { Carousel, CarouselContent, CarouselItem } from "@/components/ui/carousel";
import type { TestimoniesRecord } from "@/lib/pocketbase/schemas";
import Autoplay from "embla-carousel-autoplay";

// MAIN ************************************************************************************************************************************
export default function TheTestimoniesCarousel({ className, items }: TheTestimoniesCarouselProps) {
  return (
    <Carousel opts={{ loop: true }} orientation="vertical" plugins={[Autoplay({ delay: 6000 })]} className={className}>
      <CarouselContent className="h-[28rem]">
        {items.map(({ author, text, title }, key) => (
          <CarouselItem key={key} className="flex h-full items-center justify-center text-center">
            <article className="max-w-4xl">
              <h4 className="mb-8 text-3xl font-bold italic">{title}</h4>
              <div className="mb-4 italic" dangerouslySetInnerHTML={{ __html: text }} />
              <p className="font-bold">{author}</p>
            </article>
          </CarouselItem>
        ))}
      </CarouselContent>
    </Carousel>
  );
}

// TYPES ***********************************************************************************************************************************
export type TheTestimoniesCarouselProps = { className?: string; items: Pick<TestimoniesRecord, "author" | "text" | "title">[] };
