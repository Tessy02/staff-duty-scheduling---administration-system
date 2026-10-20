# Staff Duty Scheduling & Administration System

This contains everything you need to run the app locally.

## Technologies, Syntax, and Usage

- **TypeScript** defines the application's data models and helps validate staff,
  administrator, and duty schedule data. For example:

  ```ts
  interface StaffMember {
    id: string;
    fullName: string;
    skills: string[];
  }
  ```

- **React with TSX** builds the interface from reusable components. React state
  tracks application data and the selected view; TSX combines markup with
  JavaScript expressions:

  ```tsx
  const [activeTab, setActiveTab] = useState<'staff' | 'scheduler'>('scheduler');

  return (
    <main>
      {activeTab === 'staff' && <StaffManagement />}
      {activeTab === 'scheduler' && <DutyScheduler />}
    </main>
  );
  ```

- **Tailwind CSS and CSS** style the interface. Utility classes are applied
  directly in TSX, while the CSS entry point imports Tailwind and defines
  global and print styles:

  ```tsx
  <div className="min-h-screen bg-slate-100 text-slate-800">
    ...
  </div>
  ```

- **Browser `localStorage` with JSON** saves administrator details, staff, and
  duty schedules between page visits. Data is serialized when saved and parsed
  when loaded:

  ```ts
  localStorage.setItem('duty_staff_database_v1', JSON.stringify(staff));
  const savedStaff = JSON.parse(
    localStorage.getItem('duty_staff_database_v1') ?? '[]',
  );
  ```

- **Vite** runs the local development server and builds the application for
  production. The React and Tailwind Vite plugins provide the corresponding
  development and styling support.

## Run Locally

**Prerequisites:**  Node.js


1. Install dependencies:
   `npm install`
2. Run the app:
   `npm run dev`

Other useful commands:

- `npm run lint` checks TypeScript types without producing output files.
- `npm run build` creates a production build.
- `npm run preview` serves the production build locally.
