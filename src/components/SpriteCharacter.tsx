import { type FC } from 'react';
import spriteSheetUrl from '../assets/sprite_sheet.png';

export interface SpriteCharacterProps {
  /** Index from 0 to 191 */
  index: number;
  /** Size in pixels (width & height), defaults to 48px */
  size?: number;
  className?: string;
  alt?: string;
}

export const SpriteCharacter: FC<SpriteCharacterProps> = ({
  index,
  size = 48,
  className = '',
  alt = 'Character Sprite',
}) => {
  // Ensure index is constrained between 0 and 191
  const safeIndex = Math.max(0, Math.min(191, Math.floor(index)));
  const row = Math.floor(safeIndex / 12); // 0 to 15 (16 rows)
  const col = safeIndex % 12;            // 0 to 11 (12 cols)

  const bgWidth = size * 12;
  const bgHeight = size * 16;
  const posX = -(col * size);
  const posY = -(row * size);

  return (
    <div
      role="img"
      aria-label={alt}
      className={`inline-block shrink-0 relative overflow-hidden select-none ${className}`}
      style={{
        width: `${size}px`,
        height: `${size}px`,
        backgroundImage: `url('${spriteSheetUrl}')`,
        backgroundPosition: `${posX}px ${posY}px`,
        backgroundSize: `${bgWidth}px ${bgHeight}px`,
        imageRendering: 'pixelated',
      }}
    />
  );
};
