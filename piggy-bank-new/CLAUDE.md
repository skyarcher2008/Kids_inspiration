# Piggy Bank (猪猪银行) Project Overview

## Project Type
React TypeScript Progressive Web App (PWA) - Task management application with achievement system

## Tech Stack
- **Frontend**: React 18 with TypeScript
- **Styling**: Tailwind CSS
- **State Management**: Zustand
- **Build Tool**: Create React App (CRA)
- **PWA**: Service Worker enabled
- **Database**: Supabase (currently disabled for local development)

## Project Structure
```
src/
├── components/        # Reusable React components
│   ├── AchievementBadges.tsx    # Achievement display
│   ├── CelebrationAnimation.tsx # Task completion animations
│   ├── DailyReport.tsx          # Daily statistics
│   ├── TaskManager.tsx          # Task CRUD operations
│   ├── TodayStats.tsx           # Today's statistics
│   ├── TodayTasks.tsx           # Today's task list
│   └── WeeklyChart.tsx          # Weekly progress chart
├── pages/            # Page components
│   └── HomePage.tsx  # Main page with all sections
├── stores/           # Zustand state management
│   └── useStore.ts   # Global state store
└── libs/             # External service integrations
    └── *.backup      # Supabase files (temporarily disabled)
```

## Key Features
1. **Task Management**: Create, complete, and delete daily tasks
2. **Achievement System**: Unlock achievements based on task completion
3. **Statistics**: Daily and weekly progress tracking
4. **PWA**: Installable app with offline capabilities
5. **Animations**: Celebration effects for task completion

## Development Commands
```bash
# Install dependencies
npm install

# Start development server
npm start

# Build for production
npm run build

# Run tests
npm test

# Type checking
npm run typecheck

# Linting
npm run lint
```

## Current Development Status
- Supabase integration is temporarily disabled (backup files exist)
- Focus on local development without backend
- Recent features: Component modularization, task deletion, achievement unlocking

## Important Notes
- The app uses local storage for data persistence
- Chinese language is used in the UI
- Achievement badges use emoji icons
- The app has a piggy bank theme with savings/task completion metaphor

## Git Information
- Main branch: `main`
- Recent work includes homepage component refactoring and task management features