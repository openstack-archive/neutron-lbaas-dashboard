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

  describe('LBaaS v2 Create Load Balancer Workflow Model Service', function() {
    var model, $q, scope;

    beforeEach(module('horizon.framework.util.i18n'));
    beforeEach(module('horizon.dashboard.project.lbaasv2'));

    beforeEach(module(function($provide) {
      $provide.value('horizon.app.core.openstack-service-api.lbaasv2', {
        getLoadBalancers: function() {
          var loadbalancers = [ { name: 'Load Balancer 1' }, { name: 'Load Balancer 2' } ];

          var deferred = $q.defer();
          deferred.resolve({ data: { items: loadbalancers } });

          return deferred.promise;
        },
        createLoadBalancer: function(spec) {
          return spec;
        }
      });

      $provide.value('horizon.app.core.openstack-service-api.neutron', {
        getSubnets: function() {
          var subnets = [ { id: 'subnet-1', name: 'subnet-1' },
                          { id: 'subnet-2', name: 'subnet-2' } ];

          var deferred = $q.defer();
          deferred.resolve({ data: { items: subnets } });

          return deferred.promise;
        },
        getPorts: function() {
          var ports = [ { device_id: '1',
                          fixed_ips: [{ ip_address: '1.2.3.4', subnet_id: '1' },
                                      { ip_address: '2.3.4.5', subnet_id: '2' }] },
                        { device_id: '2',
                          fixed_ips: [{ ip_address: '3.4.5.6', subnet_id: '1' },
                                      { ip_address: '4.5.6.7', subnet_id: '2' }] } ];

          var deferred = $q.defer();
          deferred.resolve({ data: { items: ports } });

          return deferred.promise;
        }
      });

      $provide.value('horizon.app.core.openstack-service-api.nova', {
        getServers: function() {
          var servers = [ { id: '1', name: 'server-1' },
                          { id: '2', name: 'server-2' } ];

          var deferred = $q.defer();
          deferred.resolve({ data: { items: servers } });

          return deferred.promise;
        }
      });
    }));

    beforeEach(inject(function ($injector) {
      model = $injector.get(
        'horizon.dashboard.project.lbaasv2.loadbalancers.actions.create.model'
      );
      $q = $injector.get('$q');
      scope = $injector.get('$rootScope').$new();
    }));

    describe('Initial object (pre-initialize)', function() {

      it('is defined', function() {
        expect(model).toBeDefined();
      });

      it('has initialization status parameters', function() {
        expect(model.initializing).toBeDefined();
        expect(model.initialized).toBeDefined();
      });

      it('does not yet have a spec', function() {
        expect(model.spec).toBeNull();
      });

      it('has empty subnets array', function() {
        expect(model.subnets).toEqual([]);
      });

      it('has empty members array', function() {
        expect(model.members).toEqual([]);
      });

      it('has array of pool protocols', function() {
        expect(model.poolProtocols).toEqual(['TCP', 'HTTP', 'HTTPS']);
      });

      it('has array of listener protocols', function() {
        expect(model.listenerProtocols).toEqual(['TCP', 'HTTP', 'HTTPS']);
      });

      it('has array of pool methods', function() {
        expect(model.methods).toEqual(['ROUND_ROBIN', 'LEAST_CONNECTIONS', 'SOURCE_IP']);
      });

      it('has array of monitor types', function() {
        expect(model.monitorTypes).toEqual(['HTTP', 'HTTPS', 'PING', 'TCP']);
      });

      it('has array of monitor methods', function() {
        expect(model.monitorMethods).toEqual(['GET', 'HEAD']);
      });

      it('has an "initialize" function', function() {
        expect(model.initialize).toBeDefined();
      });

      it('has a "createLoadBalancer" function', function() {
        expect(model.createLoadBalancer).toBeDefined();
      });
    });

    describe('Post initialize model', function() {

      beforeEach(function() {
        model.initialize();
        scope.$apply();
      });

      it('should initialize model properties', function() {
        expect(model.initializing).toBe(false);
        expect(model.initialized).toBe(true);
        expect(model.subnets.length).toBe(2);
        expect(model.members.length).toBe(2);
        expect(model.spec).toBeDefined();
        expect(model.spec.loadbalancer).toBeDefined();
        expect(model.spec.listener).toBeDefined();
        expect(model.spec.pool).toBeDefined();
        expect(model.spec.members).toEqual([]);
        expect(model.spec.monitor).toBeDefined();
      });

      it('should initialize names', function() {
        expect(model.spec.loadbalancer.name).toBe('Load Balancer 3');
        expect(model.spec.listener.name).toBe('Listener 1');
        expect(model.spec.pool.name).toBe('Pool 1');
      });

      it('should initialize monitor fields', function() {
        expect(model.spec.monitor.method).toBe('GET');
        expect(model.spec.monitor.status).toBe('200');
        expect(model.spec.monitor.path).toBe('/');
      });
    });

    describe('Initialization failure', function() {

      beforeEach(inject(function ($injector) {
        var neutronAPI = $injector.get('horizon.app.core.openstack-service-api.neutron');
        neutronAPI.getSubnets = function() {
          var deferred = $q.defer();
          deferred.reject('Error');
          return deferred.promise;
        };
      }));

      beforeEach(function() {
        model.initialize();
        scope.$apply();
      });

      it('should fail to be initialized on subnets error', function() {
        expect(model.initializing).toBe(false);
        expect(model.initialized).toBe(false);
        expect(model.spec.loadbalancer.name).toBe('Load Balancer 3');
        expect(model.subnets).toEqual([]);
      });
    });

    describe('Post initialize model - Initializing', function() {

      beforeEach(function() {
        model.initializing = true;
        model.initialize();
        scope.$apply();
      });

      // This is here to ensure that as people add/change spec properties, they don't forget
      // to implement tests for them.
      it('has the right number of properties', function() {
        expect(Object.keys(model.spec).length).toBe(5);
        expect(Object.keys(model.spec.loadbalancer).length).toBe(4);
        expect(Object.keys(model.spec.listener).length).toBe(4);
        expect(Object.keys(model.spec.pool).length).toBe(4);
        expect(Object.keys(model.spec.monitor).length).toBe(7);
      });

      it('sets load balancer name to null', function() {
        expect(model.spec.loadbalancer.name).toBeNull();
      });

      it('sets load balancer description to null', function() {
        expect(model.spec.loadbalancer.description).toBeNull();
      });

      it('sets load balancer ip address to null', function() {
        expect(model.spec.loadbalancer.ip).toBeNull();
      });

      it('sets load balancer subnet to null', function() {
        expect(model.spec.loadbalancer.subnet).toBeNull();
      });

      it('sets listener name to reasonable default', function() {
        expect(model.spec.listener.name).toBe('Listener 1');
      });

      it('sets listener description to null', function() {
        expect(model.spec.listener.description).toBeNull();
      });

      it('sets listener protocol to null', function() {
        expect(model.spec.listener.protocol).toBeNull();
      });

      it('sets listener port to null', function() {
        expect(model.spec.listener.port).toBeNull();
      });

      it('sets pool name to reasonable default', function() {
        expect(model.spec.pool.name).toBe('Pool 1');
      });

      it('sets pool description to null', function() {
        expect(model.spec.pool.description).toBeNull();
      });

      it('sets pool protocol to null', function() {
        expect(model.spec.pool.protocol).toBeNull();
      });

      it('sets pool method to null', function() {
        expect(model.spec.pool.method).toBeNull();
      });

      it('sets monitor type to null', function() {
        expect(model.spec.monitor.type).toBeNull();
      });

      it('sets monitor interval to null', function() {
        expect(model.spec.monitor.interval).toBeNull();
      });

      it('sets monitor retry count to null', function() {
        expect(model.spec.monitor.retry).toBeNull();
      });

      it('sets monitor timeout to null', function() {
        expect(model.spec.monitor.timeout).toBeNull();
      });

      it('sets monitor method to default', function() {
        expect(model.spec.monitor.method).toBe('GET');
      });

      it('sets monitor status code to default', function() {
        expect(model.spec.monitor.status).toBe('200');
      });

      it('sets monitor URL path to default', function() {
        expect(model.spec.monitor.path).toBe('/');
      });
    });

    describe('Create Load Balancer', function() {

      beforeEach(function() {
        model.initialize();
        scope.$apply();
      });

      it('should set final spec properties', function() {
        model.spec.loadbalancer.ip = '1.2.3.4';
        model.spec.loadbalancer.subnet = model.subnets[0];
        model.spec.listener.protocol = 'HTTPS';
        model.spec.listener.port = 80;
        model.spec.pool.name = 'pool name';
        model.spec.pool.description = 'pool description';
        model.spec.pool.protocol = 'HTTP';
        model.spec.pool.method = 'LEAST_CONNECTIONS';
        model.spec.members = [{
          address: { ip: '1.2.3.4', subnet: '1' },
          addresses: [{ ip: '1.2.3.4', subnet: '1' },
                      { ip: '2.3.4.5', subnet: '2' }],
          id: '1',
          name: 'foo',
          description: 'bar',
          port: 80,
          weight: 1
        }];
        model.spec.monitor.type = 'PING';
        model.spec.monitor.interval = 1;
        model.spec.monitor.retry = 1;
        model.spec.monitor.timeout = 1;

        var finalSpec = model.createLoadBalancer();

        expect(finalSpec.loadbalancer.name).toBe('Load Balancer 3');
        expect(finalSpec.loadbalancer.description).toBeUndefined();
        expect(finalSpec.loadbalancer.ip).toBe('1.2.3.4');
        expect(finalSpec.loadbalancer.subnet).toBe(model.subnets[0].id);
        expect(finalSpec.listener.name).toBe('Listener 1');
        expect(finalSpec.listener.description).toBeUndefined();
        expect(finalSpec.listener.protocol).toBe('HTTPS');
        expect(finalSpec.listener.port).toBe(80);
        expect(finalSpec.pool.name).toBe('pool name');
        expect(finalSpec.pool.description).toBe('pool description');
        expect(finalSpec.pool.protocol).toBe('HTTP');
        expect(finalSpec.pool.method).toBe('LEAST_CONNECTIONS');
        expect(finalSpec.members.length).toBe(1);
        expect(finalSpec.members[0].address).toBe('1.2.3.4');
        expect(finalSpec.members[0].subnet).toBe('1');
        expect(finalSpec.members[0].port).toBe(80);
        expect(finalSpec.members[0].weight).toBe(1);
        expect(finalSpec.members[0].addresses).toBeUndefined();
        expect(finalSpec.members[0].id).toBeUndefined();
        expect(finalSpec.members[0].name).toBeUndefined();
        expect(finalSpec.members[0].description).toBeUndefined();
        expect(finalSpec.monitor.type).toBe('PING');
        expect(finalSpec.monitor.interval).toBe(1);
        expect(finalSpec.monitor.retry).toBe(1);
        expect(finalSpec.monitor.timeout).toBe(1);
      });

      it('should delete listener if any required property is not set', function() {
        model.spec.loadbalancer.ip = '1.2.3.4';
        model.spec.loadbalancer.subnet = model.subnets[0];
        model.spec.listener.protocol = 'HTTPS';

        var finalSpec = model.createLoadBalancer();

        expect(finalSpec.loadbalancer).toBeDefined();
        expect(finalSpec.listener).toBeUndefined();
        expect(finalSpec.pool).toBeUndefined();
      });

      it('should delete pool if any required property is not set', function() {
        model.spec.loadbalancer.ip = '1.2.3.4';
        model.spec.loadbalancer.subnet = model.subnets[0];
        model.spec.listener.protocol = 'HTTPS';
        model.spec.listener.port = 80;

        var finalSpec = model.createLoadBalancer();

        expect(finalSpec.loadbalancer).toBeDefined();
        expect(finalSpec.listener).toBeDefined();
        expect(finalSpec.pool).toBeUndefined();
      });

      it('should delete members if none selected', function() {
        model.spec.loadbalancer.ip = '1.2.3.4';
        model.spec.loadbalancer.subnet = model.subnets[0];
        model.spec.listener.protocol = 'HTTPS';
        model.spec.listener.port = 80;
        model.spec.pool.protocol = 'HTTP';
        model.spec.pool.method = 'LEAST_CONNECTIONS';

        var finalSpec = model.createLoadBalancer();

        expect(finalSpec.loadbalancer).toBeDefined();
        expect(finalSpec.listener).toBeDefined();
        expect(finalSpec.pool).toBeDefined();
        expect(finalSpec.members).toBeUndefined();
      });

      it('should delete monitor if any required property not set', function() {
        model.spec.loadbalancer.ip = '1.2.3.4';
        model.spec.loadbalancer.subnet = model.subnets[0];
        model.spec.listener.protocol = 'HTTPS';
        model.spec.listener.port = 80;
        model.spec.pool.protocol = 'HTTP';
        model.spec.pool.method = 'LEAST_CONNECTIONS';
        model.spec.monitor.type = 'PING';
        model.spec.monitor.interval = 1;
        model.spec.monitor.retry = 1;

        var finalSpec = model.createLoadBalancer();

        expect(finalSpec.loadbalancer).toBeDefined();
        expect(finalSpec.listener).toBeDefined();
        expect(finalSpec.pool).toBeDefined();
        expect(finalSpec.members).toBeUndefined();
        expect(finalSpec.monitor).toBeUndefined();
      });
    });

  });
})();
