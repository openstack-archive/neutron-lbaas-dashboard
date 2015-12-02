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

  describe('LBaaS v2 Load Balancers Table Batch Actions Service', function() {
    var batchActionsService, scope;

    beforeEach(module('horizon.framework.util'));
    beforeEach(module('horizon.framework.conf'));
    beforeEach(module('horizon.framework.widgets.toast'));
    beforeEach(module('horizon.app.core.openstack-service-api'));
    beforeEach(module('horizon.dashboard.project.lbaasv2'));

    beforeEach(module(function($provide) {
      $provide.value('$modal', {});
    }));

    beforeEach(inject(function ($injector) {
      scope = $injector.get('$rootScope').$new();
      batchActionsService = $injector.get(
        'horizon.dashboard.project.lbaasv2.loadbalancers.actions.batchActions');
    }));

    it('should define correct table batch actions', function() {
      var actions = batchActionsService.actions();
      expect(actions.length).toBe(1);
      expect(actions[0].template.text).toBe('Create Load Balancer');
    });

  });
})();
