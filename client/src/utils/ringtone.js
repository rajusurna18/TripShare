// Ringtone player using Web Audio API dual-frequency synthesizer
// Generates pleasant, non-intrusive repeating call ringtone
class RingtonePlayer {
  constructor() {
    this.audioContext = null;
    this.isPlaying = false;
    this.intervalId = null;
  }

  start() {
    if (this.isPlaying) return;
    try {
      const AudioCtx = window.AudioContext || window.webkitAudioContext;
      if (!AudioCtx) return;

      this.audioContext = new AudioCtx();
      if (this.audioContext.state === "suspended") {
        this.audioContext.resume().catch(() => {});
      }

      this.isPlaying = true;

      const playPulse = () => {
        if (!this.isPlaying || !this.audioContext) return;
        try {
          const now = this.audioContext.currentTime;

          const osc1 = this.audioContext.createOscillator();
          const osc2 = this.audioContext.createOscillator();
          const gainNode = this.audioContext.createGain();

          osc1.type = "sine";
          osc2.type = "sine";
          osc1.frequency.setValueAtTime(440, now);
          osc2.frequency.setValueAtTime(480, now);

          // Envelope: Fade in 0.08s, sustain to 1.6s, fade out 0.3s
          gainNode.gain.setValueAtTime(0.001, now);
          gainNode.gain.exponentialRampToValueAtTime(0.2, now + 0.08);
          gainNode.gain.setValueAtTime(0.2, now + 1.6);
          gainNode.gain.exponentialRampToValueAtTime(0.001, now + 1.9);

          osc1.connect(gainNode);
          osc2.connect(gainNode);
          gainNode.connect(this.audioContext.destination);

          osc1.start(now);
          osc2.start(now);
          osc1.stop(now + 1.9);
          osc2.stop(now + 1.9);
        } catch (e) {
          console.warn("[Ringtone] Pulse audio playback warning:", e);
        }
      };

      playPulse();

      this.intervalId = setInterval(() => {
        if (this.isPlaying) {
          playPulse();
        }
      }, 2600);
    } catch (err) {
      console.warn("[Ringtone] Autoplay or WebAudio initialization error:", err);
    }
  }

  stop() {
    this.isPlaying = false;
    if (this.intervalId) {
      clearInterval(this.intervalId);
      this.intervalId = null;
    }
    if (this.audioContext) {
      try {
        this.audioContext.close().catch(() => {});
      } catch (e) {
        // ignore
      }
      this.audioContext = null;
    }
  }
}

export const ringtonePlayer = new RingtonePlayer();
