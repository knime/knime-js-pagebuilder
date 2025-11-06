#!groovy

def BN = (BRANCH_NAME == 'master' || BRANCH_NAME.startsWith('releases/')) ? BRANCH_NAME : 'releases/2026-06'

library "knime-pipeline@$BN"

properties([
    buildDiscarder(logRotator(numToKeepStr: '5')),
    parameters([p2Tools.getP2pruningParameter()]),
    disableConcurrentBuilds()
])

try {
    node('maven && java21') {
        knimetools.defaultTychoBuild(updateSiteProject: 'org.knime.update.js.pagebuilder', disableOWASP: true)

        owasp.sendNodeJSSBOMs(readMavenPom(file: 'pom.xml').properties['revision'])

        // disabled; tests will move to Bitbucket Pipelines
        //junit '**/coverage/junit.xml'
        //knimetools.processAuditResults()
        
        /*
        stage('Sonarqube analysis') {
            withCredentials([usernamePassword(credentialsId: 'ARTIFACTORY_CREDENTIALS', passwordVariable: 'ARTIFACTORY_PASSWORD', usernameVariable: 'ARTIFACTORY_LOGIN')]) {
                withSonarQubeEnv('Sonarcloud') {
                    withMaven(options: [artifactsPublisher(disabled: true)]) {
                        def sonarArgs = knimetools.getSonarArgsForMaven(env.SONAR_CONFIG_NAME)
                        sh """
                            mvn -Dknime.p2.repo=${P2_REPO} $sonarArgs
                        """
                    }
                }
            }
        }
        */
    }
} catch (ex) {
    currentBuild.result = 'FAILURE'
    throw ex
} finally {
    notifications.notifyBuild(currentBuild.result);
}
/* vim: set shiftwidth=4 expandtab smarttab: */
