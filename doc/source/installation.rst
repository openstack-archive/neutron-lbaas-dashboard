============
Installation
============

At the command line::

    $ sudo pip install neutron-lbaas-dashboard

Enable the plugin::

    $ cp /usr/local/lib/python2.7/dist-packages/neutron_lbaas_dashboard/enabled/_1481_project_ng_loadbalancersv2_panel.py /opt/stack/horizon/openstack_dashboard/enabled/

Note: This file may have installed in a different location depending on your
host configuration.  For example, on CentOS it may be in
/usr/lib/python2.7/site-packages.

Run the Django update commands (answer 'yes')::

    $ /opt/stack/horizon/manage.py collectstatic
    $ /opt/stack/horizon/manage.py compress

Restart Apache::

    $ sudo service apache2 restart
