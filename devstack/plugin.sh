function neutron_lbaas_dashboard_install {
    setup_develop $NEUTRON_LBAAS_DASHBOARD_DIR
}

function neutron_lbaas_dashboard_configure {
    cp $NEUTRON_LBAAS_DASHBOARD_ENABLE_FILE_PATH \
        $HORIZON_DIR/openstack_dashboard/local/enabled/
}

if is_service_enabled horizon && is_service_enabled q-lbaasv2; then
    if [[ "$1" == "stack" && "$2" == "install" ]]; then
        # Perform installation of service source
        echo_summary "Installing neutron-lbaas-dashboard"
        neutron_lbaas_dashboard_install
    elif [[ "$1" == "stack" && "$2" == "post-config" ]]; then
        echo_summary "Configuring neutron-lbaas-dashboard"
        neutron_lbaas_dashboard_configure
    elif [[ "$1" == "stack" && "$2" == "extra" ]]; then
        # Initialize and start the LBaaS service
        echo_summary "Initializing neutron-lbaas-dashboard"
    fi
fi

if [[ "$1" == "unstack" ]]; then
    # Shut down LBaaS dashboard services
    :
fi

if [[ "$1" == "clean" ]]; then
    # Remove state and transient data
    # Remember clean.sh first calls unstack.sh

    # Remove lbaas-dashboard enabled file and pyc
    rm -f "$HORIZON_DIR"/openstack_dashboard/local/enabled/"$NEUTRON_LBAAS_DASHBOARD_ENABLE_FILE_NAME"*
fi
