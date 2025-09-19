# Status Page Application

A simplified status page app with React (frontend) and Node.js/Express (backend) using MongoDB, with simple admin auth and AWS deployment examples.

## Monorepo Layout

- `frontend/`: React app (CRA + TypeScript), deployed via Docker + Nginx on EC2
- `backend/`: Node.js/Express API (MongoDB via Mongoose), deployed to ECS Fargate behind an ALB

## Local Development

### Backend

1. `cd backend`
2. `npm install`
3. Create `.env` (optional):

   ```
   MONGO_URI=mongodb://localhost:27017/statuspage
   JWT_SECRET=supersecretkey
   ADMIN_USER=admin
   ADMIN_PASS=password
   CORS_ORIGIN=http://localhost:3000
   ```

4. `node index.js`

API base: http://localhost:3001

### Frontend

1. `cd frontend`
2. `npm install`
3. (Optional) create `.env` with `REACT_APP_API_BASE_URL`
4. `npm start`

App: http://localhost:3000

## Admin

- Login: `/admin/login` (defaults: admin / password)
- Manage services: `/admin/services`

## API (high level)

- `GET /api/services` — list services (public)
- `GET /api/services/:id` — fetch single service (public)
- `POST /api/login` — admin login -> JWT
- `POST /api/services` — create (admin)
- `PUT /api/services/:id` — update (admin)
- `DELETE /api/services/:id` — delete (admin)
- `GET /healthz` — health check

## Deployment (AWS)

- Backend: Docker image -> ECR -> ECS Fargate behind ALB
- Frontend: Docker image -> ECR -> EC2 (Docker + Nginx)

Backend task env vars:

- `MONGO_URI` (e.g., MongoDB Atlas)
- `JWT_SECRET`, `ADMIN_USER`, `ADMIN_PASS`
- `CORS_ORIGIN` (frontend origin or `*`)

## Current Deployment URLs

- Backend ALB: `http://statuspage-alb-363184243.us-east-1.elb.amazonaws.com`
  - `/healthz`, `/api/services`, `/api/login`
- Frontend EC2: `http://ec2-13-223-54-194.compute-1.amazonaws.com`

## Notes

- Public status page: `/status`
- Admin routes require JWT (stored in localStorage)
- Future work: incidents, real-time updates (WebSocket), email notifications
