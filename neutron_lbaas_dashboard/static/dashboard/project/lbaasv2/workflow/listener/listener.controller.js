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

  function ListenerDetailsController(gettext) {

    var ctrl = this;

    // Error text for invalid fields
    ctrl.portError = gettext('The port must be a number between 1 and 65535.');
  }
})();
