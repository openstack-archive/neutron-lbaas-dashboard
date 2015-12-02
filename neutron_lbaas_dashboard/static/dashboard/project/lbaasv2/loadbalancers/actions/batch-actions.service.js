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

  angular
    .module('horizon.dashboard.project.lbaasv2.loadbalancers')
    .factory('horizon.dashboard.project.lbaasv2.loadbalancers.actions.batchActions',
      tableBatchActions);

  tableBatchActions.$inject = [
    'horizon.dashboard.project.lbaasv2.loadbalancers.actions.create.modal',
    'horizon.dashboard.project.lbaasv2.basePath',
    'horizon.framework.util.i18n.gettext'
  ];

  /**
   * @ngdoc service
   * @ngname horizon.dashboard.project.lbaasv2.loadbalancers.actions.batchActions
   *
   * @description
   * Provides the service for the Load Balancers table batch actions.
   *
   * @param createModal The create action modal service.
   * @param basePath The lbaasv2 module base path.
   * @param gettext The horizon gettext function for translation.
   * @returns Load balancers table batch actions service object.
   */

  function tableBatchActions(createModal, basePath, gettext) {

    var service = {
      actions: actions
    };

    return service;

    ///////////////

    function actions() {
      return [{
        service: createModal,
        template: {
          url: basePath + 'loadbalancers/actions/create/action.template.html',
          text: gettext('Create Load Balancer')
        }
      }];
    }
  }

})();
