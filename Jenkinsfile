pipeline {
    agent any

    options {
        timestamps()
        timeout(time: 30, unit: 'MINUTES')
        disableConcurrentBuilds()
        buildDiscarder(logRotator(numToKeepStr: '20'))
    }

    environment {
        BACKEND_IMAGE  = 'elections-canada/backend'
        FRONTEND_IMAGE = 'elections-canada/frontend'
        IMAGE_TAG      = "${env.BUILD_NUMBER}"
        COMPOSE_PROJECT_NAME = 'elections-canada'
    }

    stages {
        stage('Checkout') {
            steps {
                checkout scm
            }
        }

        stage('Build') {
            steps {
                sh 'docker build -t ${BACKEND_IMAGE}:${IMAGE_TAG}  -t ${BACKEND_IMAGE}:latest  ./backend'
                sh 'docker build -t ${FRONTEND_IMAGE}:${IMAGE_TAG} -t ${FRONTEND_IMAGE}:latest ./frontend'
            }
        }

        stage('Test') {
            steps {
                sh '''
                    set +e
                    CONTAINER="ec-tests-${BUILD_NUMBER}"
                    docker run --name "$CONTAINER" -w /app ${BACKEND_IMAGE}:${IMAGE_TAG} \\
                        python -m pytest tests/ \\
                            --junitxml=test-results.xml \\
                            --cov=app --cov-report=xml:coverage.xml --cov-report=term
                    EXIT_CODE=$?
                    docker cp "$CONTAINER:/app/test-results.xml" backend/test-results.xml || true
                    docker cp "$CONTAINER:/app/coverage.xml"     backend/coverage.xml     || true
                    docker rm "$CONTAINER" || true
                    exit $EXIT_CODE
                '''
            }
            post {
                always {
                    junit allowEmptyResults: true, testResults: 'backend/test-results.xml'
                }
            }
        }

        stage('SonarQube Analysis') {
            steps {
                script {
                    // "SonarScanner" must match a Sonar Scanner installation defined in
                    // Manage Jenkins -> Global Tool Configuration.
                    def scannerHome = tool 'SonarScanner'
                    // "SonarQube" must match a SonarQube server configured under
                    // Manage Jenkins -> System. The token is injected via the
                    // server config (best practice — never hardcode it here).
                    withSonarQubeEnv('SonarQube') {
                        sh "${scannerHome}/bin/sonar-scanner"
                    }
                }
            }
        }

        stage('Deploy') {
            steps {
                sh '''
                    if docker compose version >/dev/null 2>&1; then
                        DC="docker compose"
                    else
                        DC="docker-compose"
                    fi
                    $DC down --remove-orphans || true
                    $DC up -d --build
                '''
            }
        }
    }

    post {
        always {
            sh 'docker image prune -f || true'
        }
        success {
            echo "Build #${env.BUILD_NUMBER} deployed successfully."
        }
        failure {
            echo "Build #${env.BUILD_NUMBER} failed — see logs above."
        }
    }
}
