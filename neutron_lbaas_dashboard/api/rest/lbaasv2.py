# Copyright 2015 IBM Corp.
#
# Licensed under the Apache License, Version 2.0 (the "License");
# you may not use this file except in compliance with the License.
# You may obtain a copy of the License at
#
#    http://www.apache.org/licenses/LICENSE-2.0
#
# Unless required by applicable law or agreed to in writing, software
# distributed under the License is distributed on an "AS IS" BASIS,
# WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
# See the License for the specific language governing permissions and
# limitations under the License.
"""API over the neutron LBaaS v2 service.
"""

from six.moves import _thread as thread
from time import sleep

from django.views import generic

from horizon import conf

from openstack_dashboard.api import neutron
from openstack_dashboard.api.rest import urls
from openstack_dashboard.api.rest import utils as rest_utils

neutronclient = neutron.neutronclient


def poll_loadbalancer_status(request, loadbalancer_id, callback,
                             from_state='PENDING_UPDATE', to_state='ACTIVE',
                             callback_kwargs=None):
    """Poll for the status of the load balancer.

    Polls for the status of the load balancer and calls a function when the
    status changes to a specified state.

    :param request: django request object
    :param loadbalancer_id: id of the load balancer to poll
    :param callback: function to call when polling is complete
    :param from_state: initial expected state of the load balancer
    :param to_state: state to check for
    :param callback_kwargs: kwargs to pass into the callback function
    """
    interval = conf.HORIZON_CONFIG['ajax_poll_interval'] / 1000.0
    status = from_state
    while status == from_state:
        sleep(interval)
        lb = neutronclient(request).show_loadbalancer(
            loadbalancer_id).get('loadbalancer')
        status = lb['provisioning_status']

    if status == to_state:
        kwargs = {'loadbalancer_id': loadbalancer_id}
        if callback_kwargs:
            kwargs.update(callback_kwargs)
        callback(request, **kwargs)


def create_listener(request, **kwargs):
    """Create a new listener.

    """
    data = request.DATA
    listenerSpec = {
        'protocol': data['listener']['protocol'],
        'protocol_port': data['listener']['port'],
        'loadbalancer_id': kwargs['loadbalancer_id']
    }
    if data['listener'].get('name'):
        listenerSpec['name'] = data['listener']['name']
    if data['listener'].get('description'):
        listenerSpec['description'] = data['listener']['description']
    listener = neutronclient(request).create_listener(
        {'listener': listenerSpec}).get('listener')

    if data.get('pool'):
        args = (request, kwargs['loadbalancer_id'], create_pool)
        kwargs = {'callback_kwargs': {'listener_id': listener['id']}}
        thread.start_new_thread(poll_loadbalancer_status, args, kwargs)

    return listener


def create_pool(request, **kwargs):
    """Create a new pool.

    """
    data = request.DATA
    poolSpec = {
        'protocol': data['pool']['protocol'],
        'lb_algorithm': data['pool']['method'],
        'listener_id': kwargs['listener_id']
    }
    if data['pool'].get('name'):
        poolSpec['name'] = data['pool']['name']
    if data['pool'].get('description'):
        poolSpec['description'] = data['pool']['description']
    pool = neutronclient(request).create_lbaas_pool(
        {'pool': poolSpec}).get('pool')

    if data.get('members'):
        args = (request, kwargs['loadbalancer_id'], add_member)
        kwargs = {'callback_kwargs': {'pool_id': pool['id'],
                                      'index': 0}}
        thread.start_new_thread(poll_loadbalancer_status, args, kwargs)
    elif data.get('monitor'):
        args = (request, kwargs['loadbalancer_id'], add_monitor)
        kwargs = {'callback_kwargs': {'pool_id': pool['id']}}
        thread.start_new_thread(poll_loadbalancer_status, args, kwargs)

    return pool


def add_member(request, **kwargs):
    """Add a member to a pool.

    """
    data = request.DATA
    members = data['members']
    index = kwargs['index']
    member = members[index]
    memberSpec = {
        'address': member['address'],
        'protocol_port': member['port'],
        'subnet_id': member['subnet']
    }
    if member.get('weight'):
        memberSpec['weight'] = member['weight']
    member = neutronclient(request).create_lbaas_member(
        kwargs['pool_id'], {'member': memberSpec}).get('member')

    index += 1
    if len(members) > index:
        args = (request, kwargs['loadbalancer_id'], add_member)
        kwargs = {'callback_kwargs': {'pool_id': kwargs['pool_id'],
                                      'index': index}}
        thread.start_new_thread(poll_loadbalancer_status, args, kwargs)
    elif data.get('monitor'):
        args = (request, kwargs['loadbalancer_id'], add_monitor)
        kwargs = {'callback_kwargs': {'pool_id': kwargs['pool_id']}}
        thread.start_new_thread(poll_loadbalancer_status, args, kwargs)

    return member


def add_monitor(request, **kwargs):
    """Create a new health monitor for a pool.

    """
    data = request.DATA
    monitorSpec = {
        'type': data['monitor']['type'],
        'delay': data['monitor']['interval'],
        'timeout': data['monitor']['timeout'],
        'max_retries': data['monitor']['retry'],
        'pool_id': kwargs['pool_id']
    }
    if data['monitor'].get('method'):
        monitorSpec['http_method'] = data['monitor']['method']
    if data['monitor'].get('path'):
        monitorSpec['url_path'] = data['monitor']['path']
    if data['monitor'].get('status'):
        monitorSpec['expected_codes'] = data['monitor']['status']
    return neutronclient(request).create_lbaas_healthmonitor(
        {'healthmonitor': monitorSpec}).get('healthmonitor')


@urls.register
class LoadBalancers(generic.View):
    """API for load balancers.

    """
    url_regex = r'lbaas/loadbalancers/$'

    @rest_utils.ajax()
    def get(self, request):
        """List load balancers for current project.

        The listing result is an object with property "items".
        """
        tenant_id = request.user.project_id
        result = neutronclient(request).list_loadbalancers(tenant_id=tenant_id)
        return {'items': result.get('loadbalancers')}

    @rest_utils.ajax()
    def post(self, request):
        """Create a new load balancer.

        Creates a new load balancer as well as other optional resources such as
        a listener, pool, monitor, etc.
        """
        data = request.DATA
        spec = {
            'vip_subnet_id': data['loadbalancer']['subnet']
        }
        if data['loadbalancer'].get('name'):
            spec['name'] = data['loadbalancer']['name']
        if data['loadbalancer'].get('description'):
            spec['description'] = data['loadbalancer']['description']
        if data['loadbalancer'].get('ip'):
            spec['vip_address'] = data['loadbalancer']['ip']
        loadbalancer = neutronclient(request).create_loadbalancer(
            {'loadbalancer': spec}).get('loadbalancer')
        if data.get('listener'):
            # There is work underway to add a new API to LBaaS v2 that will
            # allow us to pass in all information at once. Until that is
            # available we use a separate thread to poll for the load
            # balancer status and create the other resources when it becomes
            # active.
            args = (request, loadbalancer['id'], create_listener)
            kwargs = {'from_state': 'PENDING_CREATE'}
            thread.start_new_thread(poll_loadbalancer_status, args, kwargs)
        return loadbalancer


@urls.register
class LoadBalancer(generic.View):
    """API for retrieving a single load balancer.

    """
    url_regex = r'lbaas/loadbalancers/(?P<loadbalancer_id>[^/]+)/$'

    @rest_utils.ajax()
    def get(self, request, loadbalancer_id):
        """Get a specific load balancer.

        http://localhost/api/lbaas/loadbalancers/cc758c90-3d98-4ea1-af44-aab405c9c915
        """
        lb = neutronclient(request).show_loadbalancer(loadbalancer_id)
        return lb.get('loadbalancer')

    @rest_utils.ajax()
    def put(self, request, loadbalancer_id):
        """Edit a load balancer.

        """
        data = request.DATA
        spec = {}
        if data['loadbalancer'].get('name'):
            spec['name'] = data['loadbalancer']['name']
        if data['loadbalancer'].get('description'):
            spec['description'] = data['loadbalancer']['description']
        return neutronclient(request).update_loadbalancer(
            loadbalancer_id, {'loadbalancer': spec}).get('loadbalancer')


@urls.register
class Listeners(generic.View):
    """API for load balancer listeners.

    """
    url_regex = r'lbaas/listeners/$'

    @rest_utils.ajax()
    def get(self, request):
        """List of listeners for the current project.

        The listing result is an object with property "items".
        """
        loadbalancer_id = request.GET.get('loadbalancerId')
        tenant_id = request.user.project_id
        result = neutronclient(request).list_listeners(tenant_id=tenant_id)
        listener_list = result.get('listeners')
        if loadbalancer_id:
            listener_list = self._filter_listeners(listener_list,
                                                   loadbalancer_id)
        return {'items': listener_list}

    def _filter_listeners(self, listener_list, loadbalancer_id):
        filtered_listeners = []

        for listener in listener_list:
            if listener['loadbalancers'][0]['id'] == loadbalancer_id:
                filtered_listeners.append(listener)

        return filtered_listeners


@urls.register
class Listener(generic.View):
    """API for retrieving a single listener.

    """
    url_regex = r'lbaas/listeners/(?P<listener_id>[^/]+)/$'

    @rest_utils.ajax()
    def get(self, request, listener_id):
        """Get a specific listener.

        http://localhost/api/lbaas/listeners/cc758c90-3d98-4ea1-af44-aab405c9c915
        """
        lb = neutronclient(request).show_listener(listener_id)
        return lb.get('listener')


@urls.register
class Pool(generic.View):
    """API for retrieving a single pool.

    """
    url_regex = r'lbaas/pools/(?P<pool_id>[^/]+)/$'

    @rest_utils.ajax()
    def get(self, request, pool_id):
        """Get a specific pool.

        http://localhost/api/lbaas/pools/cc758c90-3d98-4ea1-af44-aab405c9c915
        """
        lb = neutronclient(request).show_lbaas_pool(pool_id)
        return lb.get('pool')
