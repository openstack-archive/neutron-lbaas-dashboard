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
(function () {
  'use strict';

  angular
    .module('horizon.dashboard.project.lbaasv2.loadbalancers')
    .filter('operatingStatus', operatingStatusFilter)
    .filter('provisioningStatus', provisioningStatusFilter);

  operatingStatusFilter.$inject = [
    'horizon.framework.util.i18n.gettext'
  ];

  provisioningStatusFilter.$inject = [
    'horizon.framework.util.i18n.gettext'
  ];

  /**
   * @ngdoc filter
   * @name operatingStatusFilter
   * @description
   * Takes raw load balancer operating status from the API and returns the user friendly status.
   * @param gettext The horizon gettext function for translation.
   * @returns The function for filtering the load balancer operating status.
   */

  function operatingStatusFilter(gettext) {
    var statuses = {
      'ONLINE': gettext('Online'),
      'OFFLINE': gettext('Offline'),
      'DEGRADED': gettext('Degraded'),
      'ERROR': gettext('Error')
    };

    return function (input) {
      var result = statuses[input];
      return angular.isDefined(result) ? result : input;
    };
  }

  /**
   * @ngdoc filter
   * @name provisioningStatusFilter
   * @description
   * Takes raw load balancer provisioning status from the API and returns the user friendly status.
   * @param gettext The horizon gettext function for translation.
   * @returns The function for filtering the load balancer provisioning status.
   */

  function provisioningStatusFilter(gettext) {
    var statuses = {
      'ACTIVE': gettext('Active'),
      'PENDING_CREATE': gettext('Pending Create'),
      'PENDING_UPDATE': gettext('Pending Update'),
      'PENDING_DELETE': gettext('Pending Delete'),
      'ERROR': gettext('Error')
    };

    return function (input) {
      var result = statuses[input];
      return angular.isDefined(result) ? result : input;
    };
  }

}());
