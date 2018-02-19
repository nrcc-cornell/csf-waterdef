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

import '../../styles/ResultsButton.css';

@inject("store") @observer
class ResultsButton extends Component {

  static propTypes = {
    button_label: string,
  }

  static defaultProps = {
    button_label: "Go",
  }

  render() {
        const className = this.props.store.app.resultsStatus ? 'results-button-active' : 'results-button-inactive';
        return (
            <div className="results-label">
              <div>
                <button
                  className={className}
                  onClick={() => {
                      this.props.store.app.updateResultsStatus(true);
                      this.props.store.app.updateClimateChangeStatus(false);
                      this.props.store.app.updateNext30Status(false);
                      if (this.props.store.app.popupStatus) { this.props.store.app.updatePopupStatus(); }
                      if (this.props.store.app.cropTypeInfoStatus) { this.props.store.app.updateCropTypeInfoStatus(); }
                      }
                  }
                >
                  <Icon size={14} icon={statsDots} className="results-graph-icon" />
                  {this.props.button_label}
                </button>
              </div>
            </div>
        )
  }

};

export default ResultsButton;
