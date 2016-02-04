/*
 * Copyright 2016 IBM Corp.
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
    .controller('CreatePoolDetailsController', CreatePoolDetailsController);

  CreatePoolDetailsController.$inject = [
    '$scope'
  ];

  /**
   * @ngdoc controller
   * @name CreatePoolDetailsController
   * @description
   * The `CreatePoolDetailsController` controller provides functions for configuring
   * pool details.
   * @param $scope The angular scope object.
   * @returns undefined
   */

  function CreatePoolDetailsController($scope) {

    var ctrl = this;

    ctrl.protocolChange = protocolChange;

    //////////

    function protocolChange(protocol) {
      var port = { HTTP: 80, HTTPS: 443 }[protocol];
      $scope.model.members.forEach(function setAvailableInstancePort(member) {
        member.port = port;
      });
      $scope.model.spec.members.forEach(function setAllocatedMemberPort(member) {
        member.port = port;
      });
    }
  }
})();
