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
import jQuery from 'jquery';
import ReactHighcharts from 'react-highcharts';
import moment from 'moment';
import DisplayOutlookBarChart from '../../components/DisplayOutlookBarChart';

//water deficit model
import { runWaterDeficitModel } from '../../utils/waterDeficitModel/waterDeficitModel.js'
//outlook analysis
import { runOutlookAnalysis } from '../../utils/outlook/calcOutlook.js'

import '../../styles/DisplayOutlook.css';

var HighchartsMore = require('highcharts-more');
HighchartsMore(ReactHighcharts.Highcharts);

const spinner = <div className="loader"></div>

@inject("store") @observer
class DisplayOutlook extends Component {

  render() {

        if (this.props.store.app.next30Status) {

            // ----------------------------------------------------------------
            // run water deficit model since last irrigation date
            // -- calc number of days between last irrigation date and first date of data
            // -- run the water deficit model, initialized at last irrigation date
            // ----------------------------------------------------------------
            let miss = -999;
            let lastIrrigationDate = this.props.store.app.getIrrigationDate ?
                                     this.props.store.app.getIrrigationDate.format('MM/DD/YYYY') :
                                     this.props.store.app.getFirstDate
            let beginningOfGrowingSeason = moment(this.props.store.app.getFirstDate,"MM/DD/YYYY");
            let irrigationDate = moment(lastIrrigationDate,"MM/DD/YYYY");
            let idxIrrigationDate = irrigationDate.diff(beginningOfGrowingSeason, "days")

            let water_deficit_output = runWaterDeficitModel(
                //this.props.store.app.getPrecip.slice(idxIrrigationDate),
                //this.props.store.app.getPet.slice(idxIrrigationDate),
                //this.props.store.app.getPrecip.slice(idxIrrigationDate).concat(this.props.store.app.getPrecipFcst),
                //this.props.store.app.getPet.slice(idxIrrigationDate).concat(this.props.store.app.getPetFcst),
                this.props.store.app.getPrecip.concat(this.props.store.app.getPrecipFcst).slice(idxIrrigationDate),
                this.props.store.app.getPet.concat(this.props.store.app.getPetFcst).slice(idxIrrigationDate),
                0.0,
                lastIrrigationDate,
                this.props.store.app.getPlantingDate.format('MM/DD/YYYY'),
                this.props.store.app.getSelectedSoilWaterCapacity,
                this.props.store.app.getSelectedCropType
            );

            // ----------------------------------------------------------------
            // use current water deficit to initialize outlook analysis
            // ----------------------------------------------------------------
            let outlook = runOutlookAnalysis(
                    this.props.store.app.getClim,
                    //water_deficit_output.deficitDaily[water_deficit_output.deficitDaily.length - 1],
                    water_deficit_output.deficitDaily[water_deficit_output.deficitDaily.length - 1 - this.props.store.app.getPrecipFcst.length],
                    //beginningOfGrowingSeason.add(water_deficit_output.deficitDaily.length - 1, 'days').format("MM/DD/YYYY"),
                    irrigationDate.add(water_deficit_output.deficitDaily.length - 1 - this.props.store.app.getPrecipFcst.length, 'days').format("MM/DD/YYYY"),
                    this.props.store.app.getPlantingDate.format('MM/DD/YYYY'),
                    this.props.store.app.getSelectedSoilWaterCapacity,
                    this.props.store.app.getSelectedCropType,
                    miss
                )

            let outlookConfig = this.props.store.app.updateOutlookConfig(water_deficit_output.deficitDaily,outlook)
            this.props.store.app.updateOutlookBarChartConfig(outlook)

            const afterRender = (chart) => {
                //let fc_plotline_pixel
                //let yaxis_max
                //let yaxis_min
                //var fc_plotline_pixel, yaxis_max, yaxis_min;
                let fc_plotline_pixel = chart.yAxis[0].toPixels(0.0)
                //wp_plotline_pixel = chart.yAxis[0].toPixels(IRR_TOOLVARS.soilmoisture.wiltingpoint-IRR_TOOLVARS.soilmoisture[IRR_TOOLVARS.irrigationlevel])
                let yaxis_max = chart.yAxis[0].toPixels(chart.yAxis[0].max)
                //let yaxis_min = chart.yAxis[0].toPixels(chart.yAxis[0].min)
                //var posX = chart.plotLeft + Math.floor(chart.plotWidth/2.);
                //var posY = Math.floor((yaxis_max + yaxis_min + 30)/2.);
                ////var posY = Math.floor((wp_plotline_pixel + yaxis_min + 30)/2.);
                var posX_lineColorDesc = chart.plotLeft + Math.floor(chart.plotWidth/2.5);
                var posY_lineColorDesc = Math.floor((fc_plotline_pixel + yaxis_max)/2.8);

                // Describe the color of lines in probability chart
                chart.renderer.text('GREEN: Probability that water deficit will be at or above these lines', posX_lineColorDesc, posY_lineColorDesc)
                    .attr({
                        rotation: 0,
                        'text-anchor': 'left'
                    })
                    .css({
                        color: 'rgba(0,128,0,1.0)',
                        fontSize: '10px'
                    })
                    .add();

                chart.renderer.text('BLACK: Equal chance that water deficit will be above or below this line', posX_lineColorDesc, posY_lineColorDesc+12)
                    .attr({
                        rotation: 0,
                        'text-anchor': 'left'
                    })
                    .css({
                        color: 'rgba(0,0,0,1.0)',
                        fontSize: '10px'
                    })
                    .add();

                chart.renderer.text('BROWN: Probability that water deficit will be at or below these lines', posX_lineColorDesc, posY_lineColorDesc+24)
                    .attr({
                        rotation: 0,
                        'text-anchor': 'left'
                    })
                    .css({
                        color: 'rgba(160,82,45,1.0)',
                        fontSize: '10px'
                    })
                    .add();

                jQuery(chart.series).each(function()
                {
                  if ( this.name!=='Deficit' && this.name!=='Deficit Fcst' && this.name.indexOf('area')===-1 ) {
                    var pointsBackToLabel = 0
                    for (var idx=this.yData.length-1; idx>=0; idx--) {
                        if (this.yData[idx]>=0) {
                            pointsBackToLabel = pointsBackToLabel + 1
                        } else {
                            break
                        }
                    }

                    //var point = ((pointsBackToLabel===0) || (pointsBackToLabel===this.yData.length)) ? this.points[this.points.length-1] : this.points[this.points.length-pointsBackToLabel];
                    //var yAdjust = ((pointsBackToLabel===0) || (pointsBackToLabel===this.yData.length)) ? 4 : -1;
                    //var text = chart.renderer.text(this.name,
                    //point.plotX + chart.plotLeft + 2,
                    //point.plotY + chart.plotTop + yAdjust).attr(
                    //  {
                    //    zIndex: 7
                    //  }).add();

                    };
                  });
              }

            return (
                <div className='next30-display-active'>
                  <Loader message={spinner} show={this.props.store.app.getLoaderOutlook} priority={10} backgroundStyle={{backgroundColor: null}} hideContentOnLoad={true}>
                    <div className="next30-display-content">
                        <div className="next30-display-content-chart">
                            <ReactHighcharts config={ outlookConfig } callback={afterRender} isPureConfig />
                        </div>
                        <div className="next30-display-content-bar">
                            <DisplayOutlookBarChart />
                        </div>
                    </div>
                  </Loader>
                </div>
            )

        } else {
            return(false)
        }
  }

};

export default DisplayOutlook;
