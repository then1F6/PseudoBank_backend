import { sha256 } from "@/utils/hash.util";

function getAvatarMask(hashHex: string, X: number): string {
  if (X < 0 || X > 15) throw new Error("X must be between 0 and 15");

  let seed = parseInt(hashHex.slice(6, 14), 16);
  const rand = () => {
    let t = (seed += 0x6d2b79f5) | 0;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };

  const indices = Array.from({ length: 15 }, (_, i) => i);

  for (let i = 0; i < X; i++) {
    const j = i + Math.floor(rand() * (15 - i));
    [indices[i], indices[j]] = [indices[j]!, indices[i]!];
  }

  const activeIndices = indices.slice(0, X);

  return Array.from({ length: 15 }, (_, i) => 
    activeIndices.includes(i) ? "1" : "0"
  ).join("");
}
export async function generate_avatar(key: string) {
  const hash = await sha256(key)
  const avatar_color = (parseInt(hash.slice(0, 3), 16) % 360).toString().padStart(3, "0")
  const pixel_count = (parseInt(hash.slice(3, 6), 16) % 6) + 6

  const avatar_mask = getAvatarMask(hash, pixel_count)
  return `${avatar_color}${avatar_mask}`
}