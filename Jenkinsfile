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

timeout(time: 15, unit: 'MINUTES') {
    try {
        parallel 'NodeJS Build': {
            node('nodejs') {
                cleanWs()
                checkout scm
                knimetools.reportJIRAIssues()

                dir('org.knime.js.pagebuilder') {
                    stage('Install npm Dependencies') {
                        env.lastStage = env.STAGE_NAME
                        sh '''
                            npm ci
                        '''
                    }

                    parallel 'npm Security Audit': {
                        env.lastStage = 'Security Audit'

                        catchError(buildResult: 'UNSTABLE', stageResult: 'UNSTABLE') {
                            retry(3) { // because npm registry sometimes break
                                sh '''
                                    npm audit --production
                                '''
                            }
                        }
                    },
                    'Static Code Analysis': {
                        env.lastStage = 'Lint'
                        sh '''
                            npm run lint
                        '''
                    },
                    'Verify checked-in files': {
                        env.lastStage = 'Verify checked-in files'
                        // The old build system requires the compiled JS files to be checked in (no mvn).
                        // The new Jenkins can verify this
                        sh '''
                            npm run build
                            GIT_STATUS=$(git status --porcelain dist/)
                            if grep -q "^ *M" <<< "$GIT_STATUS"; then
                            echo "Compiled JS files not checked in:"
                            echo "$GIT_STATUS"
                            exit 1
                            else
                            echo OK, compiled JS files have been checked in.
                            fi
                        '''
                    }

                    stage('Unit Tests') {
                        env.lastStage = env.STAGE_NAME
                        catchError(buildResult: 'UNSTABLE', stageResult: 'UNSTABLE') {
                        // trows exception on failing test
                            sh '''
                                npm run coverage -- --ci
                            '''
                        }
                        junit 'coverage/junit.xml'
                    }

                    if (BRANCH_NAME == "master") {
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
        },

        'Tycho Build': {
            knimetools.defaultTychoBuild('org.knime.update.js.pagebuilder')
        }

    } catch (ex) {
        currentBuild.result = 'FAILED'
        throw ex
    } finally {
        notifications.notifyBuild(currentBuild.result);
    }
}
