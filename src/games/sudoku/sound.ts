// Soft chimes from plain sine waves: no audio files. Each digit gets a note on
// a pentatonic scale, so any run of placements sounds consonant.
const SCALE = [0, 392, 440, 523.25, 587.33, 659.25, 783.99, 880, 1046.5, 1174.66];

let ctx: AudioContext | null = null;

function tone(freq: number, delay = 0, length = 0.9, volume = 0.05) {
    ctx ??= new AudioContext();
    const t = ctx.currentTime + delay;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = "sine";
    osc.frequency.value = freq;
    gain.gain.setValueAtTime(0, t);
    gain.gain.linearRampToValueAtTime(volume, t + 0.015);
    gain.gain.exponentialRampToValueAtTime(0.0001, t + length);
    osc.connect(gain).connect(ctx.destination);
    osc.start(t);
    osc.stop(t + length);
}

export const chime = {
    place: (d: number) => tone(SCALE[d], 0, 0.6, 0.035),
    unit: () => [5, 7, 9].forEach((d, i) => tone(SCALE[d], i * 0.09)),
    solve: () => [1, 3, 5, 7, 9, 8].forEach((d, i) => tone(SCALE[d] * (i === 5 ? 2 : 1), i * 0.14, 1.8, 0.04)),
};
