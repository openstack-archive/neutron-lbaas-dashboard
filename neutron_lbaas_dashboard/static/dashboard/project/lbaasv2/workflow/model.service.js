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

        switch ((id ? 'edit' : 'create') + resource) {
          case 'createloadbalancer':
            promise = $q.all([
              lbaasv2API.getLoadBalancers().then(onGetLoadBalancers),
              neutronAPI.getSubnets().then(onGetSubnets),
              neutronAPI.getPorts().then(onGetPorts),
              novaAPI.getServers().then(onGetServers)
            ]).then(initMemberAddresses);
            model.context.submit = createLoadBalancer;
            break;
          case 'editloadbalancer':
            promise = $q.all([
              lbaasv2API.getLoadBalancer(model.context.id).then(onGetLoadBalancer),
              neutronAPI.getSubnets().then(onGetSubnets)
            ]).then(initSubnet);
            model.context.submit = editLoadBalancer;
            break;
          default:
            throw Error('Invalid resource context: ' + (id ? 'edit' : 'create') + resource);
        }

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
      cleanFinalSpecLoadBalancer(finalSpec);
      cleanFinalSpecListener(finalSpec);
      cleanFinalSpecPool(finalSpec);
      cleanFinalSpecMembers(finalSpec);
      cleanFinalSpecMonitor(finalSpec);
      removeNulls(finalSpec);
      return model.context.submit(finalSpec);
    }

    function createLoadBalancer(spec) {
      return lbaasv2API.createLoadBalancer(spec);
    }

    function editLoadBalancer(spec) {
      return lbaasv2API.editLoadBalancer(model.context.id, spec);
    }

    function cleanFinalSpecLoadBalancer(finalSpec) {
      var context = model.context;

      // Load balancer requires subnet
      if (!finalSpec.loadbalancer.subnet) {
        delete finalSpec.loadbalancer;
      } else {
        finalSpec.loadbalancer.subnet = finalSpec.loadbalancer.subnet.id;
      }

      // Cannot edit the subnet
      if (context.resource === 'loadbalancer' && context.id) {
        delete finalSpec.subnet;
        delete finalSpec.ip;
      }
    }

    function cleanFinalSpecListener(finalSpec) {

      // Listener requires protocol and port
      if (!finalSpec.listener.protocol || !finalSpec.listener.port) {
        delete finalSpec.listener;
      }
    }

    function cleanFinalSpecPool(finalSpec) {
      var resource = model.context.resource;

      // Pool requires protocol and method, and also the listener
      if (resource !== 'pool' && !finalSpec.listener ||
          !finalSpec.pool.protocol ||
          !finalSpec.pool.method) {
        delete finalSpec.pool;
      }
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
      angular.forEach(response.data.items, function nameExists(lb) {
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
      angular.forEach(response.data.items, function addMember(server) {
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
      angular.forEach(model.members, function initAddresses(member) {
        var memberPorts = ports.filter(function filterPortByDevice(port) {
          return port.device_id === member.id;
        });
        member.addresses = [];
        angular.forEach(memberPorts, function addAddressesForPort(port) {
          angular.forEach(port.fixed_ips, function addAddress(ip) {
            member.addresses.push({
              ip: ip.ip_address,
              subnet: ip.subnet_id
            });
          });
        });
        member.address = member.addresses[0];
      });
    }

    function onGetLoadBalancer(response) {
      var loadbalancer = response.data;
      var spec = model.spec.loadbalancer;
      spec.name = loadbalancer.name || '';
      spec.description = loadbalancer.description || '';
      spec.ip = loadbalancer.vip_address || '';
      spec.subnet = loadbalancer.vip_subnet_id;
    }

    function initSubnet() {
      var subnet = model.subnets.filter(function filterSubnetsByLoadBalancer(s) {
        return s.id === model.spec.loadbalancer.subnet;
      })[0];
      model.spec.loadbalancer.subnet = subnet;
    }

    return model;
  }

})();
