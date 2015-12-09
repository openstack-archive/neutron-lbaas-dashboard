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

  describe('LBaaS v2 Listener Detail Controller', function() {
    var controller, lbaasv2API, listener;

    function fakeAPI() {
      return {
        success: function(callback) {
          callback(listener);
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
      spyOn(lbaasv2API, 'getListener').and.callFake(fakeAPI);
      spyOn(lbaasv2API, 'getLoadBalancer').and.callFake(fakeAPI);
    }));

    function createController() {
      return controller('ListenerDetailController', {
        api: lbaasv2API,
        $routeParams: { listenerId: '1234' }
      });
    }

    it('should invoke lbaasv2 apis', function() {
      listener = { id: '1234', loadbalancers: [{id: '5678'}] };
      createController();
      expect(lbaasv2API.getListener).toHaveBeenCalledWith('1234');
      expect(lbaasv2API.getLoadBalancer).toHaveBeenCalledWith('5678');
    });

    it('should not invoke getLoadBalancer lbaasv2 api', function() {
      listener = { id: '1234', loadbalancers: [] };
      createController();
      expect(lbaasv2API.getListener).toHaveBeenCalledWith('1234');
    });

  });

})();
