import React from "react";

import PropTypes from "prop-types";
import { connect } from "react-redux";
const Alertcomponent = ({ alerts }) =>
  alerts !== null &&
  alerts.map(alert => (
    <div key={alert.id} className={`alert alert-${alert.alertType}`}>
      {alert.msg}
    </div>
  ));
Alertcomponent.propTypes = {
  alerts: PropTypes.array.isRequired
};

const mapStateToProps = state => ({
  alerts: state.alert
});
export default connect(mapStateToProps)(Alertcomponent);
