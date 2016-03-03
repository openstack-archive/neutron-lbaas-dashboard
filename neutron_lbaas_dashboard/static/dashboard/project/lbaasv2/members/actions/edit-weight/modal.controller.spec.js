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
(function () {
  'use strict';

  describe('LBaaS v2 Member Edit Weight Controller', function() {
    var ctrl, api, $controller, $modalInstance, $scope, $q;
    var fail = false;

    function makePromise(reject) {
      var def = $q.defer();
      def[reject ? 'reject' : 'resolve']();
      return def.promise;
    }

    beforeEach(module('horizon.framework.util.i18n'));
    beforeEach(module('horizon.dashboard.project.lbaasv2'));

    beforeEach(module(function($provide) {
      $provide.value('$modalInstance', {
        close: angular.noop,
        dismiss: angular.noop
      });
      $provide.value('poolId', 'pool1');
      $provide.value('member', {
        id: 'member1',
        weight: 1
      });
      $provide.value('horizon.app.core.openstack-service-api.lbaasv2', {
        editMember: function() {
          return makePromise(fail);
        }
      });
    }));

    beforeEach(inject(function ($injector) {
      api = $injector.get('horizon.app.core.openstack-service-api.lbaasv2');
      $controller = $injector.get('$controller');
      $modalInstance = $injector.get('$modalInstance');
      $scope = $injector.get('$rootScope').$new();
      $q = $injector.get('$q');
      ctrl = $controller('EditWeightModalController');
    }));

    it('should define controller properties', function() {
      expect(ctrl.cancel).toBeDefined();
      expect(ctrl.save).toBeDefined();
      expect(ctrl.saving).toBe(false);
      expect(ctrl.weight).toBe(1);
      expect(ctrl.weightError).toBe('The weight must be a number between 1 and 256.');
    });

    it('should edit member weight', function() {
      spyOn(api, 'editMember').and.callThrough();
      spyOn($modalInstance, 'close');
      ctrl.save();
      $scope.$apply();
      expect(ctrl.saving).toBe(true);
      expect(api.editMember).toHaveBeenCalledWith('pool1', 'member1', { weight: 1 });
      expect($modalInstance.close).toHaveBeenCalled();
    });

    it('should dismiss modal if cancel clicked', function() {
      spyOn($modalInstance, 'dismiss');
      ctrl.cancel();
      expect($modalInstance.dismiss).toHaveBeenCalledWith('cancel');
    });

    it('should not dismiss modal if save fails', function() {
      fail = true;
      spyOn($modalInstance, 'dismiss');
      ctrl.save();
      $scope.$apply();
      expect($modalInstance.dismiss).not.toHaveBeenCalled();
      expect(ctrl.saving).toBe(false);
    });

  });

})();
