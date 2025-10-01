const fs = require('fs');
const path = require('path');

/**
 * Script to copy existing parallax images to the new frame naming convention
 * Run this script to convert your existing images to frame1.jpg, frame2.jpg, etc.
 */

const sourceDir = path.join(__dirname, '../public/images');
const targetDir = path.join(__dirname, '../public/frames');

// Ensure target directory exists
if (!fs.existsSync(targetDir)) {
  fs.mkdirSync(targetDir, { recursive: true });
}

// Get all parallax test images and sort them
const files = fs.readdirSync(sourceDir)
  .filter(file => file.startsWith('parallax test') && file.endsWith('.jpg'))
  .sort((a, b) => {
    // Extract numbers from filenames for proper sorting
    const numA = parseInt(a.match(/\d+/)[0]);
    const numB = parseInt(b.match(/\d+/)[0]);
    return numA - numB;
  });

console.log(`Found ${files.length} images to copy:`);

files.forEach((file, index) => {
  const sourcePath = path.join(sourceDir, file);
  const targetPath = path.join(targetDir, `frame${index + 1}.jpg`);
  
  try {
    fs.copyFileSync(sourcePath, targetPath);
    console.log(`✓ Copied ${file} → frame${index + 1}.jpg`);
  } catch (error) {
    console.error(`✗ Failed to copy ${file}:`, error.message);
  }
});

console.log(`\nCopy complete! Your frames are now available at /public/frames/frame1.jpg to frame${files.length}.jpg`);
console.log(`You can now use the new ScrollImageSequenceCanvas component with these frames.`);
