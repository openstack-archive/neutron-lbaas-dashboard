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
(function() {
  'use strict';

  angular
    .module('horizon.dashboard.project.lbaasv2.loadbalancers')
    .factory('horizon.dashboard.project.lbaasv2.loadbalancers.actions.create.modal',
      modalService);

  modalService.$inject = [
    '$modal',
    '$location',
    'horizon.framework.widgets.toast.service',
    'horizon.framework.util.i18n.gettext',
    'horizon.app.core.openstack-service-api.policy'
  ];

  /**
   * @ngdoc service
   * @ngname horizon.dashboard.project.lbaasv2.loadbalancers.actions.create.modal
   *
   * @description
   * Provides the service for opening the create load balancer modal.
   *
   * @param $modal The angular bootstrap $modal service.
   * @param $location The angular $location service.
   * @param toastService The horizon toast service.
   * @param gettext The horizon gettext function for translation.
   * @param policy The horizon policy service.
   * @returns The modal service for the create load balancer workflow.
   */

  function modalService($modal, $location, toastService, gettext, policy) {

    var service = {
      allowed: allowed,
      perform: perform
    };

    return service;

    //////////////

    function allowed() {
      // This rule is made up and should therefore always pass. I assume at some point there
      // will be a valid rule similar to this that we will want to use.
      return policy.ifAllowed({ rules: [['neutron', 'create_loadbalancer']] });
    }

    function perform() {
      var spec = {
        backdrop: 'static',
        controller: 'ModalContainerController',
        template: '<wizard ng-controller="CreateLoadBalancerWizardController"></wizard>',
        windowClass: 'modal-dialog-wizard',
        // ModalContainerController requires a launchContext parameter...
        resolve: {
          launchContext: null
        }
      };
      var modal = $modal.open(spec);
      modal.result.then(function(response) {
        toastService.add('success', gettext('A new load balancer is being created.'));
        $location.path('project/ngloadbalancersv2/detail/' + response.data.id);
      });
    }

  }
})();
