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

  describe('Listener Details Step', function() {

    beforeEach(module('horizon.framework.util.i18n'));
    beforeEach(module('horizon.dashboard.project.lbaasv2'));

    describe('ListenerDetailsController', function() {
      var ctrl, workflow, listener;

      beforeEach(inject(function($controller) {
        workflow = {
          steps: [{ id: 'listener' }],
          certificatesStep: { id: 'certificates' },
          after: angular.noop,
          remove: angular.noop
        };
        listener = {
          protocol: null
        };
        var scope = {
          model: {
            spec: {
              listener: listener
            }
          },
          workflow: workflow
        };
        ctrl = $controller('ListenerDetailsController', { $scope: scope });
      }));

      it('should define error messages for invalid fields', function() {
        expect(ctrl.portError).toBeDefined();
        expect(ctrl.certificatesError).toBeDefined();
      });

      it('should show certificates step if selecting TERMINATED_HTTPS', function() {
        listener.protocol = 'TERMINATED_HTTPS';
        workflow.steps.push(workflow.certificatesStep);
        spyOn(workflow, 'after');

        ctrl.protocolChange();
        expect(workflow.after).not.toHaveBeenCalled();

        workflow.steps.splice(1, 1);
        ctrl.protocolChange();
        expect(workflow.after).toHaveBeenCalledWith('listener', workflow.certificatesStep);
      });

      it('should hide certificates step if not selecting TERMINATED_HTTPS', function() {
        listener.protocol = 'HTTP';
        spyOn(workflow, 'remove');

        ctrl.protocolChange();
        expect(workflow.remove).not.toHaveBeenCalled();

        workflow.steps.push(workflow.certificatesStep);
        ctrl.protocolChange();
        expect(workflow.remove).toHaveBeenCalledWith('certificates');
      });

    });
  });
})();
