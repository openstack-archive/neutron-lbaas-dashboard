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
    .module('horizon.dashboard.project.lbaasv2.loadbalancers')
    .controller('AddMembersController', AddMembersController);

  AddMembersController.$inject = [
    '$scope',
    '$compile',
    'horizon.dashboard.project.lbaasv2.popovers',
    'horizon.framework.util.i18n.gettext'
  ];

  /**
   * @ngdoc controller
   * @name AddMembersController
   * @description
   * The `AddMembersController` controller provides functions for adding members to a pool.
   * @param $scope The angular scope object.
   * @param $compile The angular compile service.
   * @param popovers LBaaS v2 popover templates constant.
   * @param gettext The horizon gettext function for translation.
   * @returns undefined
   */

  function AddMembersController($scope, $compile, popoverTemplates, gettext) {

    var ctrl = this;

    // Error text for invalid fields
    ctrl.portError = gettext('The port must be a number between 1 and 65535.');
    ctrl.weightError = gettext('The weight must be a number between 1 and 256.');

    // Table widget properties
    ctrl.tableData = {
      available: $scope.model.members,
      allocated: $scope.model.spec.members,
      displayedAvailable: [],
      displayedAllocated: []
    };
    ctrl.tableLimits = {
      maxAllocation: -1
    };
    ctrl.tableHelp = {
      availHelpText: '',
      noneAllocText: gettext('Select members from the available members below'),
      noneAvailText: gettext('No available members')
    };

    // Functions to control the IP address popover
    ctrl.showAddressPopover = showAddressPopover;
    ctrl.hideAddressPopover = hideAddressPopover;
    ctrl.addressPopoverTarget = addressPopoverTarget;

    //////////

    function showAddressPopover(event, member) {
      var element = angular.element(event.target);
      var scope = $scope.$new(true);
      scope.member = member;
      element.popover({
        content: $compile(popoverTemplates.ipAddresses)(scope),
        html: true,
        placement: 'top',
        title: interpolate(gettext('IP Addresses (%(count)s)'),
                           { count: member.addresses.length }, true)
      });
      element.popover('show');
    }

    function hideAddressPopover(event) {
      var element = angular.element(event.target);
      element.popover('hide');
    }

    function addressPopoverTarget(member) {
      return interpolate(gettext('%(ip)s...'), { ip: member.address.ip }, true);
    }
  }
})();
