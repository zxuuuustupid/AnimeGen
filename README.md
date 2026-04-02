# AnimeGen

Upload an image, describe your idea, and AI generates a short story, 4-panel comic, and optional video.

## Features

- **Image Analysis** — AI understands your photo's content, subjects, colors, and mood
- **Story Generation** — Creates a 500-800 word narrative with beginning, development, climax, and resolution
- **Comic Generation** — Breaks the story into 4 key scenes with style-consistent panel artwork
- **Video Generation** (optional) — Animates the comic panels

## Quick Start

```bash
bun install
```

Create `.env.local`:

```env
ZHIPU_API_KEY=your_zhipu_api_key
```

```bash
bun run dev
```

Open [http://localhost:3000](http://localhost:3000)

## First Run Tips

1. Upload a `.jpg`, `.png`, or `.webp` image (under 10 MB)
2. Enter a short creative direction (e.g. "A rainy urban coming-of-age story")
3. Keep default models for the first test
4. Leave video generation disabled initially — the core pipeline is image → story → comics

## Default Models

| Task | Model |
|------|-------|
| Vision | `glm-4v-flash` |
| Text | `glm-4-flash` |
| Image | `cogview-3-flash` |
| Video | `cogvideox-flash` |

## Multi-Provider Support

Configure each task independently in the UI settings panel:

- **Zhipu AI** — default provider
- **OpenAI** — GPT-4o, DALL-E 3, etc.
- **Anthropic** — Claude models
- **Custom** — any OpenAI-compatible endpoint

For custom endpoints, enter your own base URL, model name, and API key directly in the UI.

## Project Structure

```
app/
├── api/              # Server-side API routes
│   ├── analyze/      # Vision model image analysis
│   ├── story/       # Text model story generation
│   ├── comics/      # Image model comic generation
│   └── video/       # Video model (optional)
├── page.tsx         # Main app page
└── results/[sessionId]/  # Result display page

components/
├── generation/      # Pipeline UI components
├── ui/              # Reusable UI components
└── upload/          # Image upload component

lib/ai/
├── analyze.ts       # Image analysis logic
├── client.ts        # AI provider client
├── generateStory.ts # Story generation
├── generateComics.ts# Comic generation
└── generateVideo.ts # Video generation
```

## Build & Run

```bash
bun run build
bun run start
```

## Troubleshooting

**Generation fails immediately**
→ Check your API key is valid and has quota available.

**Upload fails**
→ Ensure the file is JPG, PNG, or WEBP and under 10 MB.

**Styles look broken**
→ Run `bun run build` then `bun run start` (not just dev).

**.env.local changes not applied**
→ Restart the dev server.

## License

MIT