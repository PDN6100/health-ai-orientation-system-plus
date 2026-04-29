# API REST proposée (NestJS)

## Auth
- POST /auth/register
- POST /auth/login
- POST /auth/logout
- POST /auth/forgot-password
- POST /auth/reset-password
- POST /auth/refresh
- POST /auth/verify-email

## Users
- GET /users/me
- PATCH /users/me
- PATCH /users/me/password
- PATCH /users/me/notification-preferences

## Vehicles
- GET /vehicles
- POST /vehicles
- GET /vehicles/:id
- PATCH /vehicles/:id
- DELETE /vehicles/:id

## Inspections
- GET /inspections
- POST /inspections
- GET /inspections/:id

## Appointments
- GET /appointments
- POST /appointments
- PATCH /appointments/:id
- DELETE /appointments/:id

## Centers
- GET /centers
- POST /centers
- PATCH /centers/:id
- GET /centers/:id/availability

## Insurance
- GET /insurance/contracts
- POST /insurance/contracts
- GET /insurance/offers

## Notifications
- GET /notifications
- PATCH /notifications/:id/read

## Admin
- GET /admin/dashboard
- GET /admin/users
- PATCH /admin/users/:id/status
- GET /admin/logs
- GET /admin/exports
