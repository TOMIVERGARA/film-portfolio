# Analog Portfolio - TVergara

A unique, interactive photography portfolio designed to showcase analog film rolls. Built with Next.js and Konva, it features a 3D-like infinite canvas interface that allows users to explore photos in an organic, immersive way.

**Live Demo:** [portfolio.fotovault.com](https://portfolio.fotovault.com)

![Main Portfolio Interface](https://github.com/TOMIVERGARA/film-portfolio/blob/main/public/canvas_shot.png?raw=true)

## About & Motivation

I'm a film photography enthusiast and Systems Engineering student from Córdoba, Argentina.

This project was born from the desire to combine my passion for programming and design with analog photography. It serves as a personal archive to showcase and remember my photos, while also providing a challenging playground to learn and reinforce my full-stack development skills.

## Features

- **Interactive Infinite Canvas:** A custom-built canvas using `react-konva` and `d3-force` that arranges photos in a 3D spiral layout.
- **Roll-based Organization:** Photos are grouped by film rolls, mimicking the physical medium.
- **Admin Dashboard:** A comprehensive admin panel to manage rolls, upload photos (Cloudinary integration), and monitor site performance.
- **Custom Analytics:** Built-in analytics system to track user interactions, session duration, and device metrics without third-party cookies.
- **Responsive Design:** Optimized for both desktop and mobile experiences.

![Admin Dashboard](https://github.com/TOMIVERGARA/film-portfolio/blob/main/public/adminpanel_shot.png?raw=true)

## Tech Stack

- **Framework:** [Next.js 15](https://nextjs.org/) (App Router)
- **Language:** TypeScript
- **Styling:** Tailwind CSS
- **Canvas/Graphics:** [Konva](https://konvajs.org/) & [React Konva](https://konvajs.org/docs/react/index.html)
- **Physics/Layout:** [D3.js](https://d3js.org/)
- **Database:** PostgreSQL (via [Neon](https://neon.tech/))
- **Image CDN:** Cloudinary
- **Admin Authentication:** Custom JWT-based auth

## Getting Started

### Prerequisites

- Node.js (v18+ recommended)
- PostgreSQL database
- Cloudinary account

### Installation

1. Clone the repository:

   ```bash
   git clone https://github.com/TOMIVERGARA/film-portfolio.git
   cd film-portfolio
   ```

2. Install dependencies:

   ```bash
   npm install
   ```

3. Set up environment variables:
   Create a `.env.local` file in the root directory and add the following:

   ```env
   DATABASE_URL=your_postgres_connection_string
   CLOUDINARY_CLOUD_NAME=your_cloud_name
   CLOUDINARY_API_KEY=your_api_key
   CLOUDINARY_API_SECRET=your_api_secret
   JWT_SECRET=your_jwt_secret
   ADMIN_PASSWORD=your_admin_password
   NEXT_PUBLIC_BASE_URL=http://localhost:3000
   ```

4. Initialize the database:
   Run the schema migration script (you might need to run the SQL in `db/schema.sql` manually or via a tool).

5. Create an admin user:

   ```bash
   npm run init-admin
   ```

6. Run the development server:
   ```bash
   npm run dev
   ```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

## Scripts

- `npm run dev`: Runs the development server.
- `npm run build`: Builds the application for production.
- `npm run start`: Starts the production server.
- `npm run lint`: Runs ESLint.
- `npm run init-admin`: Script to create the initial admin user.

## License

[MIT](LICENSE)
