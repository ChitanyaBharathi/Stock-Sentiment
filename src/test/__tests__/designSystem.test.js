import { describe, it, expect } from 'vitest';
import tailwindConfig from '../../../tailwind.config.js';

describe('Design System & Palette Integrity Checks', () => {
  it('enforces required typography font families', () => {
    const fonts = tailwindConfig.theme.extend.fontFamily;
    expect(fonts.sans).toContain('Inter');
    expect(fonts.serif).toContain('"DM Serif Display"');
    expect(fonts.mono).toContain('"JetBrains Mono"');
  });

  it('enforces Midnight Obsidian dark theme color definitions', () => {
    const colors = tailwindConfig.theme.extend.colors;
    expect(colors.obsidian).toBe('#08080a');
    expect(colors.onyx).toBe('#040406');
    expect(colors.carbon).toBe('#121317');
    expect(colors.graphite).toBe('#1c1d22');
  });
});
