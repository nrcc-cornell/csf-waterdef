///////////////////////////////////////////////////////////////////////////////
//
// Climate Smart Farming Water Deficit Calculator
// Copyright (c) 2018 Cornell Institute for Climate Smart Solutions
// All Rights Reserved
//
// This software is published under the provisions of the GNU General Public
// License <http://www.gnu.org/licenses/>. A text copy of the license can be
// found in the file 'LICENSE' included with this software.
//
// A text copy of the copyright notice, licensing conditions and disclaimers
// is available in the file 'COPYRIGHT' included with this software.
//
///////////////////////////////////////////////////////////////////////////////

import React, { Component } from 'react';
import { inject, observer } from 'mobx-react';
import { string } from 'prop-types'
import Icon from 'react-icons-kit';
//import { statsBars } from 'react-icons-kit/ionicons/statsBars';
import { statsDots } from 'react-icons-kit/icomoon/statsDots';
//import { line_graph } from 'react-icons-kit/ikons/line_graph';

import '../../styles/Next30Button.css';

@inject("store") @observer
class Next30Button extends Component {

  static propTypes = {
    button_label: string,
  }

  static defaultProps = {
    button_label: "Go",
  }

  render() {
        const className = this.props.store.app.next30Status ? 'next30-button-active' : 'next30-button-inactive';
        const disabled = this.props.store.app.getPlantingYear===this.props.store.app.latestSelectableYear.toString() ? false : true;
        return (
            <div className="next30-label">
              <div>
                <button
                  className={className}
                  disabled={disabled}
                  onClick={() => {
                      this.props.store.app.updateNext30Status(true);
                      this.props.store.app.updateClimateChangeStatus(false);
                      this.props.store.app.updateResultsStatus(false);
                      if (this.props.store.app.popupStatus) { this.props.store.app.updatePopupStatus(); };
                      if (this.props.store.app.cropTypeInfoStatus) { this.props.store.app.updateCropTypeInfoStatus(); };
                      }
                  }
                >
                  <Icon size={14} icon={statsDots} className="next30-graph-icon" />
                  {this.props.button_label}
                </button>
              </div>
            </div>
        )
  }

};

export default Next30Button;
