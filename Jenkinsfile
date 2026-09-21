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
    }

    stages {

        stage('Checkout') {

            steps {

                cleanWs()

                checkout scm

                echo "Repository: ${env.GIT_URL}"
                echo "Branch: ${env.BRANCH_NAME ?: env.GIT_BRANCH}"
                echo "Commit: ${env.GIT_COMMIT}"
            }
        }

        stage('Validate') {

            steps {

                sh '''
                    set -e

                    echo "Validating project structure..."

                    test -f app/Dockerfile
                    test -f app/package.json
                    test -f app/server.js

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
                        set -e

                        echo "Installing dependencies..."

                        npm install

                        echo "Application build completed."
                    '''
                }
            }
        }

        stage('Docker Build') {

            steps {

                script {

                    env.IMAGE_TAG =
                        "${env.BUILD_NUMBER}-${env.GIT_COMMIT.take(7)}"

                    sh """
                        set -e

                        echo "Building Docker image..."

                        docker build \
                            -t ${DOCKER_IMAGE}:${IMAGE_TAG} \
                            -t ${DOCKER_IMAGE}:latest \
                            -f app/Dockerfile \
                            app/

                        echo "Docker image created."
                    """
                }
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
                        set -e

                        echo "\${DOCKER_PASSWORD}" | docker login \
                            ${DOCKER_REGISTRY} \
                            -u "\${DOCKER_USERNAME}" \
                            --password-stdin

                        docker push ${DOCKER_IMAGE}:${IMAGE_TAG}

                        docker push ${DOCKER_IMAGE}:latest

                        docker logout ${DOCKER_REGISTRY}
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
                        set -e

                        export KUBECONFIG="$KUBECONFIG_FILE"

                        echo "Checking Kubernetes cluster..."

                        kubectl cluster-info

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
                        set -e

                        export KUBECONFIG="\${KUBECONFIG_FILE}"

                        echo "Creating namespace..."

                        kubectl apply -f k8s/namespace.yaml

                        echo "Deploying service..."

                        kubectl apply -f k8s/service.yaml

                        echo "Deploying application..."

                        kubectl apply -f k8s/deployment.yaml

                        echo "Updating image..."

                        kubectl -n ${K8S_NAMESPACE} set image \
                            deployment/${K8S_DEPLOYMENT} \
                            ${APP_NAME}=${DOCKER_IMAGE}:${IMAGE_TAG}

                        echo "Deployment updated."
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
                        set -e

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

            echo """
            =========================================
            CI/CD PIPELINE SUCCESSFUL
            =========================================

            Application : ${APP_NAME}
            Image       : ${DOCKER_IMAGE}:${IMAGE_TAG}
            Namespace   : ${K8S_NAMESPACE}
            Build       : ${BUILD_NUMBER}

            =========================================
            """
        }

        failure {

            echo """
            =========================================
            CI/CD PIPELINE FAILED
            =========================================

            Build: ${BUILD_NUMBER}

            Check Jenkins console logs.

            =========================================
            """

            script {

                if (env.IMAGE_TAG) {

                    withCredentials([
                        file(
                            credentialsId: "${KUBECONFIG_CREDENTIAL}",
                            variable: 'KUBECONFIG_FILE'
                        )
                    ]) {

                        sh '''
                            export KUBECONFIG="$KUBECONFIG_FILE"

                            kubectl -n cicd-demo rollout undo \
                                deployment/cicd-demo || true
                        '''
                    }
                }
            }
        }

        always {

            sh '''
                echo "Cleaning Docker workspace..."

                docker system prune -f || true
            '''

            cleanWs()
        }
    }
}