pipeline {
  agent any
  environment {
    IMAGE = 'YOUR_DOCKERHUB_USERNAME/library-app'
    TAG = "${BUILD_NUMBER}"
  }
  stages {
    stage('Checkout') {
      steps { checkout scm }
    }
    stage('Install') {
      steps { sh 'npm ci' }
    }
    stage('Test') {
      steps { sh 'npm test' }
    }
    stage('Docker Build') {
      steps { sh 'docker build -t $IMAGE:$TAG -t $IMAGE:latest .' }
    }
    stage('Trivy Scan') {
      steps { sh 'trivy image --severity HIGH,CRITICAL --exit-code 0 $IMAGE:$TAG' }
    }
    stage('Push Image') {
      when { branch 'main' }
      steps {
        withCredentials([usernamePassword(credentialsId: 'dockerhub-creds',
          usernameVariable: 'DOCKER_USER', passwordVariable: 'DOCKER_PASS')]) {
          sh 'echo "$DOCKER_PASS" | docker login -u "$DOCKER_USER" --password-stdin'
          sh 'docker push $IMAGE:$TAG && docker push $IMAGE:latest'
        }
      }
    }
  }
  post {
    always { sh 'docker logout || true' }
    success { echo 'Build and tests completed successfully.' }
    failure { echo 'Pipeline failed. Review the stage console output.' }
  }
}
