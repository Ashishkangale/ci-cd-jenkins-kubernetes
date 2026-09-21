#!/bin/sh

set -e

echo "Running application smoke test..."

curl --fail http://localhost/health

echo ""
echo "Smoke test successful."