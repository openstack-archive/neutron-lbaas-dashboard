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
    .factory('horizon.dashboard.project.lbaasv2.loadbalancers.actions.create.model',
      createLoadBalancerModel);

  createLoadBalancerModel.$inject = [
    '$q',
    'horizon.app.core.openstack-service-api.neutron',
    'horizon.app.core.openstack-service-api.lbaasv2'
  ];

  /**
   * @ngdoc service
   * @name horizon.dashboard.project.lbaasv2.loadbalancers.actions.create.model
   *
   * @description
   * This is the M part of the MVC design pattern for the create load balancer wizard workflow. It
   * is responsible for providing data to the view of each step in the workflow and collecting the
   * user's input from the view for creation of the new load balancer. It is also the center point
   * of communication between the UI and services API.
   *
   * @param $q The angular service for promises.
   * @param neutronAPI The neutron service API.
   * @param lbaasv2API The LBaaS V2 service API.
   * @returns The model service for the create load balancer workflow.
   */

  function createLoadBalancerModel($q, neutronAPI, lbaasv2API) {
    var initPromise;

    /**
     * @ngdoc model api object
     */

    var model = {

      initializing: false,
      initialized: false,

      /**
       * @name spec
       *
       * @description
       * A dictionary like object containing specification collected from user
       * input. Required properties include:
       *
       * @property {String} name: The new load balancer name.
       * @property {String} subnet: The subnet for the load balancer.
       */

      spec: null,

      subnets: [],

      /**
       * api methods for UI controllers
       */

      initialize: initialize,
      createLoadBalancer: createLoadBalancer
    };

    /**
     * @ngdoc method
     * @name createLoadBalancerModel.initialize
     * @returns {promise}
     *
     * @description
     * Send request to get all data to initialize the model.
     */

    function initialize() {
      var promise;

      model.spec = {
        loadbalancer: {
          name: null,
          description: null,
          ip: null,
          subnet: null
        }
      };

      if (model.initializing) {
        promise = initPromise;
      } else {
        model.initializing = true;

        promise = $q.all([
          lbaasv2API.getLoadBalancers().then(onGetLoadBalancers),
          neutronAPI.getSubnets().then(onGetSubnets)
        ]);

        promise.then(onInitSuccess, onInitFail);
      }

      return promise;
    }

    function onInitSuccess() {
      model.initializing = false;
      model.initialized = true;
    }

    function onInitFail() {
      model.initializing = false;
      model.initialized = false;
    }

    /**
     * @ngdoc method
     * @name createLoadBalancerModel.createLoadBalancer
     * @returns {promise}
     *
     * @description
     * Send request for creating the load balancer.
     *
     * @returns Response from the LBaaS V2 API for creating a load balancer.
     */

    function createLoadBalancer() {
      var finalSpec = angular.copy(model.spec);

      // Delete null properties
      angular.forEach(finalSpec, function(group, groupName) {
        angular.forEach(group, function(value, key) {
          if (value === null) {
            delete finalSpec[groupName][key];
          }
        });
      });

      finalSpec.loadbalancer.subnet = finalSpec.loadbalancer.subnet.id;

      return lbaasv2API.createLoadBalancer(finalSpec);
    }

    function onGetLoadBalancers(response) {
      var existingNames = {};
      angular.forEach(response.data.items, function(lb) {
        existingNames[lb.name] = 1;
      });
      var name;
      var index = 0;
      var prefix = 'Load Balancer ';
      do {
        index += 1;
        name = prefix + index;
      } while (name in existingNames);
      model.spec.loadbalancer.name = name;
    }

    function onGetSubnets(response) {
      model.subnets = [];
      angular.forEach(response.data.items, function(subnet) {
        model.subnets.push(subnet);
      });
    }

    return model;
  }

})();
