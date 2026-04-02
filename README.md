# AnimeGen

AnimeGen is a Next.js app that turns a single image into an anime-style creative pipeline:

- image analysis
- short story generation
- 4-panel comic generation
- optional video generation

The default setup uses Zhipu AI, and the UI also supports OpenAI, Anthropic, or a custom OpenAI-compatible endpoint.

## Stack

- Next.js 16
- React 19
- TypeScript
- Tailwind CSS 4

## Quick Start

### 1. Install dependencies

```bash
bun install
```

### 2. Create `.env.local`

```env
ZHIPU_API_KEY=your_zhipu_api_key
```

Optional:

```env
OPENAI_API_KEY=your_openai_api_key
ANTHROPIC_API_KEY=your_anthropic_api_key
```

### 3. Run the app

```bash
bun run dev
```

Open `http://localhost:3000`.

## First Successful Run

For the easiest first run:

1. Add `ZHIPU_API_KEY`
2. Start the dev server
3. Upload a `.jpg`, `.png`, or `.webp` image under 10 MB
4. Enter a short idea
5. Keep the default models
6. Leave video generation off for the first test

## Default Models

- Vision: `glm-4v-flash`
- Text: `glm-4-flash`
- Image: `cogview-3-flash`
- Video: `cogvideox-flash`

## Supported Providers

- Zhipu AI
- OpenAI
- Anthropic
- Custom provider

## Project Structure

```text
app/            Next.js pages and API routes
components/     UI and generation flow
lib/ai/         AI client and generation logic
public/uploads/ Uploaded images
public/generated/ Generated comics and videos
```

## Build

```bash
bun run build
bun run start
```

## Troubleshooting

- If generation fails immediately, check your API key and model/provider selection.
- If upload fails, make sure the file is JPG, PNG, or WEBP and under 10 MB.
- If `.env.local` changes do not apply, restart the dev server.

## License

MIT
