#!groovy

// Currently, the build runs in the new build system and checks if the JS artifacts are checked into git.
// This is because the old build system does not use maven, but requires the compiled JS files.
// If the KNIME AP build is moved to the new build system, then
// - the dist/ folder can be removed from git and added to .gitignore
// - the verification step can be removed

def BN = BRANCH_NAME == "master" || BRANCH_NAME.startsWith("releases/") ? BRANCH_NAME : "master"

library "knime-pipeline@$BN"

properties([
    buildDiscarder(logRotator(numToKeepStr: '5')),
    disableConcurrentBuilds()
])

try {

    node('nodejs') {
        checkout scm

        dir('org.knime.js.pagebuilder') {
            stage('Verify checked-in files') {
                sh '''
                  npm ci
                  npm run build
                  git status --porcelain dist/ | grep -q "^ *M" && exit 1
                  echo OK, compiled JS files have been checked in.
                '''
            }

            if (BRANCH_NAME == "master") {
                stage('Generate Coverage data') {
                    try {
                        // trows exception on failing test
                        sh '''
                        npm run coverage -- --ci
                        '''
                    } catch (ignore) {
                        // failing tests should not result in a pipeline exception
                    } finally {
                        junit 'coverage/junit.xml'
                    }
                }
                stage('Upload Coverage data') {
                    withCredentials([usernamePassword(credentialsId: 'SONAR_CREDENTIALS', passwordVariable: 'SONAR_PASSWORD', usernameVariable: 'SONAR_LOGIN')]) {
                        sh '''
                          npm run sendcoverage
                        '''
                    }
                }
            }
        }
    }

    // For now we can't build the plugin because the org.knime.js.core dependency can't be resolved (yet)
    //knimetools.defaultTychoBuild('org.knime.update.js.pagebuilder')

} catch (ex) {
    currentBuild.result = 'FAILED'
    throw ex
} finally {
    notifications.notifyBuild(currentBuild.result);
}
