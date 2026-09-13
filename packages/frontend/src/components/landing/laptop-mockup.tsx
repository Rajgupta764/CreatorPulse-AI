"use client";

import Image from "next/image";

interface LaptopMockupProps {
  src: string;
  alt: string;
  url: string;
  width: number;
  height: number;
  className?: string;
  priority?: boolean;
}

export default function LaptopMockup({
  src,
  alt,
  url,
  width,
  height,
  className = "",
  priority = false,
}: LaptopMockupProps) {
  return (
    <div className={`relative ${className}`} style={{ perspective: "1600px" }}>
      <div
        className="pointer-events-none absolute -inset-8 rounded-[48px] bg-gradient-to-br from-primary/15 via-primary/5 to-transparent blur-3xl"
        aria-hidden
      />
      <div className="relative" style={{ transform: "rotateX(5deg)", transformStyle: "preserve-3d" }}>
        <div className="relative rounded-t-2xl rounded-b-lg border border-border bg-[#1a1614] p-2 shadow-2xl shadow-primary/10 sm:p-2.5">
          <span
            className="absolute left-1/2 top-1 h-1 w-10 -translate-x-1/2 rounded-full bg-[#3E362E]/80"
            aria-hidden
          />
          <div className="overflow-hidden rounded-lg bg-[#241E19] ring-1 ring-[#171411]/10">
            <div className="flex items-center gap-1.5 border-b border-border/70 bg-muted/70 px-3 py-1.5 sm:py-2">
              <span className="h-2 w-2 rounded-full bg-[#D96B5B] sm:h-2.5 sm:w-2.5" />
              <span className="h-2 w-2 rounded-full bg-[#F59E0B] sm:h-2.5 sm:w-2.5" />
              <span className="h-2 w-2 rounded-full bg-[#6FA56F] sm:h-2.5 sm:w-2.5" />
              <div className="ml-2 flex h-5 flex-1 items-center truncate rounded-md bg-background px-2.5 text-[10px] font-medium text-muted-foreground sm:text-[11px]">
                {url}
              </div>
            </div>
            <div className="relative">
              <Image
                src={src}
                alt={alt}
                width={width}
                height={height}
                priority={priority}
                className="h-auto w-full object-cover"
              />
              <div
                className="pointer-events-none absolute inset-0 bg-gradient-to-tr from-transparent via-transparent to-[#F8F5EF]/10"
                aria-hidden
              />
            </div>
          </div>
        </div>
        <div className="mx-auto h-2 w-[104%] rounded-b-md bg-[#2a231d] shadow-inner" />
        <div className="mx-auto h-4 w-[106%] rounded-[50%] bg-gradient-to-b from-[#3E362E] via-[#51473D] to-[#5e5349] shadow-lg" />
      </div>
      <div
        className="absolute -bottom-7 left-1/2 h-7 w-[78%] -translate-x-1/2 rounded-[50%] bg-[#171411]/25 blur-2xl"
        aria-hidden
      />
    </div>
  );
}

interface MiniBrowserCardProps {
  src: string;
  alt: string;
  url: string;
  width: number;
  height: number;
  className?: string;
}

export function MiniBrowserCard({
  src,
  alt,
  url,
  width,
  height,
  className = "",
}: MiniBrowserCardProps) {
  return (
    <div
      className={`overflow-hidden rounded-lg border border-border bg-[#241E19] shadow-xl shadow-primary/10 ${className}`}
    >
      <div className="flex items-center gap-1 border-b border-border/70 bg-muted/70 px-2 py-1">
        <span className="h-1.5 w-1.5 rounded-full bg-[#D96B5B]" />
        <span className="h-1.5 w-1.5 rounded-full bg-[#F59E0B]" />
        <span className="h-1.5 w-1.5 rounded-full bg-[#6FA56F]" />
        <div className="ml-1.5 truncate rounded bg-background px-1.5 py-0.5 text-[8px] font-medium text-muted-foreground">
          {url}
        </div>
      </div>
      <Image src={src} alt={alt} width={width} height={height} className="h-auto w-full object-cover" />
    </div>
  );
}