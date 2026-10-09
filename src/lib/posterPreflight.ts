/** Wait for React fitting and font/image-driven layout changes before capture. */
export async function waitForPosterLayout(node: HTMLElement): Promise<void> {
  let previous = "";
  let stable = 0;
  for (let frame = 0; frame < 90; frame++) {
    await new Promise<void>((resolve) => requestAnimationFrame(() => resolve()));
    const elements = [
      ...node.querySelectorAll<HTMLElement>(
        "[data-fit-status], [data-doctor-photo], [data-doctor-text]",
      ),
    ];
    const snapshot = elements
      .map(
        (el) =>
          `${el.offsetWidth}:${el.offsetHeight}:${el.style.fontSize}:${el.dataset["fitStatus"]}`,
      )
      .join("|");
    const pending = elements.some((el) => el.dataset["fitStatus"] === "pending");
    stable = !pending && snapshot === previous ? stable + 1 : 0;
    previous = snapshot;
    if (stable >= 3) return;
  }
  throw new Error("Poster layout is still loading. Please wait and try again.");
}

/** Do not silently export clipped names, departments, or qualifications. */
export function assertPosterFits(node: HTMLElement): void {
  for (const card of node.querySelectorAll<HTMLElement>("[data-doctor-card]")) {
    const bounds = card.getBoundingClientRect();
    const textOverflow = Boolean(card.querySelector('[data-fit-status="overflow"]'));
    const outside = [
      ...card.querySelectorAll<HTMLElement>("[data-doctor-photo], [data-doctor-text]"),
    ].some((el) => {
      const box = el.getBoundingClientRect();
      return (
        box.top < bounds.top - 1 ||
        box.bottom > bounds.bottom + 1 ||
        box.left < bounds.left - 1 ||
        box.right > bounds.right + 1
      );
    });
    if (textOverflow || outside) {
      throw new Error(
        "Doctor details do not fit at readable sizes. Choose fewer doctors per poster or split into more posters.",
      );
    }
  }
}
