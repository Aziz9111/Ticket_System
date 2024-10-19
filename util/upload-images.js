const path = require("path");

function convertWindowsPathToUrl(imagePath) {
    // Replace backslashes with forward slashes for URL
    const relativePath = imagePath.replace(/\\/g, '/');
    
    // Extract just the filename (or use relative path if needed)
    const fileName = path.basename(relativePath);

    // Return the web-accessible URL pointing to the static folder
    return `/images/${fileName}`;
}

module.exports = {convertWindowsPathToUrl: convertWindowsPathToUrl};