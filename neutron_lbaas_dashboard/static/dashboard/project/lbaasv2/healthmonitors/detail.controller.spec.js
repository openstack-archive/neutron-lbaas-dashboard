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

  describe('LBaaS v2 Healthmonitor Detail Controller', function() {
    var controller, lbaasv2API, healthmonitor, pool, listener, loadbalancer;

    function fakeHealthMonitorAPI() {
      return {
        success: function(callback) {
          callback(healthmonitor);
        }
      };
    }

    function fakePoolAPI() {
      return {
        success: function(callback) {
          callback(pool);
        }
      };
    }

    function fakeListenerAPI() {
      return {
        success: function(callback) {
          callback(listener);
        }
      };
    }

    function fakeLoadBalancerAPI() {
      return {
        success: function(callback) {
          callback(loadbalancer);
        }
      };
    }

    ///////////////////////

    beforeEach(module('horizon.framework.util.http'));
    beforeEach(module('horizon.framework.widgets.toast'));
    beforeEach(module('horizon.framework.conf'));
    beforeEach(module('horizon.app.core.openstack-service-api'));
    beforeEach(module('horizon.dashboard.project.lbaasv2'));

    beforeEach(inject(function($injector) {
      lbaasv2API = $injector.get('horizon.app.core.openstack-service-api.lbaasv2');
      controller = $injector.get('$controller');
      spyOn(lbaasv2API, 'getHealthMonitor').and.callFake(fakeHealthMonitorAPI);
      spyOn(lbaasv2API, 'getPool').and.callFake(fakePoolAPI);
      spyOn(lbaasv2API, 'getListener').and.callFake(fakeListenerAPI);
      spyOn(lbaasv2API, 'getLoadBalancer').and.callFake(fakeLoadBalancerAPI);
    }));

    function createController() {
      return controller('HealthMonitorDetailController', {
        api: lbaasv2API,
        $routeParams: { healthmonitorId: 'healthmonitorId' }
      });
    }

    it('should invoke lbaasv2 apis', function() {
      healthmonitor = { id: 'healthmonitorId', pools: [{id: 'poolId'}] };
      pool = { id: 'poolId', listeners: [{id: 'listenerId'}] };
      listener = { id: 'listenerId', loadbalancers: [{id: 'loadbalancerId'}] };
      loadbalancer = { id: 'loadbalancerId' };
      createController();
      expect(lbaasv2API.getHealthMonitor).toHaveBeenCalledWith('healthmonitorId');
      expect(lbaasv2API.getPool).toHaveBeenCalledWith('poolId');
      expect(lbaasv2API.getListener).toHaveBeenCalledWith('listenerId');
      expect(lbaasv2API.getLoadBalancer).toHaveBeenCalledWith('loadbalancerId');
    });

    it('should not invoke the getPool, getListener or getLoadBalancer lbaasv2 api', function() {
      healthmonitor = { id: 'healthmonitorId', pools: [] };
      createController();
      expect(lbaasv2API.getHealthMonitor).toHaveBeenCalledWith('healthmonitorId');
      expect(lbaasv2API.getPool).not.toHaveBeenCalled();
      expect(lbaasv2API.getListener).not.toHaveBeenCalled();
      expect(lbaasv2API.getLoadBalancer).not.toHaveBeenCalled();
    });

    it('should not invoke the getListener or getLoadBalancer lbaasv2 api', function() {
      healthmonitor = { id: 'healthmonitorId', pools: [{id: 'poolId'}] };
      pool = { id: 'poolId', listeners: [] };
      createController();
      expect(lbaasv2API.getHealthMonitor).toHaveBeenCalledWith('healthmonitorId');
      expect(lbaasv2API.getPool).toHaveBeenCalledWith('poolId');
      expect(lbaasv2API.getListener).not.toHaveBeenCalled();
      expect(lbaasv2API.getLoadBalancer).not.toHaveBeenCalled();
    });

    it('should not invoke getLoadBalancer lbaasv2 api', function() {
      healthmonitor = { id: 'healthmonitorId', pools: [{id: 'poolId'}] };
      pool = { id: 'poolId', listeners: [{id: 'listenerId'}] };
      listener = { id: 'listenerId', loadbalancers: [] };
      createController();
      expect(lbaasv2API.getHealthMonitor).toHaveBeenCalledWith('healthmonitorId');
      expect(lbaasv2API.getPool).toHaveBeenCalledWith('poolId');
      expect(lbaasv2API.getListener).toHaveBeenCalledWith('listenerId');
      expect(lbaasv2API.getLoadBalancer).not.toHaveBeenCalled();
    });

  });

})();
