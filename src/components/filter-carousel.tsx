"use client";

import {
  Carousel,
  CarouselApi,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel";

import { useState, useEffect } from "react";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { Skeleton } from "./ui/skeleton";

interface FilterCarouselProps {
  isLoading?: boolean;
  filter?: string | null;
  filters: {
    value: string;
    label: string;
  }[];
  onFilterChange: (filter: string | null) => void;
}

export const FilterCarousel = ({
  isLoading,
  filter,
  filters,
  onFilterChange,
}: FilterCarouselProps) => {
  const [api, setApi] = useState<CarouselApi | null>(null);
  const [current, setCurrent] = useState<number>(0);
  const [count, setCount] = useState<number>(0);

  // useEffect(() => {
  //   if (!api) {
  //     return;
  //   }
  //   setCount(api.scrollSnapList().length);
  //   setCurrent(api.selectedScrollSnap() + 1);
  //   api.on("select", () => {
  //     setCurrent(api.selectedScrollSnap() + 1);
  //   });
  // }, [api]);
  useEffect(() => {
    if (!api) return;

    const update = () => {
      setCount(api.scrollSnapList().length);
      setCurrent(api.selectedScrollSnap());
    };

    update();
    api.on("select", update);
    api.on("reInit", update);

    return () => {
      api.off("select", update);
      api.off("reInit", update);
    };
  }, [api]);



  return (
    <div className="relative w-full">
      {/* left fade */}
      <div
        className={cn(
          "absolute left-12 top-0 bottom-0 w-12 z-10 bg-gradient-to-r from-white to-transparent pointer-events-none",
          current === 1 ? "opacity-0" : "opacity-100"
        )}
      />
      <Carousel
        setApi={setApi}
        opts={{ align: "start", dragFree: true }}
        className="w-full px-12"
      >
        <CarouselPrevious className="absolute left-0 top-1/2 -translate-y-1/2 z-20" />

        <CarouselContent className="-ml-3">
          {isLoading &&
            Array.from({ length: 24 }).map((_, i) => (
              <CarouselItem key={i} className="flex-shrink-0 pl-3 basis-auto">
                <Skeleton className="px-3 py-1 w-[100px] h-full rounded-lg font-semibold text-sm">
                  &nbsp;
                </Skeleton>
              </CarouselItem>
            ))}
          {!isLoading && (
            <CarouselItem className="flex-shrink-0 pl-3 basis-auto">
              <Badge
                variant={!filter || filter === null ? "default" : "secondary"}
                className={`cursor-pointer px-3 py-1 rounded-lg transition-colors text-sm whitespace-nowrap`}
                onClick={() => onFilterChange(null)}
              >
                All
              </Badge>
            </CarouselItem>
          )}
          {!isLoading &&
            filters.map((i) => (
              // Use CarouselItem to wrap each filter button
              <CarouselItem
                key={i.value}
                className="flex-shrink-0 pl-3 basis-auto"
              >
                <Badge
                  variant={i.value === filter ? "default" : "secondary"}
                  className={`cursor-pointer px-3 py-1 rounded-lg transition-colors text-sm whitespace-nowrap`}
                  onClick={() => onFilterChange(i.value)}
                >
                  {i.label}
                </Badge>
              </CarouselItem>
            ))}
        </CarouselContent>

        <CarouselNext className="absolute right-0 top-1/2 -translate-y-1/2 z-20" />
      </Carousel>
      {/* right fade */}
      <div
        className={cn(
          "absolute right-12 top-0 bottom-0 w-12 z-10 bg-gradient-to-l from-white to-transparent pointer-events-none",
          current === count ? "opacity-0" : "opacity-100"
        )}
      />
    </div>
  );
};
