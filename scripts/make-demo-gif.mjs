import { execFileSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';

// Optional presentation artifact. Requires FFmpeg on PATH; no external media.
const desktop = fileURLToPath(new URL('../docs/screenshots/home-desktop.png', import.meta.url));
const mobile = fileURLToPath(new URL('../docs/screenshots/home-mobile.png', import.meta.url));
const output = fileURLToPath(new URL('../docs/responsive-demo.gif', import.meta.url));
execFileSync('ffmpeg', [
  '-y', '-loglevel', 'error',
  '-loop', '1', '-t', '2', '-i', desktop,
  '-loop', '1', '-t', '2', '-i', mobile,
  '-filter_complex', '[0:v]fps=4,scale=960:640:force_original_aspect_ratio=decrease,pad=960:640:(ow-iw)/2:(oh-ih)/2:color=0x101820,setsar=1[a];[1:v]fps=4,scale=960:640:force_original_aspect_ratio=decrease,pad=960:640:(ow-iw)/2:(oh-ih)/2:color=0x101820,setsar=1[b];[a][b]concat=n=2:v=1:a=0,split[x][y];[x]palettegen=max_colors=128[p];[y][p]paletteuse=dither=bayer',
  '-loop', '0', output,
], { stdio: 'inherit' });
console.log('Generated docs/responsive-demo.gif from synthetic local screenshots.');
