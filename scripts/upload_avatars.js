import fs from 'fs';
import path from 'path';
import { v2 as cloudinary } from 'cloudinary';
import { Jimp } from 'jimp';
import dotenv from 'dotenv';

// Load .env variables
dotenv.config({ path: path.resolve(process.cwd(), 'src/.env') });

// Ensure Cloudinary credentials are set
if (!process.env.CLOUDINARY_CLOUD_NAME || !process.env.CLOUDINARY_API_KEY || !process.env.CLOUDINARY_API_SECRET) {
  console.error("❌ ERROR: Cloudinary credentials missing from src/.env");
  console.error("Please add CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY, and CLOUDINARY_API_SECRET.");
  process.exit(1);
}

// Configure Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

const SPRITE_SHEET_PATH = path.resolve(process.cwd(), 'src/assets/sprite_sheet.png');
const ROWS = 16;
const COLS = 12;
const TOTAL_AVATARS = 192;
const FOLDER_NAME = 'yakitori_avatars';

async function uploadAvatars() {
  try {
    console.log(`Loading sprite sheet from: ${SPRITE_SHEET_PATH}`);
    const image = await Jimp.read(SPRITE_SHEET_PATH);
    
    const spriteWidth = Math.floor(image.bitmap.width / COLS);
    const spriteHeight = Math.floor(image.bitmap.height / ROWS);
    
    console.log(`Sprite size: ${spriteWidth}x${spriteHeight}`);
    
    const avatarUrls = [];

    // Process each sprite
    for (let i = 0; i < TOTAL_AVATARS; i++) {
      const row = Math.floor(i / COLS);
      const col = i % COLS;
      const x = col * spriteWidth;
      const y = row * spriteHeight;
      
      // Clone the original image and crop to the specific sprite
      const sprite = image.clone().crop({ x, y, w: spriteWidth, h: spriteHeight });
      
      // Convert to buffer for upload
      const buffer = await sprite.getBuffer("image/png");
      
      console.log(`Uploading avatar ${i + 1}/${TOTAL_AVATARS}...`);
      
      // Upload to Cloudinary using a Promise wrapper around the callback stream API
      const url = await new Promise((resolve, reject) => {
        const uploadStream = cloudinary.uploader.upload_stream(
          { folder: FOLDER_NAME, public_id: `avatar_${i}` },
          (error, result) => {
            if (error) reject(error);
            else resolve(result.secure_url);
          }
        );
        uploadStream.end(buffer);
      });
      
      avatarUrls.push(url);
    }

    console.log("\n✅ Successfully uploaded all 192 avatars to Cloudinary!\n");
    
    // Save the URLs to a JSON file for reference
    const outputPath = path.resolve(process.cwd(), 'scripts/cloudinary_urls.json');
    fs.writeFileSync(outputPath, JSON.stringify(avatarUrls, null, 2));
    
    console.log(`Saved URLs to: ${outputPath}`);
    
  } catch (error) {
    console.error("❌ Error processing or uploading sprites:", error);
  }
}

uploadAvatars();
