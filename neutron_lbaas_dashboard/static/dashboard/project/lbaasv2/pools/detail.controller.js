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
    .module('horizon.dashboard.project.lbaasv2.pools')
    .controller('PoolDetailController', PoolDetailController);

  PoolDetailController.$inject = [
    'horizon.app.core.openstack-service-api.lbaasv2',
    '$routeParams',
    'horizon.framework.util.i18n.gettext'
  ];

  /**
   * @ngdoc controller
   * @name PoolDetailController
   *
   * @description
   * Controller for the LBaaS v2 pool detail page.
   *
   * @param api The LBaaS v2 API service.
   * @param $routeParams The angular $routeParams service.
   * @param gettext The horizon gettext function for translation.
   * @returns undefined
   */

  function PoolDetailController(api, $routeParams, gettext) {
    var ctrl = this;
    ctrl.pool = {};
    ctrl.listener = {};
    ctrl.loadbalancer = {};
    ctrl.lb_algorithm_mappings = {
      'ROUND_ROBIN': gettext('Round Robin'),
      'LEAST_CONNECTIONS': gettext('Least Connections'),
      'SOURCE_IP': gettext('Source IP')
    };

    var poolId = $routeParams.poolId;

    init();

    ////////////////////////////////

    function init() {
      api.getPool(poolId).success(poolSuccess);
    }

    function poolSuccess(response) {
      ctrl.pool = response;
      if (ctrl.pool.hasOwnProperty('listeners') &&
        ctrl.pool.listeners.length > 0) {
        getListenerDetails(ctrl.pool.listeners[0].id);
      }
    }

    function getListenerDetails(listenerId) {
      api.getListener(listenerId).success(listenerSuccess);
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
