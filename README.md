# Library Management System — Fast Track

Node.js + Express + PostgreSQL application with Docker, Jenkins, SonarQube/Trivy configuration, Kubernetes manifests and Prometheus metrics.

## Run locally with Docker
```bash
docker compose up -d --build
docker compose ps
```
Open http://localhost:3000. Health check: http://localhost:3000/health. Metrics: http://localhost:3000/metrics.

## Run tests locally
```bash
npm install
npm test
```

## Important demo accounts/data
The database seed creates books and members. Member IDs start at 1. The initial books are Clean Code, The Pragmatic Programmer and Introduction to Algorithms.

## API
- GET/POST `/api/books`
- GET `/api/books?q=clean`
- PUT/DELETE `/api/books/:id`
- GET/POST `/api/members`
- POST `/api/issue` with `{ "book_id": 1, "member_id": 1 }`
- POST `/api/return/:issueId`
- GET `/api/issues`
- GET `/api/dashboard`
- GET `/health`
- GET `/metrics`

## Jenkins
Update `YOUR_DOCKERHUB_USERNAME` in `Jenkinsfile`, install Git/Pipeline plugins and configure a Jenkins username/password credential named `dockerhub-creds`. Ensure the Jenkins agent has Node.js, Docker CLI/daemon access and Trivy installed. Configure a Pipeline job to use this repository's `Jenkinsfile`.

## Kubernetes
Replace `YOUR_DOCKERHUB_USERNAME` in `k8s/app.yaml`, build and push the image, then:
```bash
kubectl apply -f k8s/namespace.yaml
kubectl apply -f k8s/postgres.yaml
kubectl apply -f k8s/app.yaml
kubectl get pods -n library
minikube service library-app -n library
```

## Important
The sample database password is for a local classroom demo only. Change it and use Kubernetes Secrets/managed secret storage before any public deployment. The Kubernetes seed SQL is a compact equivalent of `db/init.sql`.
