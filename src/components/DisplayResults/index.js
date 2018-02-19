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
import Loader from 'react-loader-advanced';
import ReactHighcharts from 'react-highcharts';
import moment from 'moment';

//water deficit model
import { runWaterDeficitModel } from '../../utils/waterDeficitModel/waterDeficitModel.js'

import '../../styles/DisplayResults.css';

const spinner = <div className="loader"></div>

@inject("store") @observer
class DisplayResults extends Component {


  render() {

        if (this.props.store.app.resultsStatus && this.props.store.app.getPrecip && this.props.store.app.getPrecipFcst && this.props.store.app.getPet && this.props.store.app.getPetFcst) {

            // ----------------------------------------------------------------
            // -- calc number of days between last irrigation date and first date of data
            // ----------------------------------------------------------------
            let lastIrrigationDate = this.props.store.app.getIrrigationDate ?
                                     this.props.store.app.getIrrigationDate.format('MM/DD/YYYY') :
                                     this.props.store.app.getFirstDate
            let start = moment(this.props.store.app.getFirstDate,"MM/DD/YYYY");
            let end = moment(lastIrrigationDate,"MM/DD/YYYY");
            let idxIrrigationDate = end.diff(start, "days")

            // ----------------------------------------------------------------
            // run water deficit model, initialized at beginning of growing season
            // ----------------------------------------------------------------
            var water_deficit_no_irrigation = runWaterDeficitModel(
                this.props.store.app.getPrecip.concat(this.props.store.app.getPrecipFcst),
                this.props.store.app.getPet.concat(this.props.store.app.getPetFcst),
                0.0,
                this.props.store.app.getFirstDate,
                this.props.store.app.getPlantingDate.format('MM/DD/YYYY'),
                this.props.store.app.getSelectedSoilWaterCapacity,
                this.props.store.app.getSelectedCropType
            );

            // ----------------------------------------------------------------
            // run water deficit model, initialized at last irrigation date
            // ----------------------------------------------------------------
            var water_deficit_with_irrigation = runWaterDeficitModel(
                //this.props.store.app.getPrecip.slice(idxIrrigationDate),
                //this.props.store.app.getPet.slice(idxIrrigationDate),
                this.props.store.app.getPrecip.concat(this.props.store.app.getPrecipFcst).slice(idxIrrigationDate),
                this.props.store.app.getPet.concat(this.props.store.app.getPetFcst).slice(idxIrrigationDate),
                0.0,
                lastIrrigationDate,
                this.props.store.app.getPlantingDate.format('MM/DD/YYYY'),
                this.props.store.app.getSelectedSoilWaterCapacity,
                this.props.store.app.getSelectedCropType
            );

            // ----------------------------------------------------------------
            // Replace non-irrigated model results with irrigated model results, after the last irrigation date
            // ----------------------------------------------------------------
            let deficitDaily = water_deficit_no_irrigation.deficitDaily
            deficitDaily.splice(idxIrrigationDate, deficitDaily.length, ...water_deficit_with_irrigation.deficitDaily)

            // ----------------------------------------------------------------
            // Update chart configuration
            // ----------------------------------------------------------------
            let resultsConfig = this.props.store.app.updateResultsConfig(deficitDaily);

            return (
              <div className='results-display-active'>
                  <Loader message={spinner} show={this.props.store.app.getLoaderResults} priority={10} backgroundStyle={{backgroundColor: null}} hideContentOnLoad={true}>
                    <div className="results-display-content">
                      <ReactHighcharts config={ resultsConfig } isPureConfig />
                    </div>
                    <div className="results-display-mouseover-message">
                      { this.props.store.app.getChartLabel }
                    </div>
                  </Loader>
              </div>
            )

        } else {
            return(false)
        }
  }

};

export default DisplayResults;
