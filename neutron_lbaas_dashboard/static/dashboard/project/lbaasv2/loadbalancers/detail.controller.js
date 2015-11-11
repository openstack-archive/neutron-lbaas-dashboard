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
    .controller('LoadBalancerDetailController', LoadBalancerDetailController);

  LoadBalancerDetailController.$inject = [
    'horizon.dashboard.project.lbaasv2.loadbalancers.basePath',
    'horizon.app.core.openstack-service-api.lbaasv2',
    '$routeParams'
  ];

  /**
   * @ngdoc controller
   * @name LoadBalancerDetailController
   *
   * @description
   * Controller for the LBaaS v2 load balancers detail page.
   */
  function LoadBalancerDetailController(basepath, api, $routeParams) {

    var ctrl = this;
    ctrl.loadbalancer = {};
    ctrl.path = basepath;

    var loadbalancerId = $routeParams.loadbalancerId;

    init();

    ////////////////////////////////

    function init() {
      api.getLoadBalancer(loadbalancerId).success(success);
    }

    function success(response) {
      ctrl.loadbalancer = response;
    }

  }

})();
