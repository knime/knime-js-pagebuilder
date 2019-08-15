#!groovy
def BN = BRANCH_NAME == "master" || BRANCH_NAME.startsWith("releases/") ? BRANCH_NAME : "master"

library "knime-pipeline@$BN"

properties([
    buildDiscarder(logRotator(numToKeepStr: '5')),
    disableConcurrentBuilds()
])


try {
    knimetools.defaultTychoBuild('org.knime.update.js.pagebuilder')

    if (BRANCH_NAME == "master") {
        node('nodejs') {
            checkout scm
            dir('org.knime.js.pagebuilder') {
                stage('Generate Coverage data') {
					env.lastStage = env.STAGE_NAME
                    sh '''
                          npm ci
                          npm run coverage
                        '''
                }
                stage('Upload Coverage data') {
					env.lastStage = env.STAGE_NAME
                    withCredentials([usernamePassword(credentialsId: 'SONAR_CREDENTIALS', passwordVariable: 'SONAR_PASSWORD', usernameVariable: 'SONAR_LOGIN')]) {
                        sh '''
                              npm run sendcoverage
                            '''
                    }
                }
            }
        }
    }
} catch (ex) {
    currentBuild.result = 'FAILED'
    throw ex
} finally {
    notifications.notifyBuild(currentBuild.result);
}
