# Architecture

```text
Developer
    |
    | git push
    v
GitHub Repository
    |
    | Webhook
    v
Jenkins
    |
    +--> Checkout
    |
    +--> Validate
    |
    +--> Build Application
    |
    +--> Build Docker Image
    |
    +--> Push to Docker Hub
    |
    +--> Kubernetes Authentication
    |
    +--> Deploy
    |
    +--> Rollout Verification
    |
    +--> Health Verification
    |
    v
Kubernetes
    |
    v
Application

