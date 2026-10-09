export interface LayoutConfig {
  cols: 1 | 2;
  tile: number;
  cardWidth: number;
  centerLast: boolean;
  /** Space between rows. Four single-column cards use none so each card can grow into that band. */
  gap?: number;
  text: { dept: number; name: number; qual: number; time: number };
}

/** Hand-tuned layouts for 1–8 doctors on a 1080×1350 canvas. */
export const LAYOUTS: Record<1|2|3|4|5|6|7|8, LayoutConfig> = {
  1: { cols: 1, tile: 440, cardWidth: 940, centerLast: false, text: { dept: 50, name: 50, qual: 28, time: 36 } },
  2: { cols: 1, tile: 300, cardWidth: 900, centerLast: false, text: { dept: 44, name: 44, qual: 25, time: 32 } },
  3: { cols: 1, tile: 220, cardWidth: 860, centerLast: false, text: { dept: 37, name: 38, qual: 22, time: 27 } },
  4: { cols: 1, tile: 190, cardWidth: 860, centerLast: false, gap: 0, text: { dept: 34, name: 36, qual: 19, time: 23 } },
  5: { cols: 2, tile: 180, cardWidth: 490, centerLast: true, text: { dept: 29, name: 26, qual: 16, time: 20 } },
  6: { cols: 2, tile: 180, cardWidth: 490, centerLast: false, text: { dept: 29, name: 26, qual: 16, time: 20 } },
  7: { cols: 2, tile: 138, cardWidth: 490, centerLast: true, text: { dept: 27, name: 23, qual: 14, time: 18 } },
  8: { cols: 2, tile: 138, cardWidth: 490, centerLast: false, text: { dept: 27, name: 23, qual: 14, time: 18 } },
};
