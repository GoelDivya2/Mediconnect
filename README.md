# MediConnect – Doctor Discovery & Appointment Booking (MERN)

## Prerequisites
Node.js 18+ and MongoDB running locally (or a MongoDB Atlas URI).

## Run
```bash
# Backend
cd server && cp .env.example .env && npm install
npm run seed      # loads sample doctors + patient
npm run dev       # http://localhost:5000

# Frontend (new terminal)
cd client && cp .env.example .env && npm install
npm run dev       # http://localhost:5173
```

## Demo logins (after seeding)
- Doctor: doctor1@mediconnect.com / doctor123 (doctor1–doctor6 exist)
- Patient: patient@mediconnect.com / patient123

## API
| Method | Route | Access |
|---|---|---|
| POST | /api/auth/register, /api/auth/login | public |
| GET / PUT | /api/auth/me, /api/auth/profile | logged in |
| GET | /api/doctors?name&specialization&city&locality&pincode | public |
| GET | /api/doctors/:id, /api/doctors/:id/slots?date=YYYY-MM-DD | public |
| POST | /api/appointments | patient |
| GET | /api/appointments/mine | doctor / patient |
| PATCH | /api/appointments/:id/status | doctor (Accepted/Rejected), patient (Cancelled) |

## Design notes
- Two collections: `User` (role-based, doctor fields required only for doctors) and `Appointment` (refs to User).
- Duplicate bookings are blocked twice: an application check and a unique partial index on doctor + date + time for Pending/Accepted appointments.
- Slots are generated as 30-minute blocks from the doctor's timings for that weekday.
- Location search uses MongoDB regex/exact queries only; no map APIs.
