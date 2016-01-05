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
    .module('horizon.dashboard.project.lbaasv2.members')
    .controller('MemberDetailController', MemberDetailController);

  MemberDetailController.$inject = [
    'horizon.app.core.openstack-service-api.lbaasv2',
    '$routeParams'
  ];

  /**
   * @ngdoc controller
   * @name MemberDetailController
   *
   * @description
   * Controller for the LBaaS v2 member detail page.
   *
   * @param api The LBaaS v2 API service.
   * @param $routeParams The angular $routeParams service.
   * @returns undefined
   */

  function MemberDetailController(api, $routeParams) {
    var ctrl = this;
    ctrl.member = {};
    ctrl.pool = {};
    ctrl.listener = {};
    ctrl.loadbalancer = {};

    var poolID = $routeParams.poolId;
    var memberID = $routeParams.memberId;

    init();

    ////////////////////////////////

    function init() {
      api.getMember(poolID, memberID).success(memberSuccess);
    }

    function memberSuccess(response) {
      ctrl.member = response;
      getPoolDetails(poolID);
    }

    function getPoolDetails(poolId) {
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
