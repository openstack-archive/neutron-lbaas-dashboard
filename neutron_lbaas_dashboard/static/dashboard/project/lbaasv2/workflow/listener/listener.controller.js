/*
 * Copyright 2015 IBM Corp.
 *
 * Licensed under the Apache License, Version 2.0 (the 'License');
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *    http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an 'AS IS' BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
(function () {
  'use strict';

  angular
    .module('horizon.dashboard.project.lbaasv2')
    .controller('ListenerDetailsController', ListenerDetailsController);

  ListenerDetailsController.$inject = [
    '$scope',
    'horizon.framework.util.i18n.gettext'
  ];

  /**
   * @ngdoc controller
   * @name ListenerDetailsController
   * @description
   * The `ListenerDetailsController` controller provides functions for
   * configuring the listener details step of the LBaaS wizard.
   * @param gettext The horizon gettext function for translation.
   * @returns undefined
   */

  function ListenerDetailsController($scope, gettext) {

    var ctrl = this;

    // Error text for invalid fields
    ctrl.portError = gettext('The port must be a number between 1 and 65535.');
    ctrl.certificatesError = gettext('There was an error obtaining certificates from the ' +
      'key-manager service. The TERMINATED_HTTPS protocol is unavailable.');

    ctrl.protocolChange = protocolChange;

    //////////

    // Called when the listener protocol is changed. Shows the SSL Certificates step if
    // TERMINATED_HTTPS is selected.
    function protocolChange() {
      var protocol = $scope.model.spec.listener.protocol;
      var workflow = $scope.workflow;
      var certificates = workflow.steps.some(function checkCertificatesStep(step) {
        return step.id === 'certificates';
      });
      if (protocol === 'TERMINATED_HTTPS' && !certificates) {
        workflow.after('listener', workflow.certificatesStep);
      } else if (protocol !== 'TERMINATED_HTTPS' && certificates) {
        workflow.remove('certificates');
      }
    }
  }
})();
