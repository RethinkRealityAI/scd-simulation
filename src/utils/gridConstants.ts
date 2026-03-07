/**
 * Shared grid constants used by both BuilderCanvas (editor) and
 * DynamicSceneLayout (preview / playback) so the two always stay in sync.
 */

export const GRID_COLS = 12;
export const GRID_ROWS = 10;
export const GRID_MARGIN: [number, number] = [6, 6];
export const GRID_CONTAINER_PADDING: [number, number] = [8, 8];
export const DEFAULT_ROW_HEIGHT = 60;

export const ALL_RESIZE_HANDLES: ('n' | 's' | 'e' | 'w' | 'ne' | 'nw' | 'se' | 'sw')[] = [
  'n', 's', 'e', 'w', 'ne', 'nw', 'se', 'sw',
];

/**
 * Compute a row-height that makes exactly GRID_ROWS fit inside the given
 * canvas pixel-height.  Never returns a value that would make total grid
 * height exceed the container — this is the key to preventing overflow.
 */
export function computeRowHeight(canvasHeight: number | undefined): number {
  if (!canvasHeight || canvasHeight <= 0) return DEFAULT_ROW_HEIGHT;

  const verticalPadding = GRID_CONTAINER_PADDING[1] * 2;
  const interRowGaps = (GRID_ROWS - 1) * GRID_MARGIN[1];
  const available = canvasHeight - verticalPadding - interRowGaps;

  return Math.max(1, Math.floor(available / GRID_ROWS));
}
