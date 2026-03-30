# AI Workflow Builder

A powerful, open-source visual workflow builder for creating and managing AI-powered automation flows. Build, test, and deploy intelligent workflows without writing code.

![Next.js](https://img.shields.io/badge/Next.js-16.1.6-black?logo=next.js)
![React](https://img.shields.io/badge/React-19.2.3-61DAFB?logo=react)
![TypeScript](https://img.shields.io/badge/TypeScript-5.x-3178C6?logo=typescript)
![License](https://img.shields.io/badge/license-MIT-green)

## 🎯 Features

### Core Capabilities
- **Visual Workflow Designer** - Drag-and-drop interface for creating complex workflows
- **AI Integration** - Built-in support for AI agents, language models, and MCP (Model Context Protocol)
- **Custom Nodes** - Pre-built node types: Agent, Conditional (If/Else), HTTP, Comments, Start/End
- **Real-time Collaboration** - Live updates with Upstash Redis
- **Mobile Responsive** - Full mobile support with touch-optimized controls
- **Dark Mode** - Built-in dark/light theme switching

### Advanced Features
- **Workflow Embedding** - Generate embed codes to run workflows on external sites
- **Code Export** - Copy embed script directly from the UI
- **Version Control** - Track and manage workflow versions
- **Execution Preview** - Test workflows before deployment
- **Multi-Provider AI** - Support for OpenRouter and multiple AI providers

## 🚀 Quick Start

### Prerequisites
- Node.js 18.17+ (16.1.6 tested)
- npm/yarn/pnpm/bun
- MongoDB (with replica set for Upstash integration)
- PostgreSQL or compatible database

### Installation

1. **Clone the repository**
```bash
git clone <repository-url>
cd ai_workflow_builder
```

2. **Install dependencies**
```bash
npm install
# or
yarn install
pnpm install
bun install
```

3. **Set up environment variables**
Create a `.env.local` file in the root directory:
```bash
# Database
DATABASE_URL="mongodb_url"
DIRECT_URL="mongodb_url

# Authentication (Kinde)
KINDE_CLIENT_ID=your_kinde_client_id
KINDE_CLIENT_SECRET=your_kinde_client_secret
KINDE_ISSUER_URL=your_kinde_issuer_url
KINDE_SITE_URL=http://localhost:3000
KINDE_POST_LOGOUT_REDIRECT_URL=http://localhost:3000

# Redis/Upstash
UPSTASH_REDIS_REST_URL=your_upstash_redis_url
UPSTASH_REDIS_REST_TOKEN=your_upstash_token
QSTASH_TOKEN=your_qstash_token

# AI Providers
NEXT_PUBLIC_OPENROUTER_API_KEY=your_openrouter_key

# Application
NEXT_PUBLIC_APP_URL=http://localhost:3000
NODE_ENV=development
```

4. **Set up the database**
```bash
# Generate Prisma client
npm run prisma:generate

# Run migrations
npm run prisma:migrate

# Seed database (if available)
npm run prisma:seed
```

5. **Start development server**
```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to see the application.

## 📁 Project Structure

```
ai_workflow_builder/
├── app/
│   ├── (routes)/
│   │   ├── (dashboard)/          # Main dashboard
│   │   ├── (landing)/            # Landing page
│   │   └── workflow/
│   │       └── [id]/
│   │           ├── page.tsx       # Workflow editor page
│   │           ├── layout.tsx     # Workflow layout
│   │           └── _common/
│   │               ├── workflow-canvas.tsx     # Main editor canvas
│   │               ├── node-panel.tsx          # Node palette
│   │               ├── header.tsx              # Workflow header
│   │               └── controls.tsx            # Editor controls
│   ├── actions/
│   │   └── agent.ts              # AI agent actions
│   ├── api/
│   │   ├── auth/                 # Kinde auth routes
│   │   ├── workflow/             # Workflow API endpoints
│   │   └── upstash/              # Real-time endpoints
│   ├── globals.css               # Global styles
│   └── layout.tsx                # Root layout
│
├── components/
│   ├── ui/                       # Reusable UI components
│   │   ├── button.tsx
│   │   ├── dialog.tsx
│   │   ├── sheet.tsx
│   │   ├── sidebar.tsx
│   │   └── ... (more UI components)
│   ├── workflow/
│   │   ├── code-dialog.tsx       # Embed code dialog
│   │   ├── controls.tsx          # Workflow controls
│   │   ├── custom-nodes/         # Custom ReactFlow nodes
│   │   │   ├── agent/
│   │   │   ├── if-else/
│   │   │   ├── comment/
│   │   │   ├── start/
│   │   │   └── end/
│   │   └── chat/                 # Preview/execution panel
│   ├── landing/                  # Landing page components
│   │   ├── hero-lottie.tsx       # Animated hero section
│   │   └── navigation.tsx
│   └── ai-elements/              # AI chat components
│
├── lib/
│   ├── utils.ts                  # Common utilities
│   ├── prisma.ts                 # Prisma client
│   ├── encryption.ts             # Data encryption
│   ├── real-time.ts              # Real-time utilities
│   ├── openrouter.ts             # OpenRouter integration
│   └── workflow/
│       ├── constants.tsx          # Workflow constants
│       ├── node-config.ts         # Node configuration
│       ├── execute-workflow.ts    # Workflow executor
│       ├── transport.ts           # Data transport
│       └── custom-executor/       # Custom execution engines
│
├── prisma/
│   └── schema.prisma             # Database schema
│
├── types/
│   └── workflow.ts               # TypeScript types
│
├── hooks/
│   ├── use-workflow.ts           # Workflow hook
│   ├── use-mobile.ts             # Mobile detection
│   └── ... (more custom hooks)
│
├── store/
│   └── workflow-store.ts         # Zustand store
│
├── context/
│   ├── workflow-context.tsx      # Workflow React context
│   └── query-provider.tsx        # React Query provider
│
├── public/
│   ├── embed/
│   │   ├── embed.js              # Client embed script
│   │   └── embed.min.js          # Minified embed script
│   └── ai-tab-icon.svg           # App favicon
│
└── package.json
```

## 🏗️ Architecture

### Tech Stack

**Frontend:**
- **Framework**: Next.js 16.1.6 (React 19.2.3)
- **Language**: TypeScript
- **Styling**: Tailwind CSS + CSS Modules
- **Flow Editor**: @xyflow/react 12.10.1 (ReactFlow)
- **UI Components**: Radix UI
- **State Management**: React Context + Zustand
- **Data Fetching**: TanStack React Query

**Backend:**
- **Runtime**: Node.js
- **API**: Next.js API Routes
- **Database**: PostgreSQL + Prisma ORM
- **Authentication**: Kinde Auth
- **Real-time**: Upstash Redis + WebSockets

**AI & Automation:**
- **AI Providers**: OpenRouter, Multiple LLM support
- **Protocol**: Model Context Protocol (MCP)
- **Workflow Execution**: Custom executor with node-specific handlers
- **Task Scheduling**: Upstash QStash

### Key Components

#### WorkflowCanvas
Main editor component managing ReactFlow canvas, node selection, and deletion.

**Features:**
- Drag-and-drop node creation
- Touch-optimized mobile controls
- Selection-based node operations
- Real-time workflow state sync

#### NodePanel
Palette for adding nodes to the workflow. Responsive design with tap-to-add on mobile.

**Node Types:**
- **Agent**: Execute AI operations
- **If/Else**: Conditional branching
- **HTTP**: Make API calls
- **Comment**: Documentation nodes
- **Start/End**: Flow boundaries

#### WorkflowProvider (Context)
Manages global workflow state including nodes, edges, and view mode (edit/preview).

#### Controls
Bottom toolbar with zoom, pan mode, and node deletion controls.

## 📱 Mobile Responsiveness

The application includes comprehensive mobile support:
- **Responsive Node Panel**: Bottom-positioned, full-width on mobile
- **Touch Controls**: Tap-to-add nodes, no drag requirements
- **Simplified Controls**: Delete button on mobile, tree menu hidden
- **View Switching**: Edit/Preview tabs with mobile-optimized sheet
- **Dark Mode Toggle**: Accessible on landing page and dashboard

### Mobile Breakpoint
- **Mobile**: < 768px (md breakpoint)
- **Desktop**: ≥ 768px

## 🔄 Workflow Execution

### Execution Flow
1. **Validation**: Check workflow structure and node configurations
2. **Execution**: Process nodes sequentially/conditionally
3. **Error Handling**: Capture and report failures
4. **Results**: Store execution history and outputs

### Node Execution
Each node type has a custom executor that handles:
- Input validation
- Processing logic
- Output transformation
- Error handling

## 🔐 Authentication & Security

### Authentication
- **Provider**: Kinde Auth
- **Flow**: OAuth 2.0
- **Sessions**: Secure session management

### Security Features
- **Encryption**: Data encryption for sensitive fields
- **CORS**: Configured API protection
- **Validation**: Input sanitization and validation
- **Rate Limiting**: Upstash-based rate limiting

## 🎨 UI/UX Features

### Theme System
- **Dark Mode**: Full dark mode support with next-themes
- **Responsive Design**: Mobile-first approach
- **Accessibility**: WCAG 2.1 compliance

### Components
- Custom button variants (primary, secondary, destructive, ghost)
- Modal dialogs and sheets
- Dropdown menus
- Form components with validation
- Loading states and skeletons

## 📡 Real-time Features

### Upstash Integration
- **Redis**: Real-time state synchronization
- **QStash**: Async workflow execution
- **Realtime**: WebSocket support for live updates

## 🚀 Development

### Running Development Server
```bash
npm run dev
```

### Building for Production
```bash
npm run build
npm run start
```

### Code Quality
```bash
npm run lint           # Run ESLint
npm run format         # Format code
npm run type-check     # TypeScript type checking
```

### Database Management
```bash
npx prisma studio     # Open Prisma Studio
npx prisma migrate dev --name migration_name
npx prisma generate
```

## 🔌 API Endpoints

### Workflow APIs
- `GET /api/workflow` - List workflows
- `GET /api/workflow/[id]` - Get specific workflow
- `POST /api/workflow` - Create workflow
- `PUT /api/workflow/[id]` - Update workflow
- `DELETE /api/workflow/[id]` - Delete workflow

### Auth APIs
- `POST /api/auth/[kindeAuth]` - Kinde OAuth
- `GET /api/auth/logout` - Logout

### Real-time APIs
- `POST /api/upstash/webhook` - Upstash event webhooks
- `POST /api/upstash/execute` - Execute workflow

## 📦 Embedding Workflows

### Generate Embed Code
1. Navigate to workflow editor
2. Click "Code" button in header
3. Copy the generated script tag

### Embed on External Site
```html
<script src="http://localhost:3000/embed/embed.js" data-workflow-id="workflow_id"></script>
```

The embed script creates an iframe-based chat interface for workflow interaction.

## 🐛 Troubleshooting

### Common Issues

**Module not found errors (lottie-react)**
- Solution: Use `lottie-web` with dynamic imports instead
- Implementation in `components/landing/hero-lottie.tsx`

**Hydration mismatch in theme toggle**
- Solution: Use mount-safe pattern with `useState` + `useEffect`
- Example in `app/(routes)/(dashboard)/_common/header.tsx`

**Mobile node panel not filling screen**
- Solution: Use `inset-x-2` instead of `left-2 right-2`
- Use `absolute` positioning instead of Panel component
- Avoid `100vw` which causes horizontal overflow

**Selection state infinite loop**
- Solution: Wrap `onSelectionChange` with `useCallback`
- Example in `workflow-canvas.tsx`

## 🌐 Environment Setup

### MongoDB Replica Set (Optional)
For development with real-time features:
```bash
node setup-mongodb-replica.js
```

### Prisma Setup
```bash
npm run prisma:generate
npm run prisma:migrate
```

## 📝 License

MIT License - See LICENSE file for details

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit changes (`git commit -m 'Add amazing feature'`)
4. Push to branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

### Coding Standards
- TypeScript for type safety
- ESLint for code quality
- Prettier for formatting
- Test coverage for new features

## 📚 Documentation

- [Next.js Docs](https://nextjs.org/docs)
- [React Documentation](https://react.dev)
- [ReactFlow Documentation](https://xyflow.com)
- [Prisma Documentation](https://www.prisma.io/docs)
- [Kinde Documentation](https://kinde.com/docs)
- [Upstash Documentation](https://upstash.com/docs)

## 🎯 Roadmap

### Planned Features
- [ ] Workflow templates library
- [ ] Advanced scheduling options
- [ ] Workflow versioning and rollback
- [ ] Team collaboration features
- [ ] Audit logging
- [ ] Performance analytics
- [ ] Custom node marketplace
- [ ] Visual debugging tools

## 📞 Support

For issues and feature requests, please open an issue on GitHub or contact support.

---

**Built with ❤️ by the AI Workflow Builder team**
