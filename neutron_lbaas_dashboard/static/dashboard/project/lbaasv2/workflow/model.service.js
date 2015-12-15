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

  var push = Array.prototype.push;

  angular
    .module('horizon.dashboard.project.lbaasv2')
    .factory('horizon.dashboard.project.lbaasv2.workflow.model', workflowModel);

  workflowModel.$inject = [
    '$q',
    'horizon.app.core.openstack-service-api.neutron',
    'horizon.app.core.openstack-service-api.nova',
    'horizon.app.core.openstack-service-api.lbaasv2',
    'horizon.framework.util.i18n.gettext'
  ];

  /**
   * @ngdoc service
   * @name horizon.dashboard.project.lbaasv2.workflow.model
   *
   * @description
   * This is the M part of the MVC design pattern for the LBaaS wizard workflow. It is responsible
   * for providing data to the view of each step in the workflow and collecting the user's input
   * from the view. It is also the center point of communication between the UI and services API.
   *
   * @param $q The angular service for promises.
   * @param neutronAPI The neutron service API.
   * @param novaAPI The nova service API.
   * @param lbaasv2API The LBaaS V2 service API.
   * @param gettext The horizon gettext function for translation.
   * @returns The model service for the create load balancer workflow.
   */

  function workflowModel($q, neutronAPI, novaAPI, lbaasv2API, gettext) {
    var initPromise, ports;

    /**
     * @ngdoc model api object
     */

    var model = {

      initializing: false,
      initialized: false,
      context: null,

      /**
       * @name spec
       *
       * @description
       * A dictionary like object containing specification collected from user
       * input.
       */

      spec: null,

      subnets: [],
      members: [],
      listenerProtocols: ['TCP', 'HTTP', 'HTTPS'],
      poolProtocols: ['TCP', 'HTTP', 'HTTPS'],
      methods: ['ROUND_ROBIN', 'LEAST_CONNECTIONS', 'SOURCE_IP'],
      monitorTypes: ['HTTP', 'HTTPS', 'PING', 'TCP'],
      monitorMethods: ['GET', 'HEAD'],

      /**
       * api methods for UI controllers
       */

      initialize: initialize,
      submit: submit
    };

    /**
     * @ngdoc method
     * @name workflowModel.initialize
     * @returns {promise}
     *
     * @description
     * Send request to get all data to initialize the model.
     *
     * @param resource Resource type being created / edited, one of 'loadbalancer', 'listener',
     * 'pool', 'monitor', or 'members'.
     * @param id ID of the resource being edited.
     */

    function initialize(resource, id) {
      var promise;

      model.context = {
        resource: resource,
        id: id,
        submit: null
      };

      model.spec = {
        loadbalancer: {
          name: null,
          description: null,
          ip: null,
          subnet: null
        },
        listener: {
          name: gettext('Listener 1'),
          description: null,
          protocol: null,
          port: null
        },
        pool: {
          name: gettext('Pool 1'),
          description: null,
          protocol: null,
          method: null
        },
        monitor: {
          type: null,
          interval: null,
          retry: null,
          timeout: null,
          method: 'GET',
          status: '200',
          path: '/'
        },
        members: []
      };

      if (model.initializing) {
        promise = initPromise;
      } else {
        model.initializing = true;

        var promises = [];

        promises.push(lbaasv2API.getLoadBalancers().then(onGetLoadBalancers));
        promises.push(neutronAPI.getSubnets().then(onGetSubnets));
        promises.push(neutronAPI.getPorts().then(onGetPorts));
        promises.push(novaAPI.getServers().then(onGetServers));
        model.context.submit = createLoadBalancer;

//        // Create load balancer (default)
//        if (resource === 'loadbalancer' && !id) {
//          promises.push(lbaasv2API.getLoadBalancers().then(onGetLoadBalancers));
//          promises.push(neutronAPI.getSubnets().then(onGetSubnets));
//          promises.push(neutronAPI.getPorts().then(onGetPorts));
//          promises.push(novaAPI.getServers().then(onGetServers));
//          model.context.submit = createLoadBalancer;
//        }
//        // Edit load balancer
//        else if (resource === 'loadbalancer' && id) {
//          // Get load balancer
//          model.context.submit = editLoadBalancer;
//        }
//        // Create listener
//        else if (resource === 'listener' && !id) {
//          promises.push(neutronAPI.getSubnets().then(onGetSubnets));
//          promises.push(neutronAPI.getPorts().then(onGetPorts));
//          promises.push(novaAPI.getServers().then(onGetServers));
//          model.context.submit = createListener;
//        }
//        // Edit listener
//        else if (resource === 'listener' && id) {
//          // Get listener, pool, members, monitor
//          model.context.submit = editListener;
//        }
//        // Edit pool
//        else if (resource === 'pool' && id) {
//          // Get pool, members, monitor
//          model.context.submit = editPool;
//        }
//        // Edit monitor
//        else if (resource === 'monitor' && id) {
//          // Get monitor
//          model.context.submit = editMonitor;
//        }
//        // Edit members
//        else if (resource === 'members' && id) {
//          // Get pool members by pool id
//          model.context.submit = editMembers;
//        }

        promise = $q.all(promises);
        promise.then(onInitSuccess, onInitFail);
      }

      return promise;
    }

    function onInitSuccess() {
      initMemberAddresses();
      model.initializing = false;
      model.initialized = true;
    }

    function onInitFail() {
      model.initializing = false;
      model.initialized = false;
    }

    /**
     * @ngdoc method
     * @name workflowModel.submit
     * @returns {promise}
     *
     * @description
     * Send request for completing the wizard.
     *
     * @returns Response from the LBaaS V2 API.
     */

    function submit() {
      var finalSpec = angular.copy(model.spec);
      var resource = model.context.resource;

      // Load balancer requires subnet
      if (!finalSpec.loadbalancer.subnet) {
        delete finalSpec.loadbalancer;
      } else {
        finalSpec.loadbalancer.subnet = finalSpec.loadbalancer.subnet.id;
      }

      // Listener requires protocol and port
      if (!finalSpec.listener.protocol || !finalSpec.listener.port) {
        delete finalSpec.listener;
      }

      // Pool requires protocol and method, and also the listener
      if (resource !== 'pool' && !finalSpec.listener ||
          !finalSpec.pool.protocol ||
          !finalSpec.pool.method) {
        delete finalSpec.pool;
      }

      cleanFinalSpecMembers(finalSpec);
      cleanFinalSpecMonitor(finalSpec);
      removeNulls(finalSpec);

      return model.context.submit(finalSpec);
    }

    function createLoadBalancer(spec) {
      return lbaasv2API.createLoadBalancer(spec);
    }

    function cleanFinalSpecMembers(finalSpec) {

      // Members require a pool, address, subnet, and port but the wizard requires the address,
      // subnet, and port so we can assume those exist here.
      if (!finalSpec.pool || finalSpec.members.length === 0) {
        delete finalSpec.members;
      }

      angular.forEach(finalSpec.members, function cleanMember(member) {
        delete member.id;
        delete member.addresses;
        delete member.name;
        delete member.description;
        member.subnet = member.address.subnet;
        member.address = member.address.ip;
      });
    }

    function cleanFinalSpecMonitor(finalSpec) {

      // Monitor requires a pool, interval, retry count, and timeout
      if (!finalSpec.pool ||
          !angular.isNumber(finalSpec.monitor.interval) ||
          !angular.isNumber(finalSpec.monitor.retry) ||
          !angular.isNumber(finalSpec.monitor.timeout)) {
        delete finalSpec.monitor;
      }

      // Only include necessary monitor properties
      if (finalSpec.monitor && finalSpec.monitor.type !== 'HTTP') {
        delete finalSpec.monitor.method;
        delete finalSpec.monitor.status;
        delete finalSpec.monitor.path;
      }
    }

    function removeNulls(finalSpec) {
      angular.forEach(finalSpec, function deleteNullsForGroup(group, groupName) {
        angular.forEach(group, function deleteNullValue(value, key) {
          if (value === null) {
            delete finalSpec[groupName][key];
          }
        });
      });
    }

    function onGetLoadBalancers(response) {
      var existingNames = {};
      angular.forEach(response.data.items, function(lb) {
        existingNames[lb.name] = 1;
      });
      var name;
      var index = 0;
      do {
        index += 1;
        name = interpolate(gettext('Load Balancer %(index)s'), { index: index }, true);
      } while (name in existingNames);
      model.spec.loadbalancer.name = name;
    }

    function onGetSubnets(response) {
      model.subnets.length = 0;
      push.apply(model.subnets, response.data.items);
    }

    function onGetServers(response) {
      model.members.length = 0;
      var members = [];
      angular.forEach(response.data.items, function(server) {
        members.push({
          id: server.id,
          name: server.name,
          description: server.description,
          weight: 1
        });
      });
      push.apply(model.members, members);
    }

    function onGetPorts(response) {
      ports = response.data.items;
    }

    function initMemberAddresses() {
      angular.forEach(model.members, function(member) {
        var memberPorts = ports.filter(function(port) {
          return port.device_id === member.id;
        });
        member.addresses = [];
        angular.forEach(memberPorts, function(port) {
          angular.forEach(port.fixed_ips, function(ip) {
            member.addresses.push({
              ip: ip.ip_address,
              subnet: ip.subnet_id
            });
          });
        });
        member.address = member.addresses[0];
      });
    }

    return model;
  }

})();
