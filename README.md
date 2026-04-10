<div align='center'>

  [![demo][demo]][demo-link]
  [![status][status]][status-link]
  [![deploy][deploy]](/)
  [![test][tests]][tests-link]

</div>

<div align='center'>
  <a href='/'>
    <img
      src='/public/screenshot.png'
      alt='Screenshot of the app'
      width='100%'
    />
  </a>
</div>

<!-- TODO: Add a screenshot at /public/images/screenshot.png -->

<div align='center'>
  <h1>Airbnb Clone with Next.js 13</h1>
</div>

<div align='center'>

  [![Next.js][nextjs]][nextjs-link]
  [![TypeScript][typescript]][typescript-link]
  [![Tailwind CSS][tailwindcss]][tailwindcss-link]
  [![React][react]][react-link]
  [![Next-Auth][next-auth]][next-auth-link]
  [![Prisma][prisma]][prisma-link]
  [![MongoDB][mongodb]][mongodb-link]
  [![Axios][axios]][axios-link]
  [![React Icons][react-icons]][react-icons-link]
  [![Zustand][zustand]][zustand-link]
  [![React Hook Form][react-hook-form]][react-hook-form-link]
  [![React Leaflet][react-leaflet]][react-leaflet-link]
  [![Cloudinary][cloudinary]][cloudinary-link]
  [![Vercel][vercel]][vercel-link]

</div>

<div align='center'>
  Airbnb clone app for vacation rentals, built with Next.js 13, TypeScript, Tailwind CSS, Prisma, MongoDB, and NextAuth. Allows users to browse listings, make reservations, manage properties, and save favorites.

  [Demo]({{DEMO_URL}}) · [Report issue](/issues) · [Suggest something](/issues)
</div>

## Table of Contents

- [Table of Contents](#table-of-contents)
- [Features](#features)
- [Tech Stack](#tech-stack)
- [Getting Started](#getting-started)
  - [Prerequisites](#prerequisites)
  - [Installation](#installation)
  - [Running locally](#running-locally)
  - [Build](#build)
- [Environment Variables](#environment-variables)
- [Project Structure](#project-structure)
- [Demo](#demo)
- [API Reference](#api-reference)
- [Contributing](#contributing)
- [License](#license)

## Features

- [x] Authentication with NextAuth (JWT strategy)
- [x] GitHub and Google OAuth login
- [x] Credential-based email/password registration and login
- [x] Create, view, and delete property listings
- [x] Image upload via Cloudinary
- [x] Property search with filters (location, date range, guests, rooms, bathrooms)
- [x] Interactive map with React Leaflet
- [x] Reservation system with date range calendar
- [x] Add and remove listings from favorites
- [x] View trips, reservations, properties, and favorite listings
- [x] Responsive design with Tailwind CSS
- [x] Database with Prisma and MongoDB
- [x] State management with Zustand
- [x] Deployed on Vercel

## Tech Stack

- [Next.js 13](https://nextjs.org/)
- [TypeScript](https://www.typescriptlang.org/)
- [Tailwind CSS](https://tailwindcss.com/)
- [React](https://react.dev/)
- [NextAuth.js](https://next-auth.js.org/)
- [Prisma](https://www.prisma.io/)
- [MongoDB](https://www.mongodb.com/)
- [Axios](https://axios-http.com/)
- [Zustand](https://zustand-demo.pmnd.rs/)
- [React Hook Form](https://react-hook-form.com/)
- [React Leaflet](https://react-leaflet.js.org/)
- [Cloudinary](https://cloudinary.com/)
- [React Date Range](https://www.npmjs.com/package/react-date-range)
- [date-fns](https://date-fns.org/)
- [React Hot Toast](https://react-hot-toast.com/)
- [Vercel](https://vercel.com/)

## Getting Started

### Prerequisites

- Node.js 18+
- npm
- A MongoDB Atlas account (for database)
- GitHub and Google OAuth credentials (for authentication)
- A Cloudinary account (for image uploads)

### Installation

```bash
git clone https://github.com/wrujel/airbnb-clone.git
cd airbnb-clone
npm install
```

### Running locally

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

### Build

```bash
npm run build
```

## Environment Variables

To run this project, you will need to add the following environment variables to your `.env` file.

| Variable                            | Description                               | Required |
| :---------------------------------- | :---------------------------------------- | :------: |
| `DATABASE_URL`                      | MongoDB connection string                 |   Yes    |
| `NEXTAUTH_SECRET`                   | Secret for NextAuth.js session encryption |   Yes    |
| `GITHUB_CLIENT_ID`                  | GitHub OAuth app client ID                |   Yes    |
| `GITHUB_CLIENT_SECRET`              | GitHub OAuth app client secret            |   Yes    |
| `GOOGLE_CLIENT_ID`                  | Google OAuth client ID                    |   Yes    |
| `GOOGLE_CLIENT_SECRET`              | Google OAuth client secret                |   Yes    |
| `NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME` | Cloudinary cloud name for image uploads   |   Yes    |

## Project Structure

```
/
├── app/
│   ├── actions/          # Server actions (getCurrentUser, getListings, etc.)
│   ├── api/              # API routes
│   │   ├── favorites/    # Add/remove favorites
│   │   ├── listings/     # Create/delete listings
│   │   ├── register/     # User registration
│   │   └── reservations/ # Create/delete reservations
│   ├── components/       # React components
│   │   ├── Inputs/       # Form input components
│   │   ├── listings/     # Listing display components
│   │   ├── modals/       # Modal dialogs
│   │   └── navbar/       # Navigation components
│   ├── favorites/        # Favorites page
│   ├── hooks/            # Custom React hooks
│   ├── libs/             # Utility libraries (Prisma client)
│   ├── listings/         # Listing detail page
│   ├── properties/       # Properties management page
│   ├── reservations/     # Reservations management page
│   └── trips/            # Trips page
├── pages/
│   └── api/auth/         # NextAuth configuration
├── prisma/
│   └── schema.prisma     # Database schema
├── public/
│   └── images/           # Static images
├── package.json
├── tailwind.config.js
└── tsconfig.json
```

## Demo

You can check out the demo:

[![Demo][demo]][demo-link]

## API Reference

| Method   | Endpoint                           | Description                   | Auth Required |
| :------- | :--------------------------------- | :---------------------------- | :-----------: |
| `POST`   | `/api/register`                    | Register a new user           |      No       |
| `POST`   | `/api/listings`                    | Create a new listing          |      Yes      |
| `DELETE` | `/api/listings/:listingId`         | Delete a listing              |      Yes      |
| `POST`   | `/api/reservations`                | Create a reservation          |      Yes      |
| `DELETE` | `/api/reservations/:reservationId` | Cancel a reservation          |      Yes      |
| `POST`   | `/api/favorites/:listingId`        | Add listing to favorites      |      Yes      |
| `DELETE` | `/api/favorites/:listingId`        | Remove listing from favorites |      Yes      |

## Contributing

Contributions are welcome! If you have suggestions or find bugs, please open an issue or submit a pull request.

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is licensed under the [MIT License](LICENSE).

---

<!-- Badges -->
[nextjs]: https://img.shields.io/badge/Next.js-black?style=for-the-badge&logo=next.js
[typescript]: https://img.shields.io/badge/Typescript-007ACC?style=for-the-badge&logo=typescript&logoColor=white&color=blue
[tailwindcss]: https://img.shields.io/badge/Tailwind%20CSS-38B2AC?style=for-the-badge&logo=tailwind-css&logoColor=white
[react]: https://img.shields.io/badge/React-20232A?style=for-the-badge&logo=react&logoColor=61DAFB
[next-auth]: https://img.shields.io/badge/Next--Auth-black?style=for-the-badge&logo=next.js
[prisma]: https://img.shields.io/badge/Prisma-2D3748?style=for-the-badge&logo=prisma&logoColor=white
[axios]: https://img.shields.io/badge/Axios-671ddf?style=for-the-badge&logo=axios&logoColor=white
[react-icons]: https://img.shields.io/badge/React--Icons-20232A?style=for-the-badge&logo=react&logoColor=61DAFB
[zustand]: https://img.shields.io/badge/Zustand-2A2A2A?style=for-the-badge&logo=npm
[mongodb]: https://img.shields.io/badge/MongoDB-47A248?style=for-the-badge&logo=mongodb&logoColor=white
[vercel]: https://img.shields.io/badge/Vercel-000000?style=for-the-badge&logo=vercel&logoColor=white
[react-hook-form]: https://img.shields.io/badge/React%20Hook%20Form-20232A?style=for-the-badge&logo=react&logoColor=61DAFB
[react-leaflet]: https://img.shields.io/badge/React%20Leaflet-2A2A2A?style=for-the-badge&logo=npm&logoColor=white
[cloudinary]: https://img.shields.io/badge/Cloudinary-4285F4?style=for-the-badge&logo=cloudinary&logoColor=white

<!-- Badges links -->
[nextjs-link]: https://nextjs.org/
[typescript-link]: https://www.typescriptlang.org/
[tailwindcss-link]: https://tailwindcss.com/
[react-link]: https://react.dev/
[next-auth-link]: https://next-auth.js.org/
[prisma-link]: https://www.prisma.io/
[axios-link]: https://axios-http.com/
[react-icons-link]: https://react-icons.github.io/react-icons/
[zustand-link]: https://zustand-demo.pmnd.rs/
[mongodb-link]: https://www.mongodb.com/
[vercel-link]: https://vercel.com/
[react-hook-form-link]: https://react-hook-form.com/
[react-leaflet-link]: https://react-leaflet.js.org/
[cloudinary-link]: https://cloudinary.com/

<!-- Status/Demo badges -->
[demo]: https://img.shields.io/badge/🚀%20Live%20Demo-000000?style=for-the-badge&&logoColor=white&color=0a6bdb
[status-link]: https://github.com/wrujel/monitor-repos
[tests-link]: https://github.com/wrujel/monitor-tests

[demo-link]: https://demo-airbnb-clone-three-phi-45.vercel.app/
[status]: https://img.shields.io/endpoint?url=https%3A%2F%2Fraw.githubusercontent.com%2Fwrujel%2Fmonitor-repos%2Fmain%2Fdata%2Fairbnb-clone.json
[deploy]: https://img.shields.io/github/deployments/wrujel/airbnb-clone/production?style=for-the-badge&label=Deploy
[tests]: https://img.shields.io/endpoint?url=https%3A%2F%2Fraw.githubusercontent.com%2Fwrujel%2Fmonitor-tests%2Fmain%2Fdata%2Fairbnb-clone.json
