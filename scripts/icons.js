const isEmpty = require('lodash/isEmpty');
const sharp = require('sharp');
const path = require('path');

const { PROJECT_DIR } = require('./config');

const resizeTargets = [16, 32, 48, 128];

async function createIconImages(filepath) {
  if (isEmpty(process.argv[2])) {
    throw new Error('file path is mandatory (e.g. npm run icons -- original.png)');
  }

  const pathInfo = path.parse(filepath);

  await Promise.all(resizeTargets.map(async (width) => {
    const outputPath = path.join(pathInfo.dir, `${pathInfo.name}_${width}${pathInfo.ext}`);

    await sharp(filepath)
      .resize(width)
      .toFile(outputPath)
      .then(() => (
        console.info('-', outputPath, 'created')
      ));
  }));
}

async function main() {
  if (isEmpty(process.argv[2])) {
    throw new Error('file path is mandatory (e.g. npm run icons -- original.png)');
  }

  const originalPath = path.join(PROJECT_DIR, process.argv[2]);
  console.info('Start creating icon images...');
  console.info('Original file path:', originalPath);

  await createIconImages(originalPath);

  console.info('Done!');
}

main();
