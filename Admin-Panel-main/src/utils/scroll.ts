export function preventScroll(currentPosition: number) {
  document.body.style.overflow = 'hidden';
  document.body.style.position = 'fixed';
  document.body.style.top = `-${currentPosition}px`;
  document.body.style.width = '100%';
}
export function restoreScroll(restorePosition?: number) {
  document.body.style.removeProperty('overflow');
  document.body.style.removeProperty('position');
  document.body.style.removeProperty('top');
  document.body.style.removeProperty('width');
  if (restorePosition) {
    window.scrollTo(0, restorePosition);
  }
}
