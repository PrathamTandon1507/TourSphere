const fs = require('fs');
const path = require('path');
const dotenv = require('dotenv');

const projectRoot = path.resolve(__dirname, '../..');
const candidateFiles = ['.env.local', '.env', 'config.env'];

let loadedCount = 0;

candidateFiles.forEach((fileName) => {
  const envPath = path.join(projectRoot, fileName);
  if (fs.existsSync(envPath)) {
    dotenv.config({ path: envPath });
    loadedCount += 1;
  }
});

if (!loadedCount) {
  // Keep this visible so env setup issues are easy to diagnose.
  console.warn(
    `No environment file found. Expected one of: ${candidateFiles.join(', ')}`,
  );
}

module.exports = {
  projectRoot,
  loadedCount,
};
