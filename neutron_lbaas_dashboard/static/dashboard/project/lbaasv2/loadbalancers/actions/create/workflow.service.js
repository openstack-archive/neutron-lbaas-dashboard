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
    .factory('horizon.dashboard.project.lbaasv2.loadbalancers.actions.create.workflow',
      createLoadBalancerWorkflow);

  createLoadBalancerWorkflow.$inject = [
    'horizon.dashboard.project.lbaasv2.basePath',
    'horizon.app.core.workflow.factory',
    'horizon.framework.util.i18n.gettext'
  ];

  function createLoadBalancerWorkflow(basePath, dashboardWorkflow, gettext) {
    return dashboardWorkflow({
      title: gettext('Create Load Balancer'),

      steps: [
        {
          id: 'loadbalancer',
          title: gettext('Load Balancer Details'),
          templateUrl: basePath + 'loadbalancers/actions/create/details/details.html',
          helpUrl: basePath + 'loadbalancers/actions/create/details/details.help.html',
          formName: 'createLoadBalancerDetailsForm'
        },
        {
          id: 'listener',
          title: gettext('Listener Details'),
          templateUrl: basePath + 'loadbalancers/actions/create/listener/listener.html',
          helpUrl: basePath + 'loadbalancers/actions/create/listener/listener.help.html',
          formName: 'createLoadBalancerListenerForm'
        },
        {
          id: 'pool',
          title: gettext('Pool Details'),
          templateUrl: basePath + 'loadbalancers/actions/create/pool/pool.html',
          helpUrl: basePath + 'loadbalancers/actions/create/pool/pool.help.html',
          formName: 'createLoadBalancerPoolForm'
        }
      ],

      btnText: {
        finish: gettext('Create Load Balancer')
      },

      btnIcon: {
        finish: 'fa fa-cloud-download'
      }
    });
  }

})();
