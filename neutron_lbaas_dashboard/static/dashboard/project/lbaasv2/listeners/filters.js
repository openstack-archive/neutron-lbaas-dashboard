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

  angular
    .module('horizon.dashboard.project.lbaasv2.listeners')
    .filter('connectionLimit', connectionLimitFilter);

  connectionLimitFilter.$inject = [
    'horizon.framework.util.i18n.gettext'
  ];

  /**
   * @ngdoc filter
   * @name connectionLimitFilter
   * @description
   * Takes the raw listener connection limit from the API and returns 'Unlimited' if the
   * default connection limit of -1 is returned.
   * @returns The function for filtering the listener connection limit.
   */

  function connectionLimitFilter(gettext) {
    return function (input) {
      return input === -1 ? gettext('Unlimited') : input;
    };
  }

}());
