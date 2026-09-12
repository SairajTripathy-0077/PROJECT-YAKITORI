import fs from 'fs';
import path from 'path';

// Ensure destination directories exist
const publicDir = path.resolve(process.cwd(), 'public');
const spritesDir = path.resolve(publicDir, 'sprites');
const srcSpriteSheet = path.resolve(process.cwd(), 'src/assets/sprite_sheet.png');
const publicSpriteSheet = path.resolve(publicDir, 'sprite_sheet.png');

if (!fs.existsSync(publicDir)) {
  fs.mkdirSync(publicDir, { recursive: true });
}

if (!fs.existsSync(spritesDir)) {
  fs.mkdirSync(spritesDir, { recursive: true });
}

// Copy main sprite sheet to public
fs.copyFileSync(srcSpriteSheet, publicSpriteSheet);
console.log('Successfully copied sprite_sheet.png to public/sprite_sheet.png');
