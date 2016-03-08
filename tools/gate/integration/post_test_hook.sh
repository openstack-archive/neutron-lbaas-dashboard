#!/bin/bash

# This script will be executed inside post_test_hook function in devstack gate

set -x

DIR=${BASH_SOURCE%/*}
source $DIR/commons $@

set +e
cd /opt/stack/new/neutron-lbaas-dashboard
sudo -H -u stack tox -e py27integration
retval=$?
set -e

if [ -d ${NEUTRON_LBAAS_DASHBOARD_SCREENSHOTS_DIR}/ ]; then
  cp -r ${NEUTRON_LBAAS_DASHBOARD_SCREENSHOTS_DIR}/ /home/jenkins/workspace/gate-neutron-lbaas-dashboard-dsvm-integration/
fi
exit $retval
