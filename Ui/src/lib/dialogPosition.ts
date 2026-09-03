export type DialogPosition = 'top' | 'center' | 'bottom';

export const dialogPositionClasses: Record<DialogPosition, string> = {
  top: 'top-4',
  center: 'top-1/2 -translate-y-1/2',
  bottom: 'bottom-4',
};

export const dialogOverlayPositionClasses: Record<DialogPosition, string> = {
  top: 'items-start justify-items-center',
  center: 'place-items-center',
  bottom: 'items-end justify-items-center',
};
