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
  1: { cols: 1, tile: 440, cardWidth: 940, centerLast: false, text: { dept: 48, name: 55, qual: 24, time: 36 } },
  2: { cols: 1, tile: 300, cardWidth: 900, centerLast: false, text: { dept: 43, name: 48, qual: 21, time: 32 } },
  3: { cols: 1, tile: 220, cardWidth: 860, centerLast: false, text: { dept: 37, name: 43, qual: 18, time: 27 } },
  4: { cols: 1, tile: 190, cardWidth: 860, centerLast: false, gap: 0, text: { dept: 34, name: 41, qual: 16, time: 23 } },
  5: { cols: 2, tile: 190, cardWidth: 490, centerLast: true, gap: 14, text: { dept: 31, name: 37, qual: 15, time: 20 } },
  6: { cols: 2, tile: 190, cardWidth: 490, centerLast: false, gap: 14, text: { dept: 31, name: 37, qual: 15, time: 20 } },
  7: { cols: 2, tile: 138, cardWidth: 490, centerLast: true, text: { dept: 27, name: 23, qual: 14, time: 18 } },
  8: { cols: 2, tile: 138, cardWidth: 490, centerLast: false, text: { dept: 27, name: 23, qual: 14, time: 18 } },
};
