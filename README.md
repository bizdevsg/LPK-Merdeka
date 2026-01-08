# LPK Merdeka

LPK Merdeka is a website platform for Job Training Institutions (LPK) designed to provide information regarding training programs, activity galleries, testimonials, and support. This website is built using modern web technologies to ensure fast performance and a responsive interface.

## 🚀 Key Features

- **Home & Information Page**: Presents key information about LPK Merdeka.
- **Training Programs**: A complete list of available training programs.
- **Gallery**: Documentation of training activities and events.
- **Testimonials**: Reviews from alumni and training participants.
- **Help & Support**: A help center for user inquiries.
- **User Dashboard**: A dedicated area for registered users.
- **Authentication**: Login and registration system (Auth).
- **Responsive Design**: Optimized display for various devices (Desktop, Tablet, Mobile).

## 🛠 Technologies Used

This project is built using the following *tech stack*:

- **[Next.js](https://nextjs.org/)**: React framework for production (using Pages Router).
- **[React](https://react.dev/)**: JavaScript library for building user interfaces.
- **[TypeScript](https://www.typescriptlang.org/)**: A JavaScript superset that adds static typing.
- **[Tailwind CSS](https://tailwindcss.com/)**: A utility-first CSS framework for rapid styling.
- **[Framer Motion](https://www.framer.com/motion/)**: Library for smooth and interactive animations.
- **Icons**: Uses `lucide-react`, `react-icons`, and `@fortawesome` for a comprehensive icon collection.

## 📂 Project Structure

The source code for this project is organized using the **Atomic Design** approach within the `src/components` folder:

```bash
src/
├── components/
│   ├── atoms/       # Smallest components (Button, Input, Icon, etc.)
│   ├── molecules/   # Combinations of atoms (FormGroup, Card, etc.)
│   ├── organisms/   # Combinations of molecules (Navbar, Footer, Section, etc.)
│   └── template/    # Main page layouts
├── pages/           # Next.js page routing
│   ├── api/         # API Routes
│   ├── auth/        # Login/Register pages
│   ├── dashboard.tsx # Dashboard page
│   └── ...          # Other pages (about, program, etc.)
├── styles/          # Global style configuration
└── context/         # React Context for global state management
```

## 📦 How to Run the Project

Follow these steps to run the project on your local machine:

1.  **Clone the repository** (if you haven't already):
    ```bash
    git clone https://github.com/ahqsa24/lpk-merdeka.git
    cd lpk-merdeka
    ```

2.  **Install dependencies**:
    ```bash
    npm install
    # or
    yarn install
    # or
    pnpm install
    # or
    bun install
    ```

3.  **Run the development server**:
    ```bash
    npm run dev
    ```

4.  **Open in browser**:
    Open [http://localhost:3000](http://localhost:3000) to see the result.

## 📜 Available Scripts

- `npm run dev`: Runs the development server.
- `npm run build`: Builds the application for production.
- `npm run start`: Runs the production server after building.
- `npm run lint`: Runs the linter to check the code.

---
Developed by the LPK Merdeka IT Team.
