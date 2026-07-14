# Taskflow — Premium Todo List Manager

Taskflow is a premium, modern, and highly interactive Todo List web application built using standard HTML5, Vanilla CSS, and modern Javascript. It features visual styling (glassmorphism, tailored themes, and smooth micro-animations) combined with advanced task management capabilities.

## ✨ Features

- **Modern Visual Styling**: Glassmorphic interfaces, smooth gradients, glowing card borders, and elegant layout grids.
- **Theme Customization**: Toggle between Light and Dark mode seamlessly with custom CSS variables.
- **Advanced Task Operations**:
  - Create, edit, toggle, and delete tasks.
  - Set priorities (High, Medium, Low) and custom category badges.
  - Choose optional task due dates with overdue and due today highlights.
- **Real-Time Interactive Search**: Instantly filters task titles and descriptions.
- **Multi-Conditional Filtering & Sorting**:
  - Filter by status (All, Active, Completed), custom categories, and priority levels.
  - Sort by Date Added, Due Date, or Priority weight.
- **Persistence**: Real-time sync with browser `localStorage` to keep tasks and categories saved.
- **Statistics Dashboard**: Visual progress indicators (completion percentage and progress bar) along with state counters.
- **Celebration Confetti**: Dynamic custom canvas-based confetti when all tasks are checked off.

## 🚀 Getting Started

### Prerequisites

To run Taskflow locally, you only need a modern web browser and a lightweight web server (e.g. Node's `http-server` or Python's `http.server`).

### Running Locally

1. **Clone the repository**:
   ```bash
   git clone https://github.com/RIYARAWAT05/TODO-LIST.git
   cd TODO-LIST
   ```

2. **Start a local development server**:
   Using Python 3:
   ```bash
   python3 -m http.server 8000
   ```
   
   Or using Node.js:
   ```bash
   npx http-server -p 8000
   ```

3. **Open the application**:
   Navigate to [http://localhost:8000/INDEX.HTML](http://localhost:8000/INDEX.HTML) in your browser.

## 🛠️ Built With

- **HTML5**: Semantic document tags.
- **Vanilla CSS**: CSS Custom Properties (Variables), Flexbox, CSS Grid, and custom `@keyframe` animations.
- **Modern JavaScript (ES6)**: DOM manipulation, local storage API, and state filtering.
- **Google Fonts**: Inter
- **FontAwesome Icons**: Premium vectors