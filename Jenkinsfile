/*
       Copyright 2018 IBM Corp All Rights Reserved

   Licensed under the Apache License, Version 2.0 (the "License");
   you may not use this file except in compliance with the License.
   You may obtain a copy of the License at

       http://www.apache.org/licenses/LICENSE-2.0

   Unless required by applicable law or agreed to in writing, software
   distributed under the License is distributed on an "AS IS" BASIS,
   WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
   See the License for the specific language governing permissions and
   limitations under the License.
 */

@Library('MicroserviceBuilder') _
microserviceBuilderPipeline {
  image = 'tradr'
  // Do not use the default maven home when building Node.js apps.
  // The default maven home is /root/.m2 while microservice builder runs as /home/jenkins
  // When we explode nodejs and npm the directories have root rwx permissions only
  // So when MSB runs under jenkins, jenkins can't read or write to the exploded directories
  // Please see https://github.com/carlossg/docker-maven#running-as-non-root
  // and https://github.com/eirslett/frontend-maven-plugin
  mvnCommands = "-Duser.home=/home/jenkins clean install"
}
