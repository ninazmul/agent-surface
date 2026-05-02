# AB Partner Portal

The **AB Partner Portal** is a comprehensive Agent Management System designed specifically for **Academic Bridge English School**, a leading educational institution based in Ireland. Built with modern web technologies, this portal streamlines operations for educational agents, providing a robust platform for managing leads, generating quotations, and handling various administrative workflows securely and efficiently.

## Key Features & Functions

- **Role-Based Access Control (RBAC):** Secure system access with multiple defined user roles (e.g., Administrators, Agents, Staff), ensuring appropriate data visibility, privacy, and functionality based on user permissions.
- **Lead Management System:** End-to-end tracking of prospective students (leads). Easily capture new inquiries, update statuses, add notes, and monitor the progress of student applications from the first contact to full enrollment.
- **Quotations Generation:** Automated and customizable quotation creation for tuition, accommodation, and related school services. Allows agents to quickly provide accurate cost estimates to prospective students.
- **Interactive Agent Dashboard:** A centralized interface offering agents real-time insights, analytics, and status updates on their assigned leads, conversions, and overall performance metrics.
- **Application Processing:** Streamlined submission, review, and management of student applications, integrating seamlessly with administrative workflows.
- **Document Management:** Securely upload, store, and verify essential documents (like passports, visas, and transcripts) using a reliable cloud storage solution.

## Tech Stack

This project is built using a modern stack for high performance and maintainability:

- **Framework:** [Next.js](https://nextjs.org/) (App Router)
- **Library:** [React](https://react.dev/) 19
- **Styling:** [Tailwind CSS](https://tailwindcss.com/) & [Radix UI](https://www.radix-ui.com/)
- **Authentication:** [Clerk](https://clerk.com/)
- **Database:** [Mongoose](https://mongoosejs.com/) (MongoDB)
- **File Uploads:** [UploadThing](https://uploadthing.com/)
- **Rich Text Editing:** [Tiptap](https://tiptap.dev/)
- **Data Visualization:** [Recharts](https://recharts.org/) & [Chart.js](https://www.chartjs.org/)
- **Validation:** [Zod](https://zod.dev/)

## Getting Started

### Prerequisites

- Node.js (version 18 or higher recommended)
- npm, yarn, or pnpm

### Installation

1. Clone the repository:
   ```bash
   git clone https://github.com/ninazmul/agent-surface.git
   cd agent-surface
   ```

2. Install the dependencies:
   ```bash
   npm install
   ```

3. **Environment Setup:**
   Create a `.env.local` file in the root of your project. Configure your environment variables for services like Clerk, MongoDB, UploadThing, and any others required by the project. *(Note: Specific environment variables are kept private for security purposes).*

4. Start the development server:
   ```bash
   npm run dev
   ```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

## Project Structure

- `app/`: Next.js App Router including pages, layouts, and API routes.
- `components/`: Reusable React components (UI elements, forms, layouts).
- `lib/`: Utility functions, database connection logic, and third-party service initializations.
- `hooks/`: Custom React hooks for state and lifecycle management.
- `constants/`: Global constants, navigation links, and configuration data.
- `types/`: TypeScript interfaces and type definitions.
- `public/`: Static assets like images and icons.

## Available Scripts

In the project directory, you can run:

- `npm run dev`: Runs the app in the development mode.
- `npm run build`: Builds the app for production to the `.next` folder.
- `npm run start`: Starts the production server using the build output.
- `npm run lint`: Runs ESLint to find and fix problems in your code.

## License

This project is licensed under the MIT License.
Ï
