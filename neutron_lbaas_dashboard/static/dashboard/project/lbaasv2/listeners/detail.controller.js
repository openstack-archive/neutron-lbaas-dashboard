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
(function() {
  'use strict';

  angular
    .module('horizon.dashboard.project.lbaasv2.listeners')
    .controller('ListenerDetailController', ListenerDetailController);

  ListenerDetailController.$inject = [
    'horizon.app.core.openstack-service-api.lbaasv2',
    '$routeParams'
  ];

  /**
   * @ngdoc controller
   * @name ListenerDetailController
   *
   * @description
   * Controller for the LBaaS v2 listener detail page.
   *
   * @param api The LBaaS v2 API service.
   * @param $routeParams The angular $routeParams service.
   * @returns undefined
   */

  function ListenerDetailController(api, $routeParams) {
    var ctrl = this;
    ctrl.listener = {};
    ctrl.loadbalancer = {};

    var listenerID = $routeParams.listenerId;

    init();

    ////////////////////////////////

    function init() {
      api.getListener(listenerID).success(listenerSuccess);
    }

    function listenerSuccess(response) {
      ctrl.listener = response;

      if (ctrl.listener.hasOwnProperty('loadbalancers') &&
        ctrl.listener.loadbalancers.length > 0) {
        getLoadBalancerDetails(ctrl.listener.loadbalancers[0].id);
      }
    }

    function getLoadBalancerDetails(loadbalancerId) {
      api.getLoadBalancer(loadbalancerId).success(loadbalancerSuccess);
    }

    function loadbalancerSuccess(response) {
      ctrl.loadbalancer = response;
    }

  }

})();
