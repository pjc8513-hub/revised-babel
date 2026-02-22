const fs = require('fs');
const path = require('path');

const dataDir = path.join(__dirname, '..', 'src', 'data');
const files = fs.readdirSync(dataDir).filter(f => f.endsWith('.json'));

const allowedCharsRegex = /^[A-Z\s.,]*$/;

console.log('--- Verifying Dictionaries ---');
files.forEach(file => {
    const filePath = path.join(dataDir, file);
    const data = JSON.parse(fs.readFileSync(filePath, 'utf8'));

    let issues = 0;
    data.forEach((entry, index) => {
        if (entry.word.includes(';')) {
            console.error(`Issue in ${file} at entry ${index}: semi-colon found in "${entry.word}"`);
            issues++;
        }
        if (!allowedCharsRegex.test(entry.word)) {
            console.error(`Issue in ${file} at entry ${index}: forbidden characters found in "${entry.word}"`);
            issues++;
        }
    });

    if (issues === 0) {
        console.log(`${file}: OK`);
    } else {
        console.error(`${file}: ${issues} issues found.`);
    }
});

console.log('\n--- Verifying Generator (Manual check) ---');
console.log('Since generator.js uses ES modules, please verify in the browser or check the code logic.');
console.log('Regex applied in generator.js: /[^a-zA-Z\\s.,]/g');
