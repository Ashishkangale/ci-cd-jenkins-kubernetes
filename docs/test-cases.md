# CI/CD Pipeline with Jenkins, Docker and Kubernetes

## Overview

This project demonstrates an automated CI/CD pipeline using:

- GitHub
- Jenkins
- Groovy
- Docker
- Docker Hub
- Kubernetes
- kubectl

## Pipeline Flow

GitHub
   ↓
Jenkins
   ↓
Validate
   ↓
Build Application
   ↓
Build Docker Image
   ↓
Push Image to Docker Hub
   ↓
Connect to Kubernetes
   ↓
Deploy Application
   ↓
Verify Rollout
   ↓
Application Running

## Project Structure

ci-cd-jenkins-kubernetes/

├── Jenkinsfile
├── README.md
├── .gitignore
├── app/
├── k8s/
├── scripts/
└── docs/

## Jenkins Credentials

Required credentials:

1. dockerhub-credentials
2. kubeconfig-ec2

Credential values must never be committed to GitHub.

## Kubernetes

Namespace:

cicd-demo

Deployment:

cicd-demo

Service:

cicd-demo

## Docker Image

The Docker image uses:

BUILD_NUMBER-GIT_COMMIT

Example:

15-a81f293

## Health Checks

The application exposes:

/health

Kubernetes uses this endpoint for readiness and liveness probes.

## Rollback

If deployment verification fails, Jenkins attempts:

kubectl rollout undo

## Security

- Credentials are stored in Jenkins.
- Docker Hub uses an access token.
- Kubernetes credentials are not committed to Git.
- The application container runs as a non-root user.
- Production deployments should use least-privilege Kubernetes RBAC.

## Future Improvements

- Jenkins Shared Library
- Multiple Kubernetes clusters
- Multiple repositories
- Automated security scanning
- Automated tests
- Monitoring