export function nonbreakingText(text: string): string {
  return text.replace(/ /g, '\u00A0');
}
