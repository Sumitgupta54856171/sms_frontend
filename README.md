# School Management ERP Frontend

React 19 + TypeScript + Vite frontend for a school management ERP system. The application uses Redux Toolkit for authentication and UI state, TanStack Query for server state, Axios for API requests, Tailwind CSS, shadcn/ui, and Lucide icons.

The ERP covers student and teacher management, class rosters, attendance, fee collection, invoices, academic sessions, timetables, homework, notices, reports, payroll, progress cards, marksheets, admit cards, ID cards, messaging, and settings.

## Requirements

- Node.js 18 or newer
- npm
- A running school ERP backend
- A browser or agent host that exposes WebMCP through `document.modelContext`

## Setup

```bash
npm install
```

Create `.env` in the project root:

```env
VITE_BACKEND_URL=http://localhost:8080
```

The Vite development proxy forwards `/api` and `/uploads` requests to the backend configured in `vite.config.ts`.

## Commands

```bash
npm run dev       # Start the Vite development server
npm run build     # Type-check and create a production build
npm run lint      # Run Oxlint
npm run preview   # Preview the production build
```

The default development URL is `http://localhost:5173/`. If that port is already in use:

```bash
npm run dev -- --host 0.0.0.0 --port 5174
```

## Application Structure

- `src/App.tsx` - React Router configuration and protected route layout
- `src/pages/` - Page-level screens
- `src/components/` - Reusable UI and workflow components
- `src/api/client.ts` - Shared Axios client, authentication, loading, toasts, and 401 handling
- `src/api/` - Typed domain API wrappers
- `src/store/` - Redux Toolkit store and slices
- `src/pages/Dashboardpage/Dashboard.tsx` - Authenticated dashboard and WebMCP registrations

### Authentication and routing

`AuthProvider` restores the logged-in session. Non-login routes are wrapped by `ProtectedRoute`, and the dashboard is mounted at `/` inside `SchoolSidebar`:

```text
/login                   public login page
/                       protected dashboard
/students                protected student management
/attendance              protected attendance workflow
/fees                    protected fee workflow
/class/:classNo/students protected class roster
```

The Axios client reads the token from `localStorage`, attaches `Authorization: Bearer <token>`, and redirects to `/login` after a 401 response.

## WebMCP Integration

WebMCP is registered only from the authenticated dashboard. The integration checks for `document.modelContext`, discovers existing tools with `getTools()`, and avoids duplicate registration during React development reloads.

```js
document.modelContext.getTools()
document.modelContext.executeTool(registeredTool, JSON.stringify(input))
```

A normal browser without a WebMCP-capable host will not expose `document.modelContext`; the dashboard logs a warning and continues normally.

### Registered tools

| Tool | Purpose | Main workflow |
| --- | --- | --- |
| `search_student_records` | Find a student by name, roll number, scholar number, or email | `fetchStudents()` |
| `check_pending_fees` | List students in a class with a positive fee balance | Class roster + `fetchStudentFeeDetails()` |
| `mark_attendance` | Mark a student present, absent, or holiday for today | `POST /api/v1/attendance/save` |
| `get_class_summary` | Return enrollment and average attendance for the last 30 days | Class roster + attendance date range |
| `get_class_students` | Return a class roster | Fee class roster API |
| `generate_invoice` | Create a fee collection invoice | `POST /api/v1/fee/student/fees/collection/invoice` |
| `add_student` | Create a student using the student form fields | `POST /api/v1/students/save` |

All tools use the existing API wrappers, so the shared Axios client supplies authentication and backend error handling.

### Tool contracts

- `search_student_records` accepts `search_query` and returns the first matching student's name, class, roll number, attendance for today, and status.
- `check_pending_fees` accepts `class_query` and returns students whose `totaldue` is greater than zero.
- `mark_attendance` accepts `student_query` and an optional `status` (`present`, `absent`, or `holiday`). It writes today's attendance through the batch-save endpoint.
- `get_class_summary` accepts `class_query` and calculates enrollment plus attendance across the last 30 days.
- `get_class_students` accepts `class_query` and returns the class roster.
- `generate_invoice` accepts `student_query`, `amount`, and optional payment/session fields, then creates an invoice.
- `add_student` accepts the student form fields and validates required values before creating a student.

Class inputs such as `Class 3`, `Grade 3`, and `3` are normalized to the backend's `Grade 3` format where applicable.

### Example agent commands

```text
"Class 3 mein kiski fees pending hai batao"
"Sumit ki aaj ki attendance mark kar do"
"Grade 3 ka total enrollment aur average attendance kya hai?"
```

Write tools require care:

- `mark_attendance` changes attendance for the current date.
- `generate_invoice` creates a real fee invoice.
- `add_student` creates a real student record.

The `add_student` tool validates the required student form data before sending it. Required values include name, email, class, roll number, scholar number, SSSMID, Aadhaar, gender, category, date of birth, phone, parent names, and total fees. Optional values include APAAR ID, PEN ID, address, and status.

## Chrome DevTools Testing

Log in and open the protected dashboard first. Use a fresh tool list for every test:

```js
const modelContext = document.modelContext;

if (!modelContext) {
  throw new Error("WebMCP is not available. Open the authenticated dashboard first.");
}

const tools = await modelContext.getTools();
console.table(tools.map((tool) => ({ name: tool.name })));
```

Helper for executing any registered tool:

```js
const runTool = async (name, input) => {
  const tool = (await document.modelContext.getTools()).find(
    (item) => item.name === name
  );

  if (!tool) throw new Error(`${name} is not registered`);
  return document.modelContext.executeTool(tool, JSON.stringify(input));
};
```

Read-only tests:

```js
console.log(await runTool("search_student_records", { search_query: "Sumit" }));
console.log(await runTool("check_pending_fees", { class_query: "Class 3" }));
console.log(await runTool("get_class_summary", { class_query: "Grade 3" }));
console.log(await runTool("get_class_students", { class_query: "Class 3" }));
```

Attendance test:

```js
console.log(await runTool("mark_attendance", {
  student_query: "Sumit",
  status: "present"
}));
```

Invoice test. This creates a real backend invoice:

```js
console.log(await runTool("generate_invoice", {
  student_query: "Sumit",
  amount: 1,
  payment_method: "cash",
  payment_type: "Tuition Fee",
  session_id: 1,
  remarks: "WebMCP test invoice"
}));
```

Student creation test. Use unique values because this creates a real student:

```js
console.log(await runTool("add_student", {
  name: "WebMCP Student",
  email: "webmcp.student@example.com",
  class_no: "3",
  roll_no: "2001",
  scholar_no: "WEBMCP-2001",
  sssmid: "987654321",
  aadhaar: "987654321098",
  gender: "male",
  category: "general",
  dob: "2012-05-10",
  phone: "8888888888",
  father_name: "WebMCP Father",
  mother_name: "WebMCP Mother",
  total_fees: "15000",
  status: "active"
}));
```

If Chrome reports an old endpoint or missing tool, hard-refresh the page and run `getTools()` again. A request to `PUT /api/v1/attendance/{id}/{status}/{date}` belongs to an old bundle; the current WebMCP attendance workflow uses `POST /api/v1/attendance/save`.

## API Conventions

Domain modules in `src/api/` should call the shared `apiClient` rather than raw `fetch`. This preserves the bearer token, `withCredentials`, loading indicators, toast behavior, and automatic 401 logout. Add new backend operations to the relevant domain module before consuming them from a page or WebMCP tool.


