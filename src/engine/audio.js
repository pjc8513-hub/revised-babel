/**
 * AudioEngine - Handles text-to-music translation using Web Audio API
 */
class AudioEngine {
    constructor() {
        this.ctx = null;
        this.masterGain = null;
        this.osc = null;
        this.isPlaying = false;
        this.currentIndex = 0;
        this.text = "";
        this.timeoutId = null;
        this.onProgress = null;

        // Settings
        this.mood = 'classic';
        this.speed = 0.5; // 0 to 1
        this.volume = 0.5;

        // Pentatonic scales (frequencies in Hz)
        // C4, D4, E4, G4, A4, C5, D5...
        this.scales = {
            classic: [261.63, 293.66, 329.63, 392.00, 440.00, 523.25, 587.33, 659.25, 783.99, 880.00],
            dark: [130.81, 155.56, 174.61, 196.00, 233.08, 261.63, 311.13, 349.23, 392.00, 466.16], // Cm Pentatonic lower octaves
            ambient: [523.25, 587.33, 659.25, 783.99, 880.00, 1046.50, 1174.66, 1318.51, 1567.98, 1760.00], // High C Major Pentatonic
            fantasy: [329.63, 369.99, 415.30, 493.88, 554.37, 659.25, 739.99, 830.61, 987.77, 1108.73], // E Major Pentatonic
        };
    }

    init() {
        if (!this.ctx) {
            this.ctx = new (window.AudioContext || window.webkitAudioContext)();
            this.masterGain = this.ctx.createGain();
            this.masterGain.connect(this.ctx.destination);
            this.masterGain.gain.value = this.volume * 0.2; // Keep it soft
        }
    }

    setSettings({ mood, speed, volume }) {
        if (mood) this.mood = mood;
        if (speed !== undefined) this.speed = speed;
        if (volume !== undefined) {
            this.volume = volume;
            if (this.masterGain) {
                this.masterGain.gain.setTargetAtTime(this.volume * 0.2, this.ctx.currentTime, 0.1);
            }
        }
    }

    play(text, onProgress) {
        this.init();
        if (this.ctx.state === 'suspended') {
            this.ctx.resume();
        }

        this.text = text;
        this.onProgress = onProgress;
        this.isPlaying = true;
        this.currentIndex = 0;
        this.playNextNote();
    }

    pause() {
        this.isPlaying = false;
        if (this.timeoutId) {
            clearTimeout(this.timeoutId);
            this.timeoutId = null;
        }
        if (this.onProgress) this.onProgress(-1);
    }

    playNextNote() {
        if (!this.isPlaying || this.currentIndex >= this.text.length) {
            if (this.currentIndex >= this.text.length) {
                this.currentIndex = 0; // Loop
                if (this.onProgress) this.onProgress(0);
                this.playNextNote();
            }
            return;
        }

        if (this.onProgress) this.onProgress(this.currentIndex);

        const char = this.text[this.currentIndex];
        const charCode = char.charCodeAt(0);

        // Map char code to index in scale
        const scale = this.scales[this.mood] || this.scales.classic;
        const noteIndex = charCode % scale.length;
        const freq = scale[noteIndex];

        // Skip spaces and unknown characters slightly differently?
        // Let's just play a note for everything except whitespace which adds a gap
        if (/\s/.test(char)) {
            const delay = (1.1 - this.speed) * 400;
            this.currentIndex++;
            this.timeoutId = setTimeout(() => this.playNextNote(), delay);
            return;
        }

        this.triggerNote(freq);

        this.currentIndex++;
        const delay = (1.1 - this.speed) * 200;
        this.timeoutId = setTimeout(() => this.playNextNote(), delay);
    }

    triggerNote(freq) {
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();

        // Waveform based on mood
        switch (this.mood) {
            case 'dark': osc.type = 'sawtooth'; break;
            case 'ambient': osc.type = 'sine'; break;
            case 'fantasy': osc.type = 'triangle'; break;
            default: osc.type = 'sine';
        }

        osc.frequency.setValueAtTime(freq, this.ctx.currentTime);

        gain.gain.setValueAtTime(0, this.ctx.currentTime);
        gain.gain.linearRampToValueAtTime(0.5, this.ctx.currentTime + 0.05);
        gain.gain.exponentialRampToValueAtTime(0.01, this.ctx.currentTime + 0.5);

        osc.connect(gain);
        gain.connect(this.masterGain);

        osc.start();
        osc.stop(this.ctx.currentTime + 0.6);
    }
}

export default new AudioEngine();
