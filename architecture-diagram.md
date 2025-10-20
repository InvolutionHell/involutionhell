# InvolutionHell Architecture Diagram

```mermaid
graph TB
    subgraph "Client Layer"
        Browser[Web Browser]
        Mobile[Mobile Browser]
    end

    subgraph "Frontend Application"
        subgraph "Next.js App Router"
            HomePage[Home Page<br/>app/page.tsx]
            DocsPages[Documentation Pages<br/>app/docs/[...slug]/page.tsx]

            subgraph "UI Components"
                Header[Header Component]
                Hero[Hero Section]
                Features[Features Section]
                Community[Community Section]
                Footer[Footer Component]
                DocsAssistant[AI Assistant Modal]
                GiscusComments[Comments System]
            end

            subgraph "Layouts"
                RootLayout[Root Layout<br/>- Theme Provider<br/>- Root Provider<br/>- Global Styles]
                DocsLayout[Docs Layout<br/>- Sidebar Navigation<br/>- Page Tree]
            end
        end

        subgraph "Client Features"
            ThemeToggle[Theme Toggle<br/>Dark/Light Mode]
            UserMenu[User Menu<br/>Sign In/Out]
            Search[Search<br/>Orama Integration]
            AIChat[AI Chat Interface<br/>Assistant UI]
        end
    end

    subgraph "API Layer"
        subgraph "API Routes"
            AuthAPI[/api/auth/[...nextauth]<br/>NextAuth Handler]
            ChatAPI[/api/chat<br/>AI Chat Endpoint]
            DocsTreeAPI[/api/docs-tree<br/>Documentation Structure]
        end
    end

    subgraph "Backend Services"
        subgraph "Authentication"
            NextAuth[NextAuth.js<br/>- GitHub OAuth<br/>- Session Management]
            AuthConfig[Auth Configuration<br/>- JWT/Database Strategy]
        end

        subgraph "AI Integration"
            OpenAI[OpenAI SDK<br/>GPT Models]
            Gemini[Google Gemini<br/>Generative AI]
            AISDKCore[Vercel AI SDK<br/>Stream Processing]
        end

        subgraph "Content Management"
            Fumadocs[Fumadocs MDX<br/>- MDX Processing<br/>- Page Tree Generation]
            ContentSources[Content Sources<br/>app/docs/**/*.mdx]
        end
    end

    subgraph "Data Layer"
        subgraph "Database"
            Neon[(Neon PostgreSQL<br/>- User Data<br/>- Sessions<br/>- Auth Tokens)]
            Prisma[Prisma ORM<br/>Schema Management]
        end

        subgraph "Static Content"
            MDXFiles[MDX Files<br/>Documentation Content]
            Assets[Assets<br/>Images & Resources]
        end
    end

    subgraph "External Services"
        GitHub[GitHub<br/>- OAuth Provider<br/>- Version Control]
        Giscus[Giscus<br/>Comments via GitHub Discussions]
        Vercel[Vercel<br/>- Deployment<br/>- Analytics]
    end

    subgraph "Build & Development"
        NextBuild[Next.js Build<br/>- Static Generation<br/>- API Routes]
        Scripts[Scripts<br/>- Image Migration<br/>- Content Validation]
        Husky[Husky & Lint-staged<br/>Pre-commit Hooks]
    end

    %% Client connections
    Browser --> HomePage
    Browser --> DocsPages
    Mobile --> HomePage
    Mobile --> DocsPages

    %% Page connections
    HomePage --> Header
    HomePage --> Hero
    HomePage --> Features
    HomePage --> Community
    HomePage --> Footer

    DocsPages --> DocsLayout
    DocsPages --> DocsAssistant
    DocsPages --> GiscusComments

    %% Layout connections
    RootLayout --> ThemeToggle
    DocsLayout --> Search
    DocsLayout --> UserMenu

    %% API connections
    UserMenu --> AuthAPI
    DocsAssistant --> ChatAPI
    DocsLayout --> DocsTreeAPI
    AIChat --> ChatAPI

    %% Backend connections
    AuthAPI --> NextAuth
    NextAuth --> AuthConfig
    NextAuth --> Neon
    AuthConfig --> GitHub

    ChatAPI --> OpenAI
    ChatAPI --> Gemini
    ChatAPI --> AISDKCore

    DocsTreeAPI --> Fumadocs
    Fumadocs --> ContentSources
    Fumadocs --> MDXFiles

    %% Database connections
    NextAuth --> Prisma
    Prisma --> Neon

    %% External connections
    GiscusComments --> Giscus
    NextBuild --> Vercel

    %% Build connections
    MDXFiles --> NextBuild
    Assets --> Scripts
    Scripts --> Husky

    classDef frontend fill:#e1f5fe,stroke:#01579b,stroke-width:2px
    classDef api fill:#fff3e0,stroke:#e65100,stroke-width:2px
    classDef backend fill:#f3e5f5,stroke:#4a148c,stroke-width:2px
    classDef data fill:#e8f5e9,stroke:#1b5e20,stroke-width:2px
    classDef external fill:#fce4ec,stroke:#880e4f,stroke-width:2px
    classDef build fill:#f5f5f5,stroke:#424242,stroke-width:2px

    class Browser,Mobile,HomePage,DocsPages,Header,Hero,Features,Community,Footer,DocsAssistant,GiscusComments,RootLayout,DocsLayout,ThemeToggle,UserMenu,Search,AIChat frontend
    class AuthAPI,ChatAPI,DocsTreeAPI api
    class NextAuth,AuthConfig,OpenAI,Gemini,AISDKCore,Fumadocs,ContentSources backend
    class Neon,Prisma,MDXFiles,Assets data
    class GitHub,Giscus,Vercel external
    class NextBuild,Scripts,Husky build
```

## Architecture Overview

### 1. **Client Layer**

- Web and mobile browsers access the application

### 2. **Frontend Application (Next.js 15)**

- **App Router**: Modern Next.js routing with server components
- **Home Page**: Landing page with Hero, Features, Community sections
- **Documentation Pages**: Dynamic MDX-based documentation with [...slug] routing
- **UI Components**: Reusable components built with Fumadocs UI and custom components
- **Client Features**: Theme switching, user authentication, search, and AI chat

### 3. **API Layer**

- **Authentication**: NextAuth.js endpoints for OAuth flow
- **Chat API**: AI-powered chat endpoint supporting OpenAI and Gemini
- **Docs Tree API**: Provides documentation structure for navigation

### 4. **Backend Services**

- **Authentication**: NextAuth with GitHub OAuth, supports both JWT and database sessions
- **AI Integration**: Multiple AI providers (OpenAI, Google Gemini) via Vercel AI SDK
- **Content Management**: Fumadocs MDX for processing documentation

### 5. **Data Layer**

- **Database**: Neon PostgreSQL for user data, managed via Prisma ORM
- **Static Content**: MDX files and assets stored in the repository

### 6. **External Services**

- **GitHub**: OAuth provider and version control
- **Giscus**: Comment system using GitHub Discussions
- **Vercel**: Deployment platform with analytics

### 7. **Build & Development**

- **Next.js Build**: Static site generation and API route compilation
- **Scripts**: Custom scripts for image management and content validation
- **Git Hooks**: Husky with lint-staged for code quality

## Key Features

1. **Multi-language Support**: Internationalization with next-intl
2. **AI Assistant**: Context-aware documentation assistant
3. **Theme Support**: Dark/light mode with system preference detection
4. **Search**: Fast client-side search with Orama
5. **Math Support**: KaTeX for mathematical expressions
6. **Image Optimization**: Automatic image migration and organization
7. **Comments**: GitHub-based discussion system
