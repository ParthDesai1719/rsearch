# rSearch: AI-Powered Reasoning Engine

![rSearch](https://rsearch.app/og.png)


A cutting-edge research assistant powered by artificial intelligence that harnesses the advanced reasoning capabilities of [DeepSeek R1](https://huggingface.co/deepseek-ai/DeepSeek-R1) combined with comprehensive internet search functionality. **rSearch** delivers precise, well-reasoned responses to complex research queries by:

- Leveraging state-of-the-art language models for refining queries
- Performing intelligent web searches across multiple data sources
- Synthesizing information through sophisticated chain-of-thought reasoning processes
- Providing clear, actionable insights backed by reliable sources
- Customizable AI models from [OpenAI](https://openai.com), [OpenRouter](https://openrouter.ai) or [DeepSeek](https://deepseek.com)
- Self hosted alternative to [Perplexity](https://perplexity.ai)

## Demo

![Demo](https://github.com/Justmalhar/rsearch/raw/main/demo.png)

Try rSearch* for free here - [rsearch.app](https://rsearch.app)

## Overview

**rSearch** leverages [DeepSeek's Reasoner - R1 model](https://huggingface.co/deepseek-ai/DeepSeek-R1) to perform Chain-of-Thought reasoning on search results. The platform first refines your query, searches the internet using [Serper.dev](https://serper.dev) API, and then applies advanced reasoning to synthesize a comprehensive, well-thought-out response. Built with [Next.js](https://nextjs.org/) and [TypeScript](https://www.typescriptlang.org/), it offers a seamless research experience while maintaining high performance and code quality.

### AI Models and Reasoning

- **DeepSeek-R1**: State-of-the-art reasoning model that powers rSearch's analytical capabilities
  - Trained via large-scale reinforcement learning
  - Exceptional performance in math, code, and reasoning tasks
  - Comparable performance to [OpenAI-o1](https://openai.com)
  - Open-source availability for research and development

- **Customizable AI Models**: Added support to use any AI models from [OpenAI](https://openai.com), [OpenRouter](https://openrouter.ai) or [DeepSeek](https://deepseek.com) as your AI provider.

- **Chain-of-Thought Process**:
  1. Query Refinement: Intelligent processing of user input
  2. Internet Search: Comprehensive data gathering via [Serper.dev](https://serper.dev) API
  3. Reasoning Analysis: Deep analysis using DeepSeek's reasoning capabilities
  4. Response Synthesis: Well-structured, logical conclusions

## Key Features

- **Multiple Search Modes**: Search across diverse content categories:
  - **Web Search**: Broad and efficient web search capability
  - **Deep Research**: Advanced recursive exploration with configurable depth and breadth
    - BFS/DFS search strategies
    - Configurable depth (1-5) and breadth (1-5)
    - Real-time progress tracking
    - Automatic follow-up question generation
  - **Images**: Visual content search
  - **Videos**: Video content discovery
  - **News**: Latest headlines and articles
  - **Places**: Local information and geographical insights
  - **Shopping**: Product information and price comparisons
  - **Scholar**: Academic content and research papers
  - **Patents**: Patent database search

- **Deep Research Capabilities**:
  - **Configurable Search Parameters**: Control depth and breadth of research
  - **Search Strategies**: Choose between Breadth-First (BFS) or Depth-First (DFS) search
  - **Intermediate Analysis**: View research progress and intermediate findings
  - **Recursive Exploration**: Automatically generate and follow up on research directions
  - **Comprehensive Reports**: Generate detailed markdown reports of findings
  - **Source Tracking**: Keep track of all sources and their relationships

- **Modern UI Components**:
  - Responsive sidebar navigation
  - Mobile-optimized header
  - Dynamic search results display
  - Interactive loading states
  - Customizable themes

## Deploy

Deploying **rSearch** is simple and fast with Vercel's one-click deployment option. Vercel provides a powerful and scalable environment for your project.

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https://github.com/justmalhar/rsearch&env=SERPER_API_KEY&env=NEXT_PUBLIC_AI_PROVIDER_API_KEY&env=NEXT_PUBLIC_AI_PROVIDER_BASE_URL&env=NEXT_PUBLIC_AI_REFINER_MODEL&env=NEXT_PUBLIC_AI_REASONING_MODEL&env=NEXT_PUBLIC_LANDING_PAGE_COPY_TEXT)


## Tech Stack

- **Framework**: Next.js with App Router
- **Language**: TypeScript
- **Styling**: TailwindCSS
- **Components**: ShadCN UI components
- **State Management**: React Hooks
- **Code Quality**: ESLint

## Getting Started

### Prerequisites

- Node.js 18.x or later
- npm or yarn package manager

### Installation

1. Clone the repository:
    ```bash
    git clone https://github.com/justmalhar/rsearch.git
    cd rsearch
    ```

2. Install dependencies:
    ```bash
    npm install
    # or
    yarn install
    ```

3. Set up environment variables:
    ```bash
    cp .env.example .env.local
    ```
   
    Create a `.env.local` file in the root directory with the following variables:

   ```bash
    # Serper API Key (Google Search API) - https://serper.dev/api-key
    SERPER_API_KEY=

    # You can either use OpenAI, OpenRouter or DeepSeek as your AI provider.
    # OpenAI API Key (AI Provider) - https://platform.openai.com/api-keys
    # OpenRouter API Key (AI Provider) - https://openrouter.ai/settings/keys
    # DeepSeek API Key (AI Provider) - https://platform.deepseek.com/api_keys
    NEXT_PUBLIC_AI_PROVIDER_API_KEY=

    # AI Provider Base URL (AI Provider)
    # DeepSeek Base URL (AI Provider) - https://api.deepseek.com
    # OpenAI Base URL (AI Provider) - https://api.openai.com
    # OpenRouter Base URL (AI Provider) - https://openrouter.ai/api/v1
    NEXT_PUBLIC_AI_PROVIDER_BASE_URL=https://api.deepseek.com

    # AI Query Refiner Model (AI Provider)
    # DeepSeek Refiner Model (AI Provider) - deepseek-chat
    # OpenAI Refiner Model (AI Provider) - gpt-4o-mini
    # OpenRouter Refiner Model (AI Provider) - openai/gpt-4o-mini
    NEXT_PUBLIC_AI_REFINER_MODEL=gpt-4o-mini

    # AI Reasoning Model (AI Provider)
    # DeepSeek Reasoning Model (AI Provider) - deepseek-reasoner
    # OpenAI Reasoning Model (AI Provider) - gpt-4o
    # OpenRouter Reasoning Model (AI Provider) - openai/gpt-4o
    NEXT_PUBLIC_AI_REASONING_MODEL=gpt-4o

    # Landing Page Copy Text
    NEXT_PUBLIC_LANDING_PAGE_COPY_TEXT="AI-powered search with advanced reasoning capabilities"

    # Supabase Configuration
    NEXT_PUBLIC_SUPABASE_URL=
    NEXT_PUBLIC_SUPABASE_ANON_KEY=
    ```

5. Start the development server:
    ```bash
    npm run dev
    # or
    yarn dev
    ```

The application will be available at `http://localhost:3000`

## Development Commands

- `npm run dev`: Start development server
- `npm run build`: Create production build
- `npm run start`: Start production server
- `npm run lint`: Run ESLint for code quality checks

## Project Structure

```
rsearch/
├── app/                  # Next.js app directory
│   ├── api/             # API routes
│   ├── layout.tsx       # Root layout
│   ├── page.tsx         # Home page
│   ├── rsearch/         # Regular search page
│   └── deeprsearch/     # Deep research page
├── components/          # React components
│   ├── rSearch/        # Search-specific components
│   └── ui/             # Reusable ShadCN UI components
├── hooks/              # Custom React hooks
├── lib/                # Utility functions
├── public/             # Static assets
└── types/              # TypeScript type definitions
```

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Acknowledgments

- Built with [Next.js](https://nextjs.org/)
- Powered by [DeepSeek-R1](https://huggingface.co/deepseek-ai/DeepSeek-R1)
- Search capabilities by [Serper.dev](https://serper.dev)
- Styled with [TailwindCSS](https://tailwindcss.com/)
- Icons from various sources including custom SVGs


## Stay Connected
- **Twitter/X**: [@justmalhar](https://twitter.com/justmalhar) 🛠
- **LinkedIn**: [Malhar Ujawane](https://linkedin.com/in/justmalhar) 💻
- **GitHub**: [justmalhar](https://github.com/justmalhar) 💻
