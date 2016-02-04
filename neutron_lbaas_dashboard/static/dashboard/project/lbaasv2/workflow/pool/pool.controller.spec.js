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

  describe('Create Pool Details Step', function() {
    var ctrl;
    var availableMembers = [{port: ''}, {port: ''}];
    var allocatedMembers = [{port: ''}, {port: ''}];

    beforeEach(module('horizon.dashboard.project.lbaasv2'));

    beforeEach(inject(function($controller) {
      var scope = {
        model: {
          members: availableMembers,
          spec: {
            members: allocatedMembers
          }
        }
      };
      ctrl = $controller('CreatePoolDetailsController', { $scope: scope });
    }));

    it('should define protocolChange function', function() {
      expect(ctrl.protocolChange).toBeDefined();
    });

    it('should update member ports on protocol change to HTTP', function() {
      ctrl.protocolChange('HTTP');

      availableMembers.concat(allocatedMembers).forEach(function(member) {
        expect(member.port).toBe(80);
      });
    });

    it('should update member ports on protocol change to HTTPS', function() {
      ctrl.protocolChange('HTTPS');

      availableMembers.concat(allocatedMembers).forEach(function(member) {
        expect(member.port).toBe(443);
      });
    });

    it('should update member ports on protocol change to TCP', function() {
      ctrl.protocolChange('TCP');

      availableMembers.concat(allocatedMembers).forEach(function(member) {
        expect(member.port).toBeUndefined();
      });
    });
  });
})();
