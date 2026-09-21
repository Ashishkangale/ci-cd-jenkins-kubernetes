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

        /*
         * ==========================================
         * CHECKOUT
         * ==========================================
         */

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

                echo "========================================="
                echo "Checkout completed"
                echo "Repository : ${env.GIT_URL ?: 'Git repository'}"
                echo "Branch     : ${env.BRANCH_NAME ?: env.GIT_BRANCH ?: 'main'}"
                echo "Commit     : ${env.GIT_COMMIT_SHORT}"
                echo "Image Tag  : ${env.IMAGE_TAG}"
                echo "========================================="
            }
        }


        /*
         * ==========================================
         * PROJECT VALIDATION
         * ==========================================
         */

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

                    echo "Project validation successful."
                '''
            }
        }


        /*
         * ==========================================
         * APPLICATION BUILD
         * ==========================================
         */

        stage('Application Build') {

            steps {

                dir('app') {

                    sh '''
                        set -eu

                        echo "Installing Node.js dependencies..."

                        npm install

                        echo "Application build completed."
                    '''
                }
            }
        }


        /*
         * ==========================================
         * DOCKER CHECK
         * ==========================================
         */

        stage('Docker Check') {

            steps {

                sh '''
                    set -eu

                    echo "Checking Docker..."

                    docker --version

                    echo "Checking Docker daemon..."

                    docker ps

                    echo "Docker is available to Jenkins."
                '''
            }
        }


        /*
         * ==========================================
         * DOCKER BUILD
         * ==========================================
         */

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


        /*
         * ==========================================
         * DOCKER PUSH
         * ==========================================
         */

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

                        echo "Logging into Docker Hub..."

                        echo "\${DOCKER_PASSWORD}" | docker login \
                            ${DOCKER_REGISTRY} \
                            --username "\${DOCKER_USERNAME}" \
                            --password-stdin

                        echo "Pushing versioned image..."

                        docker push \
                            ${DOCKER_IMAGE}:${IMAGE_TAG}

                        echo "Pushing latest image..."

                        docker push \
                            ${DOCKER_IMAGE}:latest

                        echo "Docker images pushed successfully."

                        docker logout ${DOCKER_REGISTRY} || true
                    """
                }
            }
        }


        /*
         * ==========================================
         * KUBERNETES VALIDATION
         * ==========================================
         */

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


        /*
         * ==========================================
         * DEPLOY TO KUBERNETES
         * ==========================================
         */

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

                        echo "Creating/updating namespace..."

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

                        echo "Saving deployment attempt status..."

                        echo "true" > deployment_attempted.txt
                    """

                    script {
                        env.DEPLOYMENT_ATTEMPTED = "true"
                    }
                }
            }
        }


        /*
         * ==========================================
         * VERIFY DEPLOYMENT
         * ==========================================
         */

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

                        echo "Waiting for Kubernetes rollout..."

                        kubectl -n ${K8S_NAMESPACE} rollout status \
                            deployment/${K8S_DEPLOYMENT} \
                            --timeout=180s

                        echo "Rollout completed successfully."

                        echo "Deployment status:"

                        kubectl -n ${K8S_NAMESPACE} get deployment \
                            ${K8S_DEPLOYMENT}

                        echo "Pod status:"

                        kubectl -n ${K8S_NAMESPACE} get pods

                        echo "Service status:"

                        kubectl -n ${K8S_NAMESPACE} get service

                        echo "Deployment verification successful."
                    '''
                }
            }
        }
    }


    /*
     * ==========================================
     * POST ACTIONS
     * ==========================================
     */

    post {

        success {

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
        }


        failure {

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

                            echo "Rolling back Kubernetes deployment..."

                            kubectl -n cicd-demo rollout undo \
                                deployment/cicd-demo

                            echo "Rollback command completed."
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
```
