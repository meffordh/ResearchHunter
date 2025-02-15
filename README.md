
# ResearchHunter

ResearchHunter is an intelligent web-based research platform designed to simplify complex information gathering through advanced AI-powered authentication and data retrieval mechanisms. The application focuses on robust, scalable OAuth integration with comprehensive error handling and social platform connectivity.

## Features

- AI-powered research assistance using OpenAI o3-mini
- Clerk authentication and user management
- Real-time research progress tracking via WebSocket
- Persistent storage with PostgreSQL
- Comprehensive error handling and logging
- TypeScript/Node.js backend with Express
- React frontend with shadcn/ui components
- WebSocket for real-time communication
- Firecrawl integration for web crawling

## Research Process
```mermaid
graph TD
    A[User Input] --> B[Clarifying Questions]
    B --> C[Research Parameters]
    C --> D[Initial Query Processing]
    D --> E{Depth Level Loop}
    E --> F[Query Expansion]
    F --> G[Web Crawling]
    G --> H[Content Analysis]
    H --> I[Knowledge Extraction]
    I --> J{More Depth?}
    J -->|Yes| E
    J -->|No| K[Report Generation]
    K --> L[Source Citation]
    L --> M[Final Report]
```

## Prerequisites

- Node.js 20.x or higher
- PostgreSQL database
- Clerk account
- OpenAI API key
- Firecrawl API key

## Environment Variables

```bash
# Database Configuration
DATABASE_URL=postgresql://user:password@host:port/database
PGHOST=your_pg_host
PGPORT=your_pg_port
PGUSER=your_pg_user
PGPASSWORD=your_pg_password
PGDATABASE=your_pg_database

# API Keys
OPENAI_API_KEY=your_openai_api_key
FIRECRAWL_API_KEY=your_firecrawl_api_key
CLERK_PUBLISHABLE_KEY=your_clerk_publishable_key
CLERK_SECRET_KEY=your_clerk_secret_key
```

## Setup Instructions

1. Clone the repository:
```bash
git clone https://github.com/yourusername/research-hunter.git
cd research-hunter
```

2. Install dependencies:
```bash
npm install
```

3. Set up environment variables:
   - Create a `.env` file in the root directory
   - Add all required environment variables as shown above

4. Start the development server:
```bash
npm run dev
```

## Project Structure

```
├── client/                # Frontend React application
│   ├── src/
│   │   ├── components/   # Reusable UI components
│   │   ├── hooks/        # Custom React hooks
│   │   ├── lib/          # Utility functions
│   │   └── pages/        # Page components
├── server/               # Backend Express application
│   ├── auth.ts          # Authentication setup
│   ├── deep-research.ts # Research logic
│   ├── routes.ts        # API routes
│   └── storage.ts       # Database interface
└── shared/              # Shared types and schemas
```
