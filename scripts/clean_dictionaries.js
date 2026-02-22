const fs = require('fs');
const path = require('path');

const dataDir = path.join(__dirname, '..', 'src', 'data');
const files = fs.readdirSync(dataDir).filter(f => f.endsWith('.json'));

const allowedCharsRegex = /[^A-Z\s.,]/g;

files.forEach(file => {
    const filePath = path.join(dataDir, file);
    console.log(`Processing ${file}...`);

    try {
        const data = JSON.parse(fs.readFileSync(filePath, 'utf8'));

        const cleanedData = data.map(entry => {
            // 1. Keep only the first entry if multiple spellings exist (separated by ;)
            let word = entry.word.split(';')[0].trim();

            // 2. Remove any characters that are not letters, spaces, periods, or commas
            // (The rules say only letters, spaces, periods, and commas are allowed)
            // Note: Library of Babel usually uses lowercase, but these dictionaries are uppercase.
            // I'll keep them uppercase for now as the generator.js handles lowercase conversion.
            word = word.replace(allowedCharsRegex, '');

            return {
                ...entry,
                word: word
            };
        });

        fs.writeFileSync(filePath, JSON.stringify(cleanedData, null, 4), 'utf8');
        console.log(`Finished ${file}.`);
    } catch (err) {
        console.error(`Error processing ${file}:`, err);
    }
});
