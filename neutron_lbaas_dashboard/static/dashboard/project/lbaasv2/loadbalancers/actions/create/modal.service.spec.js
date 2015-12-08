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

  describe('LBaaS v2 Load Balancers Table Create Action Modal Service', function() {
    var modalService, modal;

    beforeEach(module('horizon.framework.util'));
    beforeEach(module('horizon.framework.conf'));
    beforeEach(module('horizon.framework.widgets.toast'));
    beforeEach(module('horizon.app.core.openstack-service-api'));
    beforeEach(module('horizon.dashboard.project.lbaasv2'));

    beforeEach(module(function($provide) {
      var response = {
        data: {
          id: '1'
        }
      };
      modal = {
        open: function() {
          return {
            result: {
              then: function(func) {
                func(response);
              }
            }
          };
        }
      };

      var policyAPI = {
        ifAllowed: function() {
          return true;
        }
      };

      $provide.value('$modal', modal);
      $provide.value('horizon.app.core.openstack-service-api.policy', policyAPI);
    }));

    beforeEach(inject(function ($injector) {
      modalService = $injector.get(
        'horizon.dashboard.project.lbaasv2.loadbalancers.actions.create.modal');
    }));

    it('should define function for opening a modal', function() {
      expect(modalService.perform).toBeDefined();
    });

    it('should be allowed based on policy', function() {
      expect(modalService.allowed()).toBe(true);
    });

    describe('modalService "perform" function tests', function() {
      var toastService, $location;

      beforeEach(inject(function ($injector) {
        toastService = $injector.get('horizon.framework.widgets.toast.service');
        $location = $injector.get('$location');
      }));

      it('calls modal.open', function() {
        spyOn(modal, 'open').and.callThrough();
        modalService.perform();

        expect(modal.open).toHaveBeenCalled();
      });

      it('calls modal.open with expected values', function() {
        spyOn(modal, 'open').and.callThrough();
        modalService.perform();

        var args = modal.open.calls.argsFor(0)[0];
        expect(args.backdrop).toBe('static');
        expect(args.controller).toBeDefined();
        expect(args.resolve).toBeDefined();
        expect(args.resolve.launchContext).toBeNull();
      });

      it('redirects upon success', function() {
        spyOn(toastService, 'add').and.callThrough();
        spyOn($location, 'path').and.callThrough();
        modalService.perform();

        expect(toastService.add).toHaveBeenCalledWith('success', jasmine.any(String));
        expect($location.path).toHaveBeenCalledWith('project/ngloadbalancersv2/detail/1');
      });

    });

  });
})();
