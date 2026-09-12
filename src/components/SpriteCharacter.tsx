import { type FC } from 'react';

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
  
  // Directly load the individual avatar from Cloudinary
  const cloudinaryUrl = `https://res.cloudinary.com/yi1cnaq4/image/upload/yakitori_avatars/avatar_${safeIndex}.png`;

  return (
    <img
      src={cloudinaryUrl}
      alt={alt}
      width={size}
      height={size}
      className={`inline-block shrink-0 ${className}`}
      style={{ imageRendering: 'pixelated', objectFit: 'contain' }}
      loading="lazy"
    />
  );
};
