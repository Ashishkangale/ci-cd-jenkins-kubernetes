```groovy
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
<<<<<<< HEAD
<<<<<<< HEAD

=======
>>>>>>> d1add64 (Fix Jenkinsfile syntax)
=======
>>>>>>> afcb21a (Fix Jenkinsfile syntax)
                    env.GIT_COMMIT_SHORT = sh(
                        script: 'git rev-parse --short=7 HEAD',
                        returnStdout: true
                    ).trim()

                    env.IMAGE_TAG =
                        "${env.BUILD_NUMBER}-${env.GIT_COMMIT_SHORT}"
                }

<<<<<<< HEAD
<<<<<<< HEAD
                echo "========================================="
                echo "Checkout completed"
                echo "Repository : ${env.GIT_URL ?: 'Git repository'}"
                echo "Branch     : ${env.BRANCH_NAME ?: env.GIT_BRANCH ?: 'main'}"
                echo "Commit     : ${env.GIT_COMMIT_SHORT}"
                echo "Image Tag  : ${env.IMAGE_TAG}"
                echo "========================================="
=======
                echo "Checkout completed"
=======
                echo "Checkout completed"
>>>>>>> afcb21a (Fix Jenkinsfile syntax)
                echo "Repository: ${env.GIT_URL ?: 'Git repository'}"
                echo "Branch: ${env.BRANCH_NAME ?: env.GIT_BRANCH ?: 'main'}"
                echo "Commit: ${env.GIT_COMMIT_SHORT}"
                echo "Image Tag: ${env.IMAGE_TAG}"
<<<<<<< HEAD
>>>>>>> d1add64 (Fix Jenkinsfile syntax)
=======
>>>>>>> afcb21a (Fix Jenkinsfile syntax)
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

<<<<<<< HEAD
<<<<<<< HEAD

        /*
         * ==========================================
         * DOCKER CHECK
         * ==========================================
         */

=======
>>>>>>> afcb21a (Fix Jenkinsfile syntax)
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
<<<<<<< HEAD

=======
        stage('Docker Check') {
>>>>>>> d1add64 (Fix Jenkinsfile syntax)
            steps {
                sh '''
                    set -eu

<<<<<<< HEAD
=======
            steps {
>>>>>>> afcb21a (Fix Jenkinsfile syntax)
                sh """
                    set -eu

                    echo "Building Docker image..."

                    docker build \
                        -t ${DOCKER_IMAGE}:${IMAGE_TAG} \
                        -t ${DOCKER_IMAGE}:latest \
                        -f app/Dockerfile \
                        app/

                    echo "Docker image created successfully."

=======
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

>>>>>>> d1add64 (Fix Jenkinsfile syntax)
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
<<<<<<< HEAD

<<<<<<< HEAD
                        echo "Logging into Docker Hub..."
=======
>>>>>>> d1add64 (Fix Jenkinsfile syntax)

=======
>>>>>>> afcb21a (Fix Jenkinsfile syntax)
                        echo "\${DOCKER_PASSWORD}" | docker login \
                            ${DOCKER_REGISTRY} \
                            --username "\${DOCKER_USERNAME}" \
                            --password-stdin

                        docker push ${DOCKER_IMAGE}:${IMAGE_TAG}

<<<<<<< HEAD
                        docker push \
                            ${DOCKER_IMAGE}:${IMAGE_TAG}

<<<<<<< HEAD
                        echo "Pushing latest image..."

                        docker push \
                            ${DOCKER_IMAGE}:latest

                        echo "Docker images pushed successfully."

                        docker logout ${DOCKER_REGISTRY} || true
=======
                        docker logout ${DOCKER_REGISTRY} || true

                        echo "Docker images pushed successfully."
>>>>>>> d1add64 (Fix Jenkinsfile syntax)
=======
                        docker push ${DOCKER_IMAGE}:latest

                        docker logout ${DOCKER_REGISTRY} || true

                        echo "Docker images pushed successfully."
>>>>>>> afcb21a (Fix Jenkinsfile syntax)
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
                    sh """
                        set -eu

                        export KUBECONFIG="\${KUBECONFIG_FILE}"

<<<<<<< HEAD
<<<<<<< HEAD
                        echo "Creating/updating namespace..."
=======
                        echo "Applying namespace..."
>>>>>>> d1add64 (Fix Jenkinsfile syntax)
=======
                        echo "Applying namespace..."
>>>>>>> afcb21a (Fix Jenkinsfile syntax)

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
<<<<<<< HEAD
<<<<<<< HEAD

                        echo "Saving deployment attempt status..."

                        echo "true" > deployment_attempted.txt
=======
>>>>>>> d1add64 (Fix Jenkinsfile syntax)
=======
>>>>>>> afcb21a (Fix Jenkinsfile syntax)
                    """

                    script {
                        env.DEPLOYMENT_ATTEMPTED = "true"
                    }
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

<<<<<<< HEAD
                        echo "Rollout completed successfully."

<<<<<<< HEAD
                        echo "Deployment status:"

                        kubectl -n ${K8S_NAMESPACE} get deployment \
                            ${K8S_DEPLOYMENT}

                        echo "Pod status:"
=======
                        echo "Deployment successful."
>>>>>>> afcb21a (Fix Jenkinsfile syntax)

                        kubectl -n ${K8S_NAMESPACE} get deployment
                        kubectl -n ${K8S_NAMESPACE} get pods
<<<<<<< HEAD

                        echo "Service status:"

=======
                        kubectl -n ${K8S_NAMESPACE} get deployment
                        kubectl -n ${K8S_NAMESPACE} get pods
>>>>>>> d1add64 (Fix Jenkinsfile syntax)
=======
>>>>>>> afcb21a (Fix Jenkinsfile syntax)
                        kubectl -n ${K8S_NAMESPACE} get service
                    """
                }
            }
        }
    }

    post {

        success {
<<<<<<< HEAD
<<<<<<< HEAD

            echo """
=========================================
       CI/CD PIPELINE SUCCESSFUL
=========================================

Application : ${APP_NAME}
Docker Image: ${DOCKER_IMAGE}:${IMAGE_TAG}
Namespace   : ${K8S_NAMESPACE}
Build       : ${BUILD_NUMBER}
Commit      : ${GIT_COMMIT_SHORT}

=========================================
"""
=======
=======
>>>>>>> afcb21a (Fix Jenkinsfile syntax)
            echo "CI/CD pipeline completed successfully."
            echo "Application: ${APP_NAME}"
            echo "Docker Image: ${DOCKER_IMAGE}:${IMAGE_TAG}"
            echo "Build: ${BUILD_NUMBER}"
            echo "Commit: ${GIT_COMMIT_SHORT}"
<<<<<<< HEAD
>>>>>>> d1add64 (Fix Jenkinsfile syntax)
=======
>>>>>>> afcb21a (Fix Jenkinsfile syntax)
        }

        failure {
<<<<<<< HEAD
<<<<<<< HEAD

            echo """
=========================================
        CI/CD PIPELINE FAILED
=========================================

Build  : ${BUILD_NUMBER}
Commit : ${GIT_COMMIT_SHORT ?: 'unknown'}

Attempting Kubernetes rollback if required...

=========================================
"""

            script {

=======
            echo "CI/CD pipeline failed."
            echo "Build: ${BUILD_NUMBER}"

            script {
>>>>>>> d1add64 (Fix Jenkinsfile syntax)
=======
            echo "CI/CD pipeline failed."
            echo "Build: ${BUILD_NUMBER}"

            script {
>>>>>>> afcb21a (Fix Jenkinsfile syntax)
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

<<<<<<< HEAD
<<<<<<< HEAD
                            echo "Rolling back Kubernetes deployment..."
=======
                            echo "Attempting Kubernetes rollback..."
>>>>>>> d1add64 (Fix Jenkinsfile syntax)
=======
                            echo "Attempting Kubernetes rollback..."
>>>>>>> afcb21a (Fix Jenkinsfile syntax)

                            kubectl -n cicd-demo rollout undo \
                                deployment/cicd-demo || true
                        '''
                    }

                } else {
<<<<<<< HEAD
<<<<<<< HEAD

=======
>>>>>>> d1add64 (Fix Jenkinsfile syntax)
=======
>>>>>>> afcb21a (Fix Jenkinsfile syntax)
                    echo "No Kubernetes deployment was attempted. Rollback skipped."
                }
            }
        }

        always {
            echo "Cleaning Docker resources..."

<<<<<<< HEAD
            echo "Cleaning Docker resources..."

=======
>>>>>>> d1add64 (Fix Jenkinsfile syntax)
            sh '''
                docker system prune -f || true
            '''

            cleanWs()
        }
    }
}
<<<<<<< HEAD
<<<<<<< HEAD
=======
```
>>>>>>> d1add64 (Fix Jenkinsfile syntax)
=======
```
>>>>>>> afcb21a (Fix Jenkinsfile syntax)
