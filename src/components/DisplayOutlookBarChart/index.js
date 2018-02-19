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
//import Loader from 'react-loader-advanced';
//import jQuery from 'jquery';
import ReactHighcharts from 'react-highcharts';
//import moment from 'moment';

import '../../styles/DisplayOutlookBarChart.css';

//var HighchartsMore = require('highcharts-more');
//HighchartsMore(ReactHighcharts.Highcharts);

//const spinner = <div className="loader"></div>

@inject("store") @observer
class DisplayOutlookBarChart extends Component {

  render() {

        let outlookBarChartConfig = this.props.store.app.getOutlookBarChartConfig

         return (
            <div>
                <ReactHighcharts config={ outlookBarChartConfig } isPureConfig />
            </div>
        )

  }

};

export default DisplayOutlookBarChart;
