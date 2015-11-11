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

  /**
   * @ngdoc overview
   * @name horizon.dashboard.project.lbaasv2
   * @description
   *
   * # horizon.dashboard.project.lbaasv2
   *
   * The LBaaS v2 dashboard's top level module.
   */
  angular
    .module('horizon.dashboard.project.lbaasv2', [
      'ngRoute',
      'horizon.dashboard.project.lbaasv2.loadbalancers'
    ])
    .config(config);

  config.$inject = [
    '$windowProvider',
    '$routeProvider',
    '$locationProvider'
  ];

  function config($windowProvider, $routeProvider, $locationProvider) {
    $locationProvider.html5Mode({
      enabled: true
    }).hashPrefix('!');

    var base = '/project/ngloadbalancersv2/';
    var path = $windowProvider.$get().STATIC_URL + 'dashboard/project/lbaasv2/';

    $routeProvider
      .when(base, {
        templateUrl: path + 'loadbalancers/table.html'
      })
      .when(base + 'detail/:loadbalancerId', {
        templateUrl: path + 'loadbalancers/detail.html'
      })
  }
}());
