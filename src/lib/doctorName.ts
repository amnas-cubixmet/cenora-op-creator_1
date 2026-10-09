/** Balance whole words over two lines without abbreviating the stored name. */
export function splitDoctorName(name: string): [string, string] {
  const words = name.trim().split(/\s+/).filter(Boolean);
  if (words.length < 2) return [name, ""];
  let best = 1;
  let score = Infinity;
  for (let i = 1; i < words.length; i++) {
    // Keep the title with the first name whenever there are more words.
    if (i === 1 && /^dr\.?$/i.test(words[0] ?? "") && words.length > 2) continue;
    const left = words.slice(0, i).join(" ");
    const right = words.slice(i).join(" ");
    const difference = Math.abs(left.length - right.length);
    if (difference < score) {
      score = difference;
      best = i;
    }
  }
  return [words.slice(0, best).join(" "), words.slice(best).join(" ")];
}
