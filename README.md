# Sugar Wise

Sugar Wise is a diabetes care and health-management platform that connects patients, doctors, and administrators in one application. Patients can organize their health information, doctors can keep track of their connected patients, and administrators can manage the platform's users and store.

> **Medical notice:** Sugar Wise supports health tracking and education. It does not replace professional medical advice, diagnosis, or treatment.

## Tech Stack

![React](https://img.shields.io/badge/React-19-61DAFB?logo=react&logoColor=white)
![Node.js](https://img.shields.io/badge/Node.js-22-339933?logo=nodedotjs&logoColor=white)
![Express](https://img.shields.io/badge/Express-5-000000?logo=express&logoColor=white)
![MongoDB](https://img.shields.io/badge/MongoDB-Mongoose-47A248?logo=mongodb&logoColor=white)
![JavaScript](https://img.shields.io/badge/JavaScript-ES6%2B-F7DF1E?logo=javascript&logoColor=black)
![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-3-06B6D4?logo=tailwindcss&logoColor=white)

GitHub's **Languages** chart reports source-code languages detected in the repository. It does not list frameworks, runtimes, or databases such as React, Node.js, or MongoDB; those technologies are shown here instead.

## People and Features

### Patient

The patient area brings personal health tools together in one place. Patients can:

- Maintain a health profile and record diabetes readings, including dates, times, and insulin details.
- Review their readings through charts and summaries, helping them follow changes over time and share useful context with their doctor.
- Keep lab reports organized, including images and PDF files, with notes and result status.
- Find doctors, manage doctor connections, and access clinic and appointment features.
- View dietary information, notifications, messages, and store orders.

These features help patients keep their health information organized and make it easier to discuss their history with a healthcare professional.

### Doctor

The doctor area helps doctors manage their professional presence and care for their connected patients. Doctors can:

- Maintain their doctor profile and submit professional details for verification.
- Manage clinic information, such as its address, opening hours, phone number, and location.
- Add and review connected patients.
- See useful patient context, including recent glucose readings, recorded insulin details, and lab-report activity.
- Communicate with patients and manage notifications and appointment-related workflows.

This gives doctors a consolidated view of patient activity and clinic information without replacing clinical judgment.

### Administrator

The administrator area provides tools for operating and maintaining the platform. Depending on permissions, administrators can:

- Review user accounts and manage platform users.
- Add, edit, and remove products in the medical store.
- Review sales activity and order trends.
- Configure insulin types and dosage units used by the application.
- Review doctor credentials and manage verification.
- Create and manage promotional codes.

### Shop

The shop is the in-app marketplace for health products and monitoring tools. Users can browse products, search by name, filter by category and price, view product details, and add items to their cart. The shopping flow includes quantity management, promotional-code support, checkout, payment, and order history. If a user chooses an item before signing in, the application can continue that pending shopping action after login.

### Lab Tests Page

The **Lab Tests** page is a personal organizer for lab reports, rather than an automated medical-testing or diagnosis feature. Patients can create a report entry with a title, date, notes, and a result status, then attach an image or PDF. Image reports can be previewed in the page, and attached files can be opened for review. Existing entries can be edited or deleted.

Its key benefit is keeping report files and their context together with the patient's other health information, making records easier to review and discuss with a doctor. Result status is recorded as information; the page does not interpret results or provide a diagnosis.

## Application Structure

```text
Sugar Wise/
├── Client/                         # React web application
│   ├── public/                     # Static web assets
│   └── src/
│       ├── Components/             # Shared layout and access components
│       ├── context/                # Authentication, theme, and shared state
│       ├── hooks/                  # Reusable data and feature logic
│       ├── locales/                # Arabic, English, French, German, Spanish, Turkish
│       ├── pages/
│       │   ├── Admin/              # Administration and management screens
│       │   ├── Doctor/             # Doctor, clinic, and patient screens
│       │   ├── Patient/            # Patient health and care screens
│       │   ├── Shop/               # Product browsing and shopping screens
│       │   └── ...                 # Education, account, and information pages
│       ├── services/               # Frontend communication services
│       └── utils/                  # Shared helpers and data transformations
└── server/                         # Node.js application
    ├── config/                     # Database connection
    ├── controllers/                # Request and feature handlers
    ├── middleware/                 # Authentication, access, and error handling
    ├── models/                     # MongoDB document definitions
    ├── public/                     # Static images and uploaded files
    ├── routes/                     # Feature and mobile route definitions
    ├── services/                   # Business and resource-specific services
    ├── InsertData/                 # Optional data insertion scripts
    └── utils/                      # File storage and shared helpers
```

## How the Application Fits Together

```text
Browser
  └── React frontend
        ├── Pages and shared components
        ├── Context providers and hooks
        └── Frontend services
                 │
                 ▼
          Node.js + Express
            ├── Routes and middleware
            ├── Controllers
            ├── Services
            └── Mongoose models
                 │
                 ▼
              MongoDB
```

- **Frontend:** Renders the application, navigation, account-specific screens, forms, charts, and shopping experience.
- **Backend:** Applies application rules, authentication and role-based access, and coordinates work between the interface and stored data.
- **Database:** MongoDB stores application records through Mongoose models, including accounts, health information, doctor-patient connections, messages, products, and orders.
- **Files:** The server stores and serves application images and uploaded report files.
- **Background work:** Backend services periodically clean up notifications and manage message retention. The frontend also provides periodic reminders to signed-in patients.
- **Languages and accessibility:** The interface includes six languages and adjusts text direction for Arabic.

## Runtime and Libraries

### Runtime

- **Node.js** runs the backend application.
- **npm** manages the frontend and backend packages.
- GitHub Actions uses **Node.js 22** for automated project checks.

### Frontend Libraries

- **React, React DOM, and Create React App (`react-scripts`)** — user interface and frontend application runtime.
- **React Router DOM** — page navigation.
- **Axios** — communication between the frontend and backend.
- **Tailwind CSS, PostCSS, and Autoprefixer** — styling.
- **i18next, react-i18next, and i18next-browser-languagedetector** — translations and language selection.
- **ApexCharts, Recharts, Victory, and their React integrations** — charts and data visualization.
- **Leaflet, React Leaflet, and `@react-google-maps/api`** — map and location features.
- **Stripe React SDKs** — payment interface integration.
- **Framer Motion and AOS** — animation effects.
- **Lucide React** — interface icons.
- **html2canvas, jsPDF, and jsPDF AutoTable** — document and report exports.
- **Testing Library packages and `web-vitals`** — frontend testing utilities and performance metrics.

### Backend Libraries

- **Express** — web application framework.
- **Mongoose** — MongoDB object modeling.
- **jsonwebtoken** — signed-token authentication.
- **bcryptjs** — password hashing.
- **cors** — cross-origin request handling.
- **dotenv** — loading local process configuration.
- **Nodemailer** — email delivery.
- **Nodemon** — backend development reload utility.

## Continuous Integration

GitHub Actions runs the project checks on every push and pull request:

- Installs frontend dependencies and creates a production build.
- Installs backend dependencies and checks the JavaScript syntax of backend source files.

The workflow uses Node.js 22. It does not run unit tests: the backend test command is a placeholder, and the existing frontend test still contains the default Create React App starter assertion.

## Additional Notes

- Sugar Wise is designed to support health tracking and communication, not to make medical decisions.
- Patient health information and uploaded reports should be handled with appropriate privacy and access controls.
- Uploaded files and generated assets should be reviewed before publishing or sharing the repository.
