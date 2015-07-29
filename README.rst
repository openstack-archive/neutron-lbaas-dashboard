=======================
neutron-lbaas-dashboard
=======================

Horizon panels for Neutron LBaaS

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

   This will create a python egg in the dist folder, which can be used to install
   on the horizon machine or within horizon's  python virtual environment.

2. Modify horizon's settings file to enabled neutron_lbaas_dashboard, note the two lines to add below::

    import neutron_lbaas_dashboard.enabled    # ADD THIS LINE

    ...

    INSTALLED_APPS = list(INSTALLED_APPS)  # Make sure it's mutable
    settings.update_dashboards([
       openstack_dashboard.enabled,
       openstack_dashboard.local.enabled,
       neutron_lbaas_dashboard.enabled,      # ADD THIS LINE TOO
    ], HORIZON_CONFIG, INSTALLED_APPS)

3. (Optional/TODO) Copy the policy file into horizon's policy files folder, and add this config::

    'neutron_lbaas': 'neutron_lbaas_policy.json',

4. (Optional) Add extra config settings for the add in:  TODO