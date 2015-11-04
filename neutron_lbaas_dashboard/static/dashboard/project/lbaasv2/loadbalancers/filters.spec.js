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

  describe('LBaaS v2 Load Balancers Filters', function () {
    beforeEach(module('horizon.framework.util.i18n'));
    beforeEach(module('horizon.dashboard.project.lbaasv2.loadbalancers'));

    describe('operatingStatus', function () {
      var operatingStatusFilter;
      beforeEach(inject(function (_operatingStatusFilter_) {
        operatingStatusFilter = _operatingStatusFilter_;
      }));

      it('Returns value when key is present', function () {
        expect(operatingStatusFilter('ONLINE')).toBe('Online');
      });

      it('Returns input when key is not present', function () {
        expect(operatingStatusFilter('unknown')).toBe('unknown');
      });
    });

    describe('provisioningStatus', function () {
      var provisioningStatusFilter;
      beforeEach(inject(function (_provisioningStatusFilter_) {
        provisioningStatusFilter = _provisioningStatusFilter_;
      }));

      it('Returns value when key is present', function () {
        expect(provisioningStatusFilter('ACTIVE')).toBe('Active');
      });

      it('Returns input when key is not present', function () {
        expect(provisioningStatusFilter('unknown')).toBe('unknown');
      });
    });

  });
})();
