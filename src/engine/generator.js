import seedrandom from 'seedrandom';
import adjectives from '../data/adjectives.json';
import adverbs from '../data/adverbs.json';
import nouns from '../data/nouns.json';
import prepositions from '../data/prepositions.json';
import pronouns from '../data/pronouns.json';
import verbs from '../data/verbs.json';

const dictionaries = {
    adj: adjectives.map(w => w.word),
    adv: adverbs.map(w => w.word),
    noun: nouns.map(w => w.word),
    prep: prepositions.map(w => w.word),
    pron: pronouns.map(w => w.word),
    verb: verbs.map(w => w.word),
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

/**
 * Generates a page of text deterministically based on coordinates.
 * @param {string} hex - Hexagon identifier
 * @param {number} wall - 1-4
 * @param {number} shelf - 1-5
 * @param {number} vol - 1-32
 * @param {number} page - 1-410
 * @param {boolean} isCoherent - Whether to use sentence templates or random word stream
 */
export function generatePage(hex, wall, shelf, vol, page, isCoherent = true) {
    const seed = `${hex}-${wall}-${shelf}-${vol}-${page}`;
    const rng = seedrandom(seed);

    const allWords = Object.values(dictionaries).flat();

    const getText = (type) => {
        const list = dictionaries[type] || allWords;
        const index = Math.floor(rng() * list.length);
        return list[index].toLowerCase();
    };

    const capitalize = (s) => s.charAt(0).toUpperCase() + s.slice(1);

    let pageContent = [];
    const sentenceCount = 20 + Math.floor(rng() * 10);

    for (let i = 0; i < sentenceCount; i++) {
        let sentence;
        if (isCoherent) {
            const templateIndex = Math.floor(rng() * sentenceTemplates.length);
            const template = sentenceTemplates[templateIndex];
            sentence = template.map(type => getText(type)).join(' ');
        } else {
            // Chaos mode: Random length sentences (3-12 words)
            const length = 3 + Math.floor(rng() * 10);
            const words = [];
            for (let j = 0; j < length; j++) {
                const wordIndex = Math.floor(rng() * allWords.length);
                words.push(allWords[wordIndex].toLowerCase());
            }
            sentence = words.join(' ');
        }
        pageContent.push(capitalize(sentence) + '.');
    }

    return pageContent.join(' ');
}

export function parseCoordinates(hash) {
    // Expected format: #hex-w-s-v-p
    const parts = hash.replace(/^#/, '').split('-');
    if (parts.length === 5) {
        return {
            hex: parts[0],
            wall: parseInt(parts[1]),
            shelf: parseInt(parts[2]),
            vol: parseInt(parts[3]),
            page: parseInt(parts[4]),
        };
    }
    return null;
}

export function formatCoordinates(coords) {
    return `${coords.hex}-${coords.wall}-${coords.shelf}-${coords.vol}-${coords.page}`;
}
