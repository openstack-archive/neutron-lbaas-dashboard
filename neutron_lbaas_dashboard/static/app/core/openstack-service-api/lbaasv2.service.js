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
    .module('horizon.app.core.openstack-service-api')
    .factory('horizon.app.core.openstack-service-api.lbaasv2', lbaasv2API);

  lbaasv2API.$inject = [
    'horizon.framework.util.http.service',
    'horizon.framework.widgets.toast.service'
  ];

  /**
   * @ngdoc service
   * @name horizon.app.core.openstack-service-api.loadbalancers
   * @description Provides direct pass through to neutron LBaaS v2 with NO abstraction.
   */
  function lbaasv2API(apiService, toastService) {
    var service = {
      getLoadBalancers: getLoadBalancers,
      getLoadBalancer: getLoadBalancer
    };

    return service;

    ///////////////

    // Load Balancers

    /**
     * @name horizon.app.core.openstack-service-api.lbaasv2.getLoadBalancers
     * @description
     * Get a list of load balancers.
     *
     * The listing result is an object with property "items". Each item is
     * a load balancer.
     */
    function getLoadBalancers() {
      return apiService.get('/api/lbaas/loadbalancers/')
        .error(function () {
          toastService.add('error', gettext('Unable to retrieve load balancers.'));
        });
    }

    /**
     * @name horizon.app.core.openstack-service-api.lbaasv2.getLoadBalancer
     * @description
     * Get a single load balancer by ID
     * @param {string} id
     * Specifies the id of the load balancer to request.
     */
    function getLoadBalancer(id) {
      return apiService.get('/api/lbaas/loadbalancers/' + id)
        .error(function () {
          toastService.add('error', gettext('Unable to retrieve load balancer.'));
        });
    }

  }
}());
