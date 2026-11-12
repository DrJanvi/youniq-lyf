export const MAX_HIGHLIGHTED_POSTS = 10;

export function isHighlightedPostLimitReached(activeCount: number) {
  return activeCount >= MAX_HIGHLIGHTED_POSTS;
}
