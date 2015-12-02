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
    .module('horizon.dashboard.project.lbaasv2.loadbalancers')
    .controller('CreateLoadBalancerWizardController', CreateLoadBalancerWizardController);

  CreateLoadBalancerWizardController.$inject = [
    '$scope',
    'horizon.dashboard.project.lbaasv2.loadbalancers.actions.create.model',
    'horizon.dashboard.project.lbaasv2.loadbalancers.actions.create.workflow'
  ];

  function CreateLoadBalancerWizardController(
    $scope,
    createLoadBalancerModel,
    createLoadBalancerWorkflow
  ) {
    // Note: we set these attributes on the $scope so that the scope inheritance used all
    // through the wizard continues to work.
    $scope.workflow = createLoadBalancerWorkflow;    // eslint-disable-line angular/ng_controller_as
    $scope.model = createLoadBalancerModel;          // eslint-disable-line angular/ng_controller_as
    $scope.model.initialize();
    $scope.submit = $scope.model.createLoadBalancer; // eslint-disable-line angular/ng_controller_as
  }

})();
