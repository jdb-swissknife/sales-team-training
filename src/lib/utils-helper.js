// cn helper - simple class merger (avoids pulling clsx + tailwind-merge in some bundlers)
export function cn(...inputs) {
  return inputs.filter(Boolean).join(" ");
}
