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
import { inject, observer} from 'mobx-react';
import ReactHighcharts from 'react-highcharts';
import Highcharts from 'react-highcharts';

// Components
import LocationPicker from '../../components/LocationPicker';
import SoilWaterCapacitySelect from '../../components/SoilWaterCapacitySelect';
import CropTypeSelect from '../../components/CropTypeSelect';
import PlantingDatePicker from '../../components/PlantingDatePicker';
import IrrigationDatePicker from '../../components/IrrigationDatePicker';
import DisplayButtonGroup from '../../components/DisplayButtonGroup';
import DisplayResults from '../../components/DisplayResults';
import DisplayOutlook from '../../components/DisplayOutlook';
import DisplayClimateChange from '../../components/DisplayClimateChange';
import CropTypeInfoWindow from '../../components/CropTypeInfoWindow';
import InfoWindow from '../../components/InfoWindow';
//import PastYearMessage from '../../components/PastYearMessage';

// Styles
import '../../styles/App.css';

var HighchartsExporting = require('highcharts-exporting');
HighchartsExporting(ReactHighcharts.Highcharts);

Highcharts.Highcharts.setOptions({
  lang: {
    resetZoom: "<- View Full Season To Date"
  },
});

@inject('store') @observer
class App extends Component {

    render() {

        return (
            <div className="App">
                <div className="csftool-input">
                    <LocationPicker />
                    <SoilWaterCapacitySelect />
                    <CropTypeSelect />
                    <PlantingDatePicker />
                    <IrrigationDatePicker />
                    <DisplayButtonGroup />
                </div>
                <div className="csftool-display">
                    <DisplayResults />
                    <DisplayOutlook />
                    <DisplayClimateChange
                      content={this.props.store.app.cc_placeholder_content}
                    />
                    <CropTypeInfoWindow
                      content={this.props.store.app.crop_type_info_content}
                      button_label="Back to tool"
                    />
                    <InfoWindow
                      content={this.props.store.app.info_content}
                      button_label="Back to tool"
                    />
                </div>
                <div className="csftool-location-dialog">
                </div>
            </div>
        );
    }
}

export default App;
