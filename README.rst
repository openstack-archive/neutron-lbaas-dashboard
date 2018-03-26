========================
Team and repository tags
========================

.. image:: https://governance.openstack.org/tc/badges/neutron-lbaas-dashboard.svg
    :target: https://governance.openstack.org/tc/reference/tags/index.html

.. Change things from this point on

.. warning::
   Neutron-lbaas-dashboard is now deprecated. Please see the FAQ: https://wiki.openstack.org/wiki/Neutron/LBaaS/Deprecation

=======================
neutron-lbaas-dashboard
=======================

Horizon panels for Neutron LBaaS v2

* Free software: Apache license
* Documentation: https://docs.openstack.org/neutron-lbaas-dashboard/latest/
* Source: https://git.openstack.org/cgit/openstack/neutron-lbaas-dashboard
* Bugs: https://storyboard.openstack.org/#!/project/907

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

Enabling neutron-lbaas-dashboard and octavia-dashboard
------------------------------------------------------

In general we advise against having both dashboards running at the same
time to avoid confusing users, which is exaggerated since the dashboards
will have the same label.

In rare circumstances, e.g. as part of a migration strategy, it might be
necessary to do so. The main issue to watch out for is to avoid neutron-lbaas
and Octavia getting out of sync and neutron-lbaas-dashboard showing phantom
load balancers - this can be avoided if the sync between Octavia and
neutron-lbaas is fully enabled.

Here is a table to show some cases:

+---------------+-----------------+----------------+-----------+--------------+
| Configuration | Configuration   | neutron-lbaas- | octavia-  | Notes        |
| neutron-lbaas | Octavia         | dashboard      | dashboard |              |
|               |                 | enabled        | enabled   |              |
+---------------+-----------------+----------------+-----------+--------------+
| not installed | v2 API enabled  | not supported  | preferred |              |
+---------------+-----------------+----------------+-----------+--------------+
| octavia-driver| v2 API disabled | supported      | not       | sync         |
|               | v1 API enabled  |                | supported | required     |
+---------------+-----------------+----------------+-----------+--------------+
| octavia-driver| v2 API enabled  | supported      | preferred | sync         |
|               | v1 API enabled  |                |           | required     |
+---------------+-----------------+----------------+-----------+--------------+
| octavia-proxy | v1 API disabled | Supported (but | preferred |              |
| plugin        | v2 API enabled  | not            |           |              |
|               |                 | recommended)   |           |              |
+---------------+-----------------+----------------+-----------+--------------+
| no octavia    | not installed   | preferred      | not       |              |
| driver but    |                 |                | supported |              |
| other drivers |                 |                |           |              |
+---------------+-----------------+----------------+-----------+--------------+
| no octavia    | v2 API enabled  | preferred      | preferred | independent  |
| driver but    | v1 API disabled |                |           | services     |
| other drivers |                 |                |           |              |
+---------------+-----------------+----------------+-----------+--------------+