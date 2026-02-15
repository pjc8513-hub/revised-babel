import React, { useState, useEffect, useCallback } from 'react';
import { generatePage, parseCoordinates, formatCoordinates } from './engine/generator';
import { ChevronLeft, ChevronRight, Share2, Shuffle, Search } from 'lucide-react';

const INITIAL_COORDS = {
    hex: '0',
    wall: 1,
    shelf: 1,
    vol: 1,
    page: 1
};

function App() {
    const [coords, setCoords] = useState(INITIAL_COORDS);
    const [content, setContent] = useState('');
    const [isCopied, setIsCopied] = useState(false);

    // Sync state from URL hash on mount and hash change
    useEffect(() => {
        const handleHashChange = () => {
            const parsed = parseCoordinates(window.location.hash);
            if (parsed) {
                setCoords(parsed);
            } else {
                // If hash is invalid or missing, set initial and update hash
                setCoords(INITIAL_COORDS);
                window.location.hash = formatCoordinates(INITIAL_COORDS);
            }
        };

        handleHashChange();
        window.addEventListener('hashchange', handleHashChange);
        return () => window.removeEventListener('hashchange', handleHashChange);
    }, []);

    // Update content when coords change
    useEffect(() => {
        const { hex, wall, shelf, vol, page } = coords;
        const text = generatePage(hex, wall, shelf, vol, page);
        setContent(text);
        // Update hash to match current coords
        const newHash = formatCoordinates(coords);
        if (window.location.hash !== '#' + newHash) {
            window.location.hash = newHash;
        }
    }, [coords]);

    const handleInputChange = (field, value) => {
        let newValue = value;
        if (field !== 'hex') {
            newValue = parseInt(value) || 1;
            // Clamp values
            if (field === 'wall') newValue = Math.max(1, Math.min(4, newValue));
            if (field === 'shelf') newValue = Math.max(1, Math.min(5, newValue));
            if (field === 'vol') newValue = Math.max(1, Math.min(32, newValue));
            if (field === 'page') newValue = Math.max(1, Math.min(410, newValue));
        }
        setCoords(prev => ({ ...prev, [field]: newValue }));
    };

    const navigatePage = (delta) => {
        setCoords(prev => {
            let newPage = prev.page + delta;
            if (newPage > 410) return { ...prev, page: 1, vol: Math.min(32, prev.vol + 1) };
            if (newPage < 1) return { ...prev, page: 410, vol: Math.max(1, prev.vol - 1) };
            return { ...prev, page: newPage };
        });
    };

    const randomize = () => {
        const newCoords = {
            hex: Math.floor(Math.random() * 1000000000000000).toString(36),
            wall: Math.floor(Math.random() * 4) + 1,
            shelf: Math.floor(Math.random() * 5) + 1,
            vol: Math.floor(Math.random() * 32) + 1,
            page: Math.floor(Math.random() * 410) + 1,
        };
        setCoords(newCoords);
    };

    const copyLink = () => {
        navigator.clipboard.writeText(window.location.href);
        setIsCopied(true);
        setTimeout(() => setIsCopied(false), 2000);
    };

    return (
        <div className="app-container">
            <header className="header">
                <h1>The Revised Library of Babel</h1>
                <p>A Wing of Infinite Coherence</p>
            </header>

            <nav className="navigation-panel">
                <div className="nav-group">
                    <label>Hexagon</label>
                    <input
                        className="nav-input hex"
                        value={coords.hex}
                        onChange={(e) => handleInputChange('hex', e.target.value)}
                    />
                </div>
                <div className="nav-group">
                    <label>Wall</label>
                    <input
                        type="number"
                        className="nav-input"
                        value={coords.wall}
                        onChange={(e) => handleInputChange('wall', e.target.value)}
                    />
                </div>
                <div className="nav-group">
                    <label>Shelf</label>
                    <input
                        type="number"
                        className="nav-input"
                        value={coords.shelf}
                        onChange={(e) => handleInputChange('shelf', e.target.value)}
                    />
                </div>
                <div className="nav-group">
                    <label>Volume</label>
                    <input
                        type="number"
                        className="nav-input"
                        value={coords.vol}
                        onChange={(e) => handleInputChange('vol', e.target.value)}
                    />
                </div>
                <div className="nav-group">
                    <label>Page</label>
                    <input
                        type="number"
                        className="nav-input"
                        value={coords.page}
                        onChange={(e) => handleInputChange('page', e.target.value)}
                    />
                </div>
            </nav>

            <div className="action-bar">
                <button onClick={() => navigatePage(-1)} title="Previous Page">
                    <ChevronLeft size={20} />
                </button>
                <button className="secondary" onClick={randomize} title="Random Page">
                    <Shuffle size={20} style={{ marginRight: '8px' }} /> Random
                </button>
                <button className="secondary" onClick={copyLink}>
                    <Share2 size={20} style={{ marginRight: '8px' }} />
                    {isCopied ? 'Link Copied!' : 'Share'}
                </button>
                <button onClick={() => navigatePage(1)} title="Next Page">
                    <ChevronRight size={20} />
                </button>
            </div>

            <main className="page-container">
                <div className="page">
                    <div className="page-text">
                        {content}
                    </div>
                    <div className="page-number">
                        Page {coords.page}
                    </div>
                </div>
            </main>

            <footer className="footer">
                "I have just written the term 'infinite coherence'. I have not written it out of a rhetorical habit; I say that it is not illogical to think that the world is infinite."
            </footer>
        </div>
    );
}

export default App;
