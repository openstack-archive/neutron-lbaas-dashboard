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

  describe('LBaaS v2 Module', function () {
    it('should be defined', function () {
      expect(angular.module('horizon.dashboard.project.lbaasv2')).toBeDefined();
    });
  });

  describe('LBaaS v2 Module Base Path', function () {
    var basePath, staticUrl;

    beforeEach(module('horizon.dashboard.project.lbaasv2'));

    beforeEach(inject(function ($injector) {
      basePath = $injector.get('horizon.dashboard.project.lbaasv2.basePath');
      staticUrl = $injector.get('$window').STATIC_URL;
    }));

    it('should be defined', function () {
      expect(basePath).toBeDefined();
    });

    it('should be correct', function () {
      expect(basePath).toEqual(staticUrl + 'dashboard/project/lbaasv2/');
    });
  });

  describe('LBaaS v2 Module Config', function () {
    var $routeProvider, $locationProvider, basePath;

    beforeEach(function() {
      // Create a dummy module so that we can test $routeProvider and $locationProvider calls
      // in our actual config block.
      angular.module('configTest', [])
        .config(function(_$routeProvider_, _$locationProvider_, $windowProvider) {
          $routeProvider = _$routeProvider_;
          $locationProvider = _$locationProvider_;
          basePath = $windowProvider.$get().STATIC_URL + 'dashboard/project/lbaasv2/';
          spyOn($routeProvider, 'when').and.callThrough();
          spyOn($locationProvider, 'html5Mode').and.callThrough();
        });
      module('ngRoute');
      module('configTest');
      module('horizon.dashboard.project.lbaasv2');
      inject();
    });

    it('should use html5 mode', function () {
      expect($locationProvider.html5Mode).toHaveBeenCalledWith(true);
    });

    it('should route URLs', function () {
      var href = '/project/ngloadbalancersv2/';
      var routes = [
        [
          href,
          {
            templateUrl: basePath + 'loadbalancers/table.html'
          }
        ],
        [
          href + 'detail/:loadbalancerId',
          {
            templateUrl: basePath + 'loadbalancers/detail.html'
          }
        ]
      ];

      expect($routeProvider.when.calls.count()).toBe(2);
      angular.forEach($routeProvider.when.calls.all(), function(call, i) {
        expect(call.args).toEqual(routes[i]);
      });
    });
  });

})();
