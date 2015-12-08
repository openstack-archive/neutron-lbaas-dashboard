==========================================
Neutron LBaaS v2 dashboard devstack plugin
==========================================

This directory contains the neutron-lbaas-dashboard devstack plugin.

To enable the plugin, add the following to your local.conf:

    enable_plugin neutron-lbaas-dashboard <neutron-lbaas-dashboard GITURL> [GITREF]

where

    <neutron-lbaas-dashboard GITURL> is the URL of a neutron-lbaas-dashboard repository
    [GITREF] is an optional git ref (branch/ref/tag). The default is master.

For example:

    enable_plugin neutron-lbaas-dashboard https://git.openstack.org/openstack/neutron-lbaas-dashboard

Once you enable the plugin in your local.conf, ensure ``horizon`` and
``q-lbaasv2`` services are enabled. If both of them are enabled,
neutron-lbaas-dashboard will be enabled automatically
