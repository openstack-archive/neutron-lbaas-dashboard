=======================
neutron-lbaas-dashboard
=======================

Horizon panels for Neutron LBaaS v2

* Free software: Apache license
* Documentation: http://docs.openstack.org/developer/neutron-lbaas-dashboard
* Source: http://git.openstack.org/cgit/openstack/neutron-lbaas-dashboard
* Bugs: http://bugs.launchpad.net/neutron

Features
--------

* Please see neutron-lbaas repository


Howto
-----

1. Package the neutron_lbaas_dashboard by running::

    python setup.py sdist

   This will create a python egg in the dist folder, which can be used to
   install on the horizon machine or within horizon's python virtual
   environment.

2. Copy ``_1481_project_ng_loadbalancersv2_panel.py`` in
   ``neutron_lbaas_dashboard/enabled`` directory
   to ``openstack_dashboard/local/enabled``.

3. (Optional) Copy the policy file into horizon's policy files folder, and
   add this config ``POLICY_FILES``::

    'neutron_lbaas': 'neutron_lbaas_policy.json',

4. Django has a compressor feature that performs many enhancements for the
   delivery of static files. If the compressor feature is enabled in your
   environment (``COMPRESS_OFFLINE = True``), run the following commands::

    $ ./manage.py collectstatic
    $ ./manage.py compress

5. Finally restart your web server to enable neutron-lbaas-dashboard
   in your Horizon::

    $ sudo service apache2 restart


Howto - OpenStack deployment
----------------------------

* Tested on Mitaka on Ubuntu 14.04 on a multi-node environment with dedicated hardware.
* You need to run these steps on ALL (if you have multiple) controller nodes in your deployment.
* It is assumed you have already installed and have running, the neutron-lbaasv2-agent.

1. Install the neutron-lbaas-dashboard via pip by running::

    pip install neutron-lbaas-dashboard

2. Copy the installed panel to the relevant openstack dashboard directory::

    cp /usr/local/lib/python2.7/dist-packages/neutron_lbaas_dashboard/enabled/_1481_project_ng_loadbalancersv2_panel.py \/
    /usr/share/openstack-dashboard/openstack_dashboard/local/enabled/_1481_project_ng_loadbalancersv2_panel.py

3. Update ``/etc/openstack-dashboard/local_settings.py`` making sure that the ``enable_lb`` key in the ``OPENSTACK_NEUTRON_NETWORK`` object is set to ``True``::

    'enable_lb': True,

4. Django has a compressor feature that performs many enhancements for the
   delivery of static files. If the compressor feature is enabled in your
   environment (``COMPRESS_OFFLINE = True``), run the following commands::

    /usr/share/openstack-dashboard/manage.py collectstatic
    /usr/share/openstack-dashboard/manage.py compress

5. Finally restart your web server to enable neutron-lbaas-dashboard in your Horizon::

    service apache2 restart
