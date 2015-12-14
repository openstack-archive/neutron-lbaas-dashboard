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

  describe('LBaaS v2 Create Load Balancer Workflow Service', function() {
    var createLoadBalancerWorkflow;

    beforeEach(module('horizon.app.core'));
    beforeEach(module('horizon.framework.util'));
    beforeEach(module('horizon.framework.conf'));
    beforeEach(module('horizon.framework.widgets.toast'));
    beforeEach(module('horizon.dashboard.project.lbaasv2'));

    beforeEach(inject(function ($injector) {
      createLoadBalancerWorkflow = $injector.get(
        'horizon.dashboard.project.lbaasv2.loadbalancers.actions.create.workflow'
      );
    }));

    it('should be defined', function () {
      expect(createLoadBalancerWorkflow).toBeDefined();
    });

    it('should have a title property', function () {
      expect(createLoadBalancerWorkflow.title).toBeDefined();
    });

    it('should have steps defined', function () {
      expect(createLoadBalancerWorkflow.steps).toBeDefined();
      expect(createLoadBalancerWorkflow.steps.length).toBe(5);

      var forms = [
        'createLoadBalancerDetailsForm',
        'createLoadBalancerListenerForm',
        'createLoadBalancerPoolForm',
        'createLoadBalancerMembersForm',
        'createLoadBalancerMonitorForm'
      ];

      forms.forEach(function(expectedForm, idx) {
        expect(createLoadBalancerWorkflow.steps[idx].formName).toBe(expectedForm);
      });
    });

    it('can be extended', function () {
      expect(createLoadBalancerWorkflow.append).toBeDefined();
      expect(createLoadBalancerWorkflow.prepend).toBeDefined();
      expect(createLoadBalancerWorkflow.after).toBeDefined();
      expect(createLoadBalancerWorkflow.replace).toBeDefined();
      expect(createLoadBalancerWorkflow.remove).toBeDefined();
      expect(createLoadBalancerWorkflow.addController).toBeDefined();
    });

  });
})();
