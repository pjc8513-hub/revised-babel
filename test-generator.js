import seedrandom from 'seedrandom';
import fs from 'fs';
import path from 'path';

const readJson = (file) => JSON.parse(fs.readFileSync(path.join('src/data', file), 'utf8'));

const dictionaries = {
    adj: readJson('adjectives.json').map(w => w.word),
    adv: readJson('adverbs.json').map(w => w.word),
    noun: readJson('nouns.json').map(w => w.word),
    prep: readJson('prepositions.json').map(w => w.word),
    pron: readJson('pronouns.json').map(w => w.word),
    verb: readJson('verbs.json').map(w => w.word),
};

const sentenceTemplates = [
    ['pron', 'verb', 'adj', 'noun', 'prep', 'adj', 'noun'],
    ['adj', 'noun', 'verb', 'adv'],
    ['pron', 'verb', 'adv', 'prep', 'adj', 'noun'],
    ['adj', 'noun', 'verb', 'pron'],
    ['pron', 'verb', 'noun', 'prep', 'noun'],
    ['adj', 'adj', 'noun', 'verb', 'adv'],
    ['noun', 'verb', 'adj', 'noun'],
    ['pron', 'adv', 'verb', 'adj', 'noun'],
];

function generatePage(hex, wall, shelf, vol, page) {
    const seed = `${hex}-${wall}-${shelf}-${vol}-${page}`;
    const rng = seedrandom(seed);

    const getText = (type) => {
        const list = dictionaries[type];
        const index = Math.floor(rng() * list.length);
        return list[index].toLowerCase();
    };

    const capitalize = (s) => s.charAt(0).toUpperCase() + s.slice(1);

    let pageContent = [];
    const sentenceCount = 20 + Math.floor(rng() * 10);

    for (let i = 0; i < sentenceCount; i++) {
        const templateIndex = Math.floor(rng() * sentenceTemplates.length);
        const template = sentenceTemplates[templateIndex];
        let sentence = template.map(type => getText(type)).join(' ');
        pageContent.push(capitalize(sentence) + '.');
    }

    return pageContent.join(' ');
}

console.log('Testing Deterministic Generation (Node Sync Check)...');

const coords = ['0', 1, 1, 1, 1];
const firstRun = generatePage(...coords);
const secondRun = generatePage(...coords);

if (firstRun === secondRun) {
    console.log('SUCCESS: Generation is deterministic.');
    console.log('\nSample Content (Page 1):');
    console.log(firstRun.substring(0, 500) + '...');
} else {
    console.error('FAILURE: Generation is NOT deterministic.');
}

const diffCoords = ['0', 1, 1, 1, 2];
const diffRun = generatePage(...diffCoords);
if (firstRun !== diffRun) {
    console.log('\nSUCCESS: Different coordinates produce different content.');
}
