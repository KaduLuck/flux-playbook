# Flux Business - Business Management System

Flux Business is a comprehensive business management system designed to help entrepreneurs organize, track, and gamify their physical and digital services. It provides a structured yet engaging way to manage workflows using Kanban and node-based visualizations.

## Features

- Task management via Kanban board
- Visual node-based workflow mapping
- Gamification with XP points, levels, and achievements
- Service type categorization (physical, digital, hybrid)
- Progress tracking, deadlines, checklists, and estimated values

## Technology Stack

- **Frontend**: React 18, TypeScript, Vite
- **UI Library**: shadcn-ui, Tailwind CSS
- **State Management**: TanStack Query (React Query)
- **Backend**: Supabase (Authentication, PostgreSQL database)
- **Deployment**: GitHub Pages

## Getting Started

### Prerequisites

- Node.js (version 16 or higher)
- npm or yarn

### Installation

```bash
# Clone the repository
git clone <repository-url>

# Navigate to the project directory
cd flux-playbook-main

# Install dependencies
npm install
```

### Development

```bash
# Start the development server
npm run dev
```

### Building for Production

```bash
# Create a production build
npm run build
```

## Deployment to GitHub Pages

This project is configured to deploy to GitHub Pages using GitHub Actions.

1. Create a new repository on GitHub
2. Push your code to the repository:
   ```bash
   git remote add origin https://github.com/your-username/your-repo-name.git
   git branch -M main
   git push -u origin main
   ```
3. On GitHub, go to Settings > Pages
4. Under "Source", select "GitHub Actions"
5. The deployment workflow will automatically run and deploy your site

The site will be available at `https://your-username.github.io/your-repo-name/`

## Project Structure

```
src/
├── components/          # React components
│   ├── ui/              # Reusable UI components (shadcn-ui)
│   ├── AuthPage.tsx     # Authentication page
│   ├── Dashboard.tsx    # Main dashboard layout
│   ├── GameStats.tsx    # Gamification statistics
│   ├── KanbanBoard.tsx  # Kanban board component
│   ├── NodeFlow.tsx     # Node-based workflow visualization
│   └── TaskDialog.tsx   # Task creation/editing dialog
├── hooks/               # Custom React hooks
├── integrations/        # External service integrations
│   └── supabase/        # Supabase client and types
├── lib/                 # Utility functions
├── pages/               # Page components
├── types/               # TypeScript type definitions
└── App.tsx              # Main application component
```

## Environment Variables

Create a `.env` file in the root directory with your Supabase credentials:

```
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
```

## Contributing

1. Fork the repository
2. Create a feature branch
3. Commit your changes
4. Push to the branch
5. Create a pull request

## License

This project is licensed under the MIT License.