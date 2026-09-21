pipeline {

    agent any

    options {
        timestamps()
        disableConcurrentBuilds()
        skipDefaultCheckout(true)

        buildDiscarder(
            logRotator(
                numToKeepStr: '20',
                artifactNumToKeepStr: '10'
            )
        )
    }

    environment {
        APP_NAME = "cicd-demo"

        DOCKER_REGISTRY = "docker.io"
        DOCKER_IMAGE = "sweshsmarth/cicd-demo"
        DOCKER_CREDENTIALS = "dockerhub-credentials"

        KUBECONFIG_CREDENTIAL = "kubeconfig-ec2"

        K8S_NAMESPACE = "cicd-demo"
        K8S_DEPLOYMENT = "cicd-demo"

        DEPLOYMENT_ATTEMPTED = "false"
    }

    stages {

        stage('Checkout') {
            steps {
                cleanWs()

                checkout scm

                script {
                    env.GIT_COMMIT_SHORT = sh(
                        script: 'git rev-parse --short=7 HEAD',
                        returnStdout: true
                    ).trim()

                    env.IMAGE_TAG =
                        "${env.BUILD_NUMBER}-${env.GIT_COMMIT_SHORT}"
                }

                echo "Checkout completed"
                echo "Repository: ${env.GIT_URL ?: 'Git repository'}"
                echo "Branch: ${env.BRANCH_NAME ?: env.GIT_BRANCH ?: 'main'}"
                echo "Commit: ${env.GIT_COMMIT_SHORT}"
                echo "Image Tag: ${env.IMAGE_TAG}"
            }
        }

        stage('Validate') {
            steps {
                sh '''
                    set -eu

                    echo "Validating project structure..."

                    test -f app/Dockerfile
                    test -f app/package.json
                    test -f app/server.js

                    test -f k8s/namespace.yaml
                    test -f k8s/deployment.yaml
                    test -f k8s/service.yaml

                    echo "Validation successful."
                '''
            }
        }

        stage('Application Build') {
            steps {
                dir('app') {
                    sh '''
                        set -eu

                        echo "Installing dependencies..."

                        npm install

                        echo "Application build completed."
                    '''
                }
            }
        }

        stage('Docker Check') {
            steps {
                sh '''
                    set -eu

                    echo "Checking Docker..."

                    docker --version
                    docker ps

                    echo "Docker is available to Jenkins."
                '''
            }
        }

        stage('Docker Build') {
            steps {
                sh """
                    set -eu

                    echo "Building Docker image..."

                    docker build \
                        -t ${DOCKER_IMAGE}:${IMAGE_TAG} \
                        -t ${DOCKER_IMAGE}:latest \
                        -f app/Dockerfile \
                        app/

                    echo "Docker image created successfully."

                    docker images ${DOCKER_IMAGE}
                """
            }
        }

        stage('Docker Push') {
            steps {
                withCredentials([
                    usernamePassword(
                        credentialsId: "${DOCKER_CREDENTIALS}",
                        usernameVariable: 'DOCKER_USERNAME',
                        passwordVariable: 'DOCKER_PASSWORD'
                    )
                ]) {
                    sh """
                        set -eu

                        echo "\${DOCKER_PASSWORD}" | docker login \
                            ${DOCKER_REGISTRY} \
                            --username "\${DOCKER_USERNAME}" \
                            --password-stdin

                        docker push ${DOCKER_IMAGE}:${IMAGE_TAG}

                        docker push ${DOCKER_IMAGE}:latest

                        docker logout ${DOCKER_REGISTRY} || true

                        echo "Docker images pushed successfully."
                    """
                }
            }
        }

        stage('Kubernetes Validation') {
            steps {
                withCredentials([
                    file(
                        credentialsId: "${KUBECONFIG_CREDENTIAL}",
                        variable: 'KUBECONFIG_FILE'
                    )
                ]) {
                    sh '''
                        set -eu

                        export KUBECONFIG="$KUBECONFIG_FILE"

                        echo "Checking kubectl..."

                        kubectl version --client

                        echo "Checking Kubernetes cluster..."

                        kubectl cluster-info

                        echo "Checking Kubernetes nodes..."

                        kubectl get nodes

                        echo "Kubernetes cluster is reachable."
                    '''
                }
            }
        }

        stage('Deploy to Kubernetes') {
            steps {
                withCredentials([
                    file(
                        credentialsId: "${KUBECONFIG_CREDENTIAL}",
                        variable: 'KUBECONFIG_FILE'
                    )
                ]) {
                    script {
                        env.DEPLOYMENT_ATTEMPTED = "true"
                    }

                    sh """
                        set -eu

                        export KUBECONFIG="\${KUBECONFIG_FILE}"

                        echo "Applying namespace..."

                        kubectl apply \
                            -f k8s/namespace.yaml

                        echo "Applying service..."

                        kubectl apply \
                            -f k8s/service.yaml

                        echo "Applying deployment..."

                        kubectl apply \
                            -f k8s/deployment.yaml

                        echo "Updating deployment image..."

                        kubectl -n ${K8S_NAMESPACE} set image \
                            deployment/${K8S_DEPLOYMENT} \
                            ${APP_NAME}=${DOCKER_IMAGE}:${IMAGE_TAG}

                        echo "Deployment image updated."
                    """
                }
            }
        }

        stage('Verify Deployment') {
            steps {
                withCredentials([
                    file(
                        credentialsId: "${KUBECONFIG_CREDENTIAL}",
                        variable: 'KUBECONFIG_FILE'
                    )
                ]) {
                    sh """
                        set -eu

                        export KUBECONFIG="\${KUBECONFIG_FILE}"

                        echo "Waiting for rollout..."

                        kubectl -n ${K8S_NAMESPACE} rollout status \
                            deployment/${K8S_DEPLOYMENT} \
                            --timeout=180s

                        echo "Deployment successful."

                        kubectl -n ${K8S_NAMESPACE} get deployment
                        kubectl -n ${K8S_NAMESPACE} get pods
                        kubectl -n ${K8S_NAMESPACE} get service
                    """
                }
            }
        }
    }

    post {

        success {
            echo "CI/CD pipeline completed successfully."
            echo "Application: ${APP_NAME}"
            echo "Docker Image: ${DOCKER_IMAGE}:${IMAGE_TAG}"
            echo "Build: ${BUILD_NUMBER}"
            echo "Commit: ${GIT_COMMIT_SHORT}"
        }

        failure {
            echo "CI/CD pipeline failed."
            echo "Build: ${BUILD_NUMBER}"

            script {
                if (env.DEPLOYMENT_ATTEMPTED == "true") {

                    withCredentials([
                        file(
                            credentialsId: "${KUBECONFIG_CREDENTIAL}",
                            variable: 'KUBECONFIG_FILE'
                        )
                    ]) {
                        sh '''
                            set +e

                            export KUBECONFIG="$KUBECONFIG_FILE"

                            echo "Attempting Kubernetes rollback..."

                            kubectl -n cicd-demo rollout undo \
                                deployment/cicd-demo || true
                        '''
                    }

                } else {
                    echo "No Kubernetes deployment was attempted. Rollback skipped."
                }
            }
        }

        always {
            echo "Cleaning Docker resources..."

            sh '''
                docker system prune -f || true
            '''

            cleanWs()
        }
    }
}
