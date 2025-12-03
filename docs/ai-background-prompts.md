# AI Background Image Generation Prompts

Use these prompts to generate beautiful anime/manga style backgrounds for the homepage hero section.

## Light Theme Background

**Prompt:**
```
Anime style digital art, beautiful ethereal landscape background, soft pastel colors, light blue and purple gradient sky with fluffy white clouds, floating geometric shapes and particles, minimalist modern aesthetic, clean and spacious, dreamy atmosphere, high quality, 4K resolution, wide aspect ratio 16:9, suitable for website hero section, no text, no characters, abstract tech-inspired elements, subtle AI and technology motifs
```

**Alternative Light Theme Prompt:**
```
Manga-inspired background, soft watercolor style, light theme, pastel purple and blue gradient, floating abstract shapes, minimalist design, clean white space, dreamy clouds, subtle tech elements, wide landscape format, 1920x1080, website hero background, peaceful and modern aesthetic
```

## Dark Theme Background

**Prompt:**
```
Anime style digital art, dark ethereal landscape background, deep purple and indigo gradient sky with stars and nebula, glowing particles and geometric shapes, cyberpunk aesthetic, minimalist modern design, mysterious atmosphere, high quality, 4K resolution, wide aspect ratio 16:9, suitable for website hero section, no text, no characters, abstract tech-inspired elements, subtle AI and technology motifs, dark mode friendly
```

**Alternative Dark Theme Prompt:**
```
Manga-inspired background, dark watercolor style, dark theme, deep purple and navy gradient, glowing abstract shapes, minimalist design, starry night sky, subtle tech elements, wide landscape format, 1920x1080, website hero background, mysterious and modern aesthetic, neon accents
```

## Image Specifications

- **Dimensions:** 1920x1080 pixels (16:9 aspect ratio)
- **Format:** PNG or SVG (preferably SVG for scalability)
- **File Names:**
  - Light theme: `hero-bg-light.svg` or `hero-bg-light.png`
  - Dark theme: `hero-bg-dark.svg` or `hero-bg-dark.png`
- **Location:** Save to `/public/` directory

## Recommended AI Tools

- **Midjourney** - Excellent for anime/manga style
- **DALL-E 3** - Good for detailed prompts
- **Stable Diffusion** - Free and customizable
- **Leonardo.ai** - Great anime style presets

## Usage

Once you generate the images:

1. Save them to `/public/hero-bg-light.svg` and `/public/hero-bg-dark.svg`
2. Uncomment the background image section in `app/page.tsx` (lines with the img tags)
3. The images will automatically show based on the theme

## Current Implementation

The homepage currently uses:
- Animated floating orbs (AnimatedBackground component)
- Particle network animation (ParticlesBackground component)
- Gradient backgrounds

You can use these animations alone or combine them with the AI-generated backgrounds for an even more stunning effect!

