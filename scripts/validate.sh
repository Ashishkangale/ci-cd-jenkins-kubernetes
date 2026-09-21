#!/bin/sh

set -e

echo "Validating project..."

test -f app/Dockerfile
test -f app/package.json
test -f app/server.js

test -f k8s/namespace.yaml
test -f k8s/deployment.yaml
test -f k8s/service.yaml

echo "Project validation successful."