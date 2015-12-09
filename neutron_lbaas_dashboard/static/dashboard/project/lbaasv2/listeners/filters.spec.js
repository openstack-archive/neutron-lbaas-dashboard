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

  describe('LBaaS v2 Listeners Filters', function () {
    beforeEach(module('horizon.framework.util.i18n'));
    beforeEach(module('horizon.dashboard.project.lbaasv2.listeners'));

    describe('connectionLimit', function () {
      var connectionLimitFilter;
      beforeEach(inject(function (_connectionLimitFilter_) {
        connectionLimitFilter = _connectionLimitFilter_;
      }));

      it('Returns "Unlimited" when connection limit value is -1', function () {
        expect(connectionLimitFilter(-1)).toBe('Unlimited');
      });

      it('Returns original connection limit when value is not -1', function () {
        expect(connectionLimitFilter(100)).toBe(100);
      });
    });

  });
})();
