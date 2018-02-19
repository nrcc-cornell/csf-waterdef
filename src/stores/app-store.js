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

import React from 'react';
import { observable, computed, action } from 'mobx';
import jsonp from 'jsonp';
import jQuery from 'jquery';
import 'jquery-ui/themes/base/core.css';
import 'jquery-ui/themes/base/theme.css';
import 'jquery-ui/themes/base/button.css';
import 'jquery-ui/ui/core';
import 'jquery-ui/ui/widgets/button';
import moment from 'moment';

var modeldata = require('./ref_data.json');

//water deficit model
//import { runWaterDeficitModel } from '../utils/waterDeficitModel/waterDeficitModel.js'

let miss = -999;

let isInArray = (v,a) => {
    return a.indexOf(v) > -1
};

let nullifyMissingData = (p,miss) => {
    // some past years have a few missing days. We will ignore those days for now, and have NRCC rerun to fill missing days if possible.
    while (isInArray(miss,p)) { p[p.indexOf(miss)]=null };
    return p
};

export class AppStore {
    // Soil Water Capacity Select Dropdown Menu ------------------------------------------
    // For Components: SoilWaterCapacitySelect -------------------------------------------
    //@observable soil_water_capacity = 'High (Clay, fine texture)';
    @observable soil_water_capacity = 'high';
    @action updateSelectedSoilWaterCapacity = (v) => {
      // update the saved settings for current location
      let locations = this.manage_local_storage("read","locations");
      let selected_id = this.manage_local_storage("read","selected");
      locations[selected_id]['soilcapacity']=v.value
      this.manage_local_storage("write","locations",locations);
      // update the observed variable
      this.soil_water_capacity = v.value
    };
    @computed get getSelectedSoilWaterCapacity() {
      return this.soil_water_capacity
    };

    // Crop Type Select Dropdown Menu ----------------------------------------------------
    // For Components: CropTypeSelect ----------------------------------------------------
    //@observable crop_type = 'Grass Reference';
    @observable crop_type = 'grass';
    @action updateSelectedCropType = (v) => {
      // update the saved settings for current location
      let locations = this.manage_local_storage("read","locations");
      let selected_id = this.manage_local_storage("read","selected");
      locations[selected_id]['croptype']=v.value
      this.manage_local_storage("write","locations",locations);
      // update the observed variable
      this.crop_type = v.value
    };
    @computed get getSelectedCropType() {
      return this.crop_type
    };

    // Results of Water Deficit Model ----------------------------------------------------
    // For Components: ResultsButton -----------------------------------------------------
    @observable results_status=true;
    //@action updateResultsStatus = () => { this.results_status = !this.results_status };
    @action updateResultsStatus = (b) => { this.results_status = b };
    @computed get resultsStatus() { return this.results_status };

    // Results of Water Deficit Model : Next 30 days -------------------------------------
    // For Components: Next30Button -----------------------------------------------------
    @observable next30_status=false;
    //@action updateNext30Status = () => { this.next30_status = !this.next30_status };
    @action updateNext30Status = (b) => { this.next30_status = b };
    @computed get next30Status() { return this.next30_status };

    // Results of Water Deficit Model : Climate Change -----------------------------------
    // For Components: ClimateChangeButton -----------------------------------------------------
    @observable climate_change_status=false;
    //@action updateClimateChangeStatus = () => { this.climate_change_status = !this.climate_change_status };
    @action updateClimateChangeStatus = (b) => {
        this.climate_change_status = b
    };
    @computed get climateChangeStatus() { return this.climate_change_status };
    cc_placeholder_content=
        <div>
        <b>Coming Soon:</b> Over the next several months, our programming team will be incorporating data from downscaled climate change projections into each tool, covering the Northeastern United States. The climate change projections are determined from the <a href="http://cmip-pcmdi.llnl.gov/cmip5/" target="_blank" rel="noopener noreferrer">CMIP5 climate models</a>, maintained by the Northeast Regional Climate Center (<a href="http://www.nrcc.cornell.edu" target="_blank" rel="noopener noreferrer">NRCC</a>) at Cornell. This data will provide the long-term context for the data shown in each Climate Smart Farming Tool – for example, in this tool, the climate projections data will provide context for how climate change will affect the potential for water deficits by season and crop type in the future. This type of information will help farmers and decision makers understand how climate change will likely affect them over the coming decades. For more information, please contact us at <a href="mailto:cicss@cornell.edu?subject=CSF water deficit tool info">cicss@cornell.edu</a>.
        </div>;

    // Data Sources and References -------------------------------------------------------
    // For Components: InfoButton & InfoWindow -------------------------------------------
    @observable info_status=false;
    @action updatePopupStatus = () => { this.info_status = !this.info_status };
    @computed get popupStatus() { return this.info_status };
    info_content = 
        <div>
              <h2>Data sources and methods</h2>
              <h4><br/>&bull; ABOUT THE WATER BALANCE MODEL</h4>
              <p>
              This tool uses precipitation, evapotranspiration, drainage and runoff to calculate daily estimates of the soil water content within a crop’s effective root zone for the Northeast US. The resulting water deficit information provides the amount of irrigation or natural rainfall needed to return the soil in this root zone to field capacity. The use of gridded precipitation, calculated from surface observations and radar estimates (Degaetano and Wilks, 2009), results in the availability of water deficit estimates on a 2.5 x 2.5 mile grid. Model results are calculated and displayed for the grid point closest in proximity to the user-provided location.
              </p>
              <p>
              Evapotranspiration (ET) is calculated for specific crops and soil moisture conditions in this model. A variation of the Penman-Monteith equation, as implemented in a modified version of the British Meteorological Office Rainfall and Evaporation Calculation System (MORECS), is first used to determine ET from a hypothetical grass reference surface (Degaetano et al., 1994). Coefficient curves are then applied to this reference ET in order to better represent the typical ET progression observed throughout the growth cycle of each specific crop. Crops with similar coefficient curves are grouped together for selection in this tool. In order to account for the reduced ET observed for plants experiencing stress due to dry conditions, crop ET is further adjusted by applying a water stress coefficient that is a function of soil water content. Coefficient curves and ET adjustments for water stress are applied as outlined in the FAO Irrigation and Drainage Paper No. 56 (Allen et al., 2006).
              </p>
              <p>
              Surface runoff is assumed for any water amount in excess of soil saturation. Drainage is estimated based on user-selected soil types (clay, loam, or sand). If the soil water content is greater than field capacity, drainage continues until field capacity is reached.
              </p>
              <p>
              Together, precipitation, ET, drainage and runoff determine daily water deficit estimates throughout the season.
              </p>
              <h4>&bull; FORECASTS AND OUTLOOKS</h4>
              <p>
              Three-day precipitation forecasts obtained through the National Weather Service’s National Digital Forecast Database (Glahn and Ruth, 2003) provides the means to produce 3-day water deficit forecasts.
              </p>
              <p>
              Water deficit probabilities over the next 30 days are calculated from historical data (2002 – present). Using the current water deficit for model initialization, the water balance model is executed repeatedly on historical data to produce empirical distributions for each X-day outlook. Percentiles are determined from the distributions, and probability lines are presented in a more user-friendly manner from these percentiles.
              </p>
              <h4>&bull; ACCESS TO GRIDDED PRECIPITATION DATA</h4>
              <p>
              Gridded 2.5 x 2.5 mile daily precipitation data (Degaetano and Wilks, 2009) are produced for the Northeast United States by the <a href="http://www.nrcc.cornell.edu" target="_blank" rel="noopener noreferrer">Northeast Regional Climate Center</a>, and are publicly available through the Applied Climate Information System (<a href="http://www.rcc-acis.org" target="_blank" rel="noopener noreferrer">ACIS</a>) web service.
              </p>
              <h4>&bull; REFERENCES</h4>
              <p>
              Allen R.G., L.S. Pereira, D. Raes and M. Smith, Crop evapotranspiration – Guidelines for computing crop water requirements – FAO Irrigation and drainage paper 56. FAO, Rome 300 (9), D05109.
              </p>
              <p>
              Degaetano, Arthur & S. Wilks, Daniel. (2009). Radar‐guided interpolation of climatological precipitation data. International Journal of Climatology. 29. 185 - 196. 10.1002/joc.1714.
              </p>
              <p>
              Degaetano, A.T., K.L. Eggleston and W.W. Knapp, 1994, Daily Evapotranspiration and Soil Moisture Estimates for the Northeastern United States, NRCC Research Publication RR 94-1. 11 pp.
              </p>
              <p>
              Glahn, H. R., and D. P. Ruth, 2003: The new digital forecast database of the National Weather Service. Bull. Amer. Meteor. Soc., 84, 195–201.
              </p>
        </div>;

    // Crop Type Info --------------------------------------------------------------------
    // For Components: CropTypeInfoButton & CropTypeInfoWindow ---------------------------
    @observable crop_type_info_status=false;
    @action updateCropTypeInfoStatus = () => { this.crop_type_info_status = !this.crop_type_info_status };
    @computed get cropTypeInfoStatus() { return this.crop_type_info_status };
    crop_type_info_content = 
        <div>
          <h2>Crop Type Groups</h2>
          <div>
            <table className='crop-type-groups-table'><tbody>
              <tr><th><b>GROUP</b></th><th>MEMBERS</th></tr>
              <tr><td><b>Cereals</b></td><td>Corn(Field), Oats, Wheat(Winter)</td></tr>
              <tr><td><b>Forages</b></td><td>Alfalfa Hay, Clover Hay</td></tr>
              <tr><td><b>Legumes</b></td><td>Beans(Green), Peas</td></tr>
              <tr><td><b>Roots and Tubers</b></td><td>Potato, Sweet Potato</td></tr>
              <tr><td><b>Vegetables (Small) - Short Season</b></td><td>Broccoli, Carrots, Lettuce, Spinach</td></tr>
              <tr><td><b>Vegetables (Small) - Long Season</b></td><td>Brussel Sprouts, Cabbage, Cauliflower, Celery, Onions(dry)</td></tr>
              <tr><td><b>Vegetables (Solanum Family)</b></td><td>Eggplant, Peppers(Bell), Tomato</td></tr>
              <tr><td><b>Vegetables (Cucumber Family)</b></td><td>Cantaloupe, Cucumber, Pumpkin/Winter Squash, Squash/Zucchini, Sweet Melons, Watermelon</td></tr>
            </tbody></table>
          </div>
        </div>;

    // -----------------------------------------------------------------------------------
    // Get the most recent selectable year -----------------------------------------------
    // New seasons will start on March 1. Until then, the previous season are active. ----
    // -----------------------------------------------------------------------------------
    @computed get latestSelectableYear() {
        let thisMonth = moment().month();
        let thisYear = moment().year();
        if (thisMonth===0 || thisMonth===1) {
            return thisYear-1
        } else {
            return thisYear
        }
    };

    // -----------------------------------------------------------------------------------
    // Planting Date Picker --------------------------------------------------------------
    // For Components: PlantingDatePicker ------------------------------------------------
    // -----------------------------------------------------------------------------------
    //@observable planting_date = null;
    //@observable planting_date = moment('05/15/2017','MM-DD-YYYY');
    @observable planting_date = moment('05/15/'+this.latestSelectableYear,'MM-DD-YYYY');
    @action updatePlantingDate = (v) => {
      this.planting_date = v
      let selected_year = v.format('YYYY')
      // if planting year is the same as latest year, allow saving of user settings
      if (selected_year === this.latestSelectableYear.toString()) {
          let locations = this.manage_local_storage("read","locations");
          let selected_id = this.manage_local_storage("read","selected");
          locations[selected_id]['planting_date']=v.format('MM/DD/YYYY');
          this.manage_local_storage("write","locations",locations);
      }
      this.updateButtonStatusForPastYears(selected_year)
      this.updatePlantingYear(selected_year)
    };
    @action updateButtonStatusForPastYears = (y) => {
      //if (y!=='2017') {
      if (y!==this.latestSelectableYear.toString()) {
        this.updateResultsStatus(true);
        this.updateNext30Status(false);
        this.updateClimateChangeStatus(false);
        if (this.popupStatus) { this.updatePopupStatus() };
      }
    };
    @computed get getPlantingDate() {
      return this.planting_date
    };

    @observable planting_year = this.getPlantingDate.format('YYYY');
    @action updatePlantingYear = (y) => {
        if (this.planting_year !== y) {
            this.planting_year = y
            if (this.getPlantingYear === this.latestSelectableYear.toString()) {
                this.initLocationState()
            } else {
                this.updateIrrigationDate(null)
            }
            this.downloadResultData()
        }
    }
    @computed get getPlantingYear() {
      //return this.planting_date.format('YYYY')
      return this.planting_year
    };

    // Irrigation Date Picker --------------------------------------------------------------
    // For Components: IrrigationDatePicker ------------------------------------------------
    @observable irrigation_date = null;
    @action updateIrrigationDate = (v) => {
      this.irrigation_date = v
      //this.irrigation_date = v.format('MM/DD/YYYY')
      // if irrigation year is the same as latest year, allow saving of user settings
      let irrigationYear = this.getIrrigationDate ? v.format('YYYY') : null
      if (irrigationYear === this.latestSelectableYear.toString()) {
          let locations = this.manage_local_storage("read","locations");
          let selected_id = this.manage_local_storage("read","selected");
          locations[selected_id]['irrigation_date']=v.format('MM/DD/YYYY');
          this.manage_local_storage("write","locations",locations);
      }
    };
    @computed get getIrrigationDate() {
      return this.irrigation_date
    };

    // -----------------------------------------------------------------------------------
    // Location Picker -------------------------------------------------------------------
    // For Components: LocationPicker ----------------------------------------------------
    // -----------------------------------------------------------------------------------
    map_dialog=null;
    manage_local_storage=null;

    // Location ID -------------------------------------------
    @observable location_id='default';
    @action updateLocationId = (i) => {
            this.location_id = i;
        }
    @computed get getLocationId() {
            return this.location_id
        }

    // Location coordinates ----------------------------------
    //@observable lat='42.50';
    //@observable lon='-76.50';
    @observable lat='42.450';
    @observable lon='-76.480';
    @action updateLocation = (lt,ln) => {
            //console.log(this.getLat);
            //console.log(lt);
            //console.log(this.getLon);
            //console.log(ln);
            if ((this.getLat !== lt) || (this.getLon!==ln)) {
                this.lat = lt;
                this.lon = ln;
                this.downloadResultData()
                this.downloadOutlookData()
            }
        }
    @computed get getLat() {
            return this.lat
        }
    @computed get getLon() {
            return this.lon
        }

    // Location address --------------------------------------
    @observable address='Cornell University, Ithaca, NY';
    @action updateAddress = (a) => {
            this.address = a;
        }
    @computed get getAddress() {
            return this.address
        }


    // Location default --------------------------------------
    @observable default_location;
    @action updateDefaultLocation = () => {
            this.default_location = {address:this.getAddress, lat:parseFloat(this.getLat), lng:parseFloat(this.getLon), id:this.getLocationId};
        }
    @computed get getDefaultLocation() {
            return this.default_location
        }


    // Initialize the local storage manager
    @action initStorageManager = () => {
        //console.log('initStorageManager');
        let storage_options = {
            namespace: 'CSF-WATER',
            expireDays: 3650
        }
        jQuery().CsfToolManageLocalStorage(storage_options);
        this.manage_local_storage = jQuery().CsfToolManageLocalStorage();
        this.manage_local_storage("init");
    }

    // Initialize the location state
    @action initLocationState = () => {
        //console.log('initLocationState');
        let selected_id = this.manage_local_storage("read","selected");
        let locations = this.manage_local_storage("read","locations");
        let loc_obj = null;
        if (locations !== undefined) {
            loc_obj = locations[selected_id]
        } else {
            loc_obj = null
        }
        this.updateDefaultLocation();
        if (loc_obj) {
            this.updateLocationId(loc_obj.id);
            this.updateAddress(loc_obj.address);
            this.updateLocation(loc_obj.lat.toString(),loc_obj.lng.toString());
            if (locations[loc_obj.id].hasOwnProperty('soilcapacity')) {
                this.updateSelectedSoilWaterCapacity({ value: locations[loc_obj.id]['soilcapacity'] });
            } else {
                this.updateSelectedSoilWaterCapacity({ value: 'high' });
            }
            if (locations[loc_obj.id].hasOwnProperty('croptype')) {
                this.updateSelectedCropType({ value: locations[loc_obj.id]['croptype'] });
            } else {
                this.updateSelectedCropType({ value: 'grass' });
            }
            if (locations[loc_obj.id].hasOwnProperty('planting_date')) {
                // make sure saved value is for current season. If it is not, reset to default value
                if (locations[loc_obj.id]['planting_date'].slice(-4) === this.latestSelectableYear.toString()) {
                    this.updatePlantingDate(moment(locations[loc_obj.id]['planting_date'],'MM/DD/YYYY'));
                } else {
                    this.updatePlantingDate(moment('05/15/'+this.latestSelectableYear,'MM/DD/YYYY'));
                }
            } else {
                this.updatePlantingDate(moment('05/15/'+this.latestSelectableYear,'MM/DD/YYYY'));
            }
            if (locations[loc_obj.id].hasOwnProperty('irrigation_date')) {
                // make sure saved value is for current season. If it is not, reset to default value
                if (locations[loc_obj.id]['irrigation_date'].slice(-4) === this.latestSelectableYear.toString()) {
                    this.updateIrrigationDate(moment(locations[loc_obj.id]['irrigation_date'],'MM/DD/YYYY'));
                } else {
                    this.updateIrrigationDate(null);
                }
            } else {
                this.updateIrrigationDate(null);
            }
        } else {
            this.updateLocationId(this.default_location.id);
            this.updateAddress(this.default_location.address);
            this.updateLocation(this.default_location.lat.toString(),this.default_location.lng.toString());
            // WRITE DEFAULT LOCATION IF NO LOCATIONS EXIST
            this.manage_local_storage("write","locations",{default: this.default_location});
            this.manage_local_storage("write","selected",this.default_location.id);
        }
    }

    // Initialize the map dialog
    @action initMapDialog = () => {
            //console.log('initMapDialog');
            //var default_location = this.getDefaultLocation
            var default_location = {address:this.getAddress, lat:parseFloat(this.getLat), lng:parseFloat(this.getLon), id:"default"};
            //var options = { width:600, height:500, google:google, default:default_location };
            var options = { width:600, height:500, google:window.google, default:default_location };
            jQuery(".csftool-location-dialog").CsfToolLocationDialog(options);
            this.map_dialog = jQuery(".csftool-location-dialog").CsfToolLocationDialog();
            this.map_dialog("bind", "close", (ev, context) => {
                // get the currently saved locations
                let locations_saved = this.manage_local_storage("read","locations");
                // locations from the location picker
                let locations_from_picker = context.all_locations
                // save new locations into the saved locations
                for (var key in locations_from_picker) {
                    if (locations_from_picker.hasOwnProperty(key)) {
                        if (!(locations_saved.hasOwnProperty(key))) {
                            locations_saved[key] = locations_from_picker[key]
                        }
                    }
                }

                // selected location we get back from location picker
                let loc_obj = context.selected_location;
                this.updateLocationId(loc_obj.id);
                this.updateAddress(loc_obj.address);
                this.updateLocation(loc_obj.lat.toString(),loc_obj.lng.toString());
                if (locations_saved[loc_obj.id].hasOwnProperty('soilcapacity')) {
                    this.updateSelectedSoilWaterCapacity({ value: locations_saved[loc_obj.id]['soilcapacity'] });
                } else {
                    this.updateSelectedSoilWaterCapacity({ value: 'high' });
                }
                if (locations_saved[loc_obj.id].hasOwnProperty('croptype')) {
                    this.updateSelectedCropType({ value: locations_saved[loc_obj.id]['croptype'] });
                } else {
                    this.updateSelectedCropType({ value: 'grass' });
                }
                if (locations_saved[loc_obj.id].hasOwnProperty('planting_date')) {
                    // make sure saved value is for current season. If it is not, reset to default value
                    if (locations_saved[loc_obj.id]['planting_date'].slice(-4) === this.latestSelectableYear.toString()) {
                        this.updatePlantingDate(moment(locations_saved[loc_obj.id]['planting_date'],'MM/DD/YYYY'));
                    } else {
                        this.updatePlantingDate(moment('05/15/'+this.latestSelectableYear,'MM/DD/YYYY'));
                    }
                } else {
                    this.updatePlantingDate(moment('05/15/'+this.latestSelectableYear,'MM/DD/YYYY'));
                }
                if (locations_saved[loc_obj.id].hasOwnProperty('irrigation_date')) {
                    // make sure saved value is for current season. If it is not, reset to default value
                    if (locations_saved[loc_obj.id]['irrigation_date'].slice(-4) === this.latestSelectableYear.toString()) {
                        this.updateIrrigationDate(moment(locations_saved[loc_obj.id]['irrigation_date'],'MM/DD/YYYY'));
                    } else {
                        this.updateIrrigationDate(null);
                    }
                } else {
                    this.updateIrrigationDate(null);
                }

                // WRITE LOCATIONS THE USER HAS SAVED
                this.manage_local_storage("write","locations",locations_saved);
                this.manage_local_storage("write","selected",this.getLocationId);

                // REMOVE LOCATIONS THE USER HAS DELETED
                var idsToDelete = this.manage_local_storage("getExtraKeys", "locations", context.all_locations);
                this.manage_local_storage("delete", "locations", idsToDelete);
            });
        }

    // Open map with all saved locations
    @action openMap = () => {
            let locations = this.manage_local_storage("read","locations");
            let selected_id = this.manage_local_storage("read","selected");
            this.map_dialog("locations", locations);
            this.map_dialog("open", selected_id);
        }


    // -----------------------------------------------------------------------------------
    // API store -------------------------------------------------------------------------
    // -----------------------------------------------------------------------------------

    // Loader ----------------------------------------------------------------------------
    @observable loader_results=false;
    @action updateLoaderResults = (l) => {
            this.loader_results = l;
        }
    @computed get getLoaderResults() {
            return this.loader_results
        }

    @observable loader_outlook=false;
    @action updateLoaderOutlook = (l) => {
            this.loader_outlook = l;
        }
    @computed get getLoaderOutlook() {
            return this.loader_outlook
        }

    // Logic for downloading results data (primary chart data) ---------------------------
    @observable isDownloadingResultData = false;
    @action updateDownloadingResultDataStatus = (l) => {
            this.isDownloadingResultData = l;
        }
    @computed get getDownloadingResultDataStatus() {
            return this.isDownloadingResultData
        }

    // Logic for downloading outlook data (next 30 days chart data) ----------------------
    @observable isDownloadingOutlookData = false;
    @action updateDownloadingOutlookDataStatus = (l) => {
            this.isDownloadingOutlookData = l;
        }
    @computed get getDownloadingOutlookDataStatus() {
            return this.isDownloadingOutlookData
        }

    // Logic for downloading climate change data -----------------------------------------
    @observable isDownloadingClimateChangeData = false;
    @action updateDownloadingClimateChangeDataStatus = (l) => {
            this.isDownloadingClimateChangeData = l;
        }
    @computed get getDownloadingClimateChangeDataStatus() {
            return this.isDownloadingClimateChangeData
        }

    // Results Chart ---------------------------------------------------------------------
    @observable resultsConfig = {}
    @action updateResultsConfig = (data) => {

        let sat = modeldata.soildata.soilmoistureoptions[this.getSelectedSoilWaterCapacity].saturation
        let fc = modeldata.soildata.soilmoistureoptions[this.getSelectedSoilWaterCapacity].fieldcapacity
        let stress = modeldata.soildata.soilmoistureoptions[this.getSelectedSoilWaterCapacity].stressthreshold
        let prewp = modeldata.soildata.soilmoistureoptions[this.getSelectedSoilWaterCapacity].prewiltingpoint
        let wp = modeldata.soildata.soilmoistureoptions[this.getSelectedSoilWaterCapacity].wiltingpoint

        //let firstDayOfSeason = moment.utc(this.getPlantingYear+'-03-01', 'YYYY-MM-DD')
        let idxFirstFcst = this.getPrecip.length
        let firstFcstDate = moment.utc(this.getPlantingYear+'-03-01', 'YYYY-MM-DD').add(idxFirstFcst,'days')

        let getDeficitColor = function (d) {
            // return color to use for deficit table value
            var col = null;
            if (d>fc-fc && d<=sat-fc) {
                // Green
                col = "rgba(0,128,0,0.5)";
            } else if (d>stress-fc && d<=fc-fc) {
                // Yellow
                col = "rgba(255,255,0,0.5)";
            } else if (d>prewp-fc && d<=stress-fc) {
                // Orange
                col = "rgba(255,128,0,0.5)";
            } else if (d<=prewp-fc) {
                // Red
                col = "rgba(255,0,0,0.5)";
            } else {
                // No color
                col = null;
            }
            return col;
        }

        let preprocessMarkerColors = function (data) {
            //console.log(data);
            let nData = [];
            let colorUse = null;
            for (var i = 0; i < data.length; i++) {
                if ((data[i] <= sat-fc) && (data[i] > fc-fc)) {
                    colorUse = 'rgba(0,128,0,0.8)'
                } else if ((data[i] <= fc-fc) && (data[i] > stress-fc)) {
                    colorUse = 'rgba(255,255,0,0.8)'
                } else if ((data[i] <= stress-fc) && (data[i] > prewp-fc)) {
                    colorUse = 'rgba(255,128,0,0.8)'
                } else if ((data[i] <= prewp-fc) && (data[i] > 0.0-fc)) {
                    colorUse = 'rgba(255,0,0,0.8)'
                } else {
                    colorUse = null
                }
                nData.push({
                    y: data[i],
                    //x: i,
                    fillColor: colorUse,
                    color: colorUse
                })
            }
            return nData;
        }

        return {
            plotOptions: {
                line: {
                    animation: false
                },
                //series: {
                //    point: {
                //        events: {
                //            mouseOver: (e) => {
                //                if (this.getChartLabel!==" ") { this.updateChartLabel(" ") }
                //            },
                //        }
                //    }
                //}
            },
            chart: {
                spacingBottom: 10,
                spacingTop: 10,
                spacingLeft: 10,
                spacingRight: 10,
                height: 460,
                width: 724,
                //width: 679,
                //marginTop: 60,
                backgroundColor: null,
                zoomType: 'x',
                resetZoomButton: {
                    theme: {
                        fill: 'white',
                        stroke: '#006600',
                        'stroke-width': 2,
                        style: { color: '#006600' },
                        r: 10,
                        states: {
                            hover: {
                                fill: '#006600',
                                stroke: '#4ca20b',
                                style: {
                                    color: '#ffffff',
                                }
                            }
                        }
                    }
                },
                events: {
                    load: function(){
                        //show tooltip on today's value
                        //var p = this.series[0].points[data.length-1];
                        let seriesLen = this.series[0].points.length
                        let p = this.series[0].points[seriesLen-1];
                        this.tooltip.refresh(p);
                    }
                }
            },
            title: {
                text: 'Water deficit for '+this.getPlantingYear,
                margin: 5,
                //x: 10
            },
            subtitle: {
                text: '@ '+this.getAddress,
            },
            exporting: {
              chartOptions: {
                chart: {
                  backgroundColor: '#ffffff'
                }
              }
            },
            credits: {
                enabled: false,
            },
            legend: {
                enabled: false
            },
            xAxis: {
                type: 'datetime',
                dateTimeLabelFormats: { millisecond: '%H:%M:%S.%L', second: '%H:%M:%S', minute: '%H:%M', hour: '%H:%M', day: '%d %b', week: '%d %b', month: '%b<br/>%Y', year: '%Y' },
                min: Date.UTC(parseInt(this.getPlantingYear,10),2,1),
                max: (this.latestSelectableYear.toString()===this.getPlantingYear) ? null : Date.UTC(parseInt(this.getPlantingYear,10),9,31),
                labels: {
                  rotation: 0,
                  style: {
                      color: '#000000',
                  }
                },
                plotLines: [{
                    color: 'rgba(0,0,0,0.3)',
                    width: 2,
                    dashStyle: 'dash',
                    //value: this.getPlantingDate,
                    value: Date.UTC(this.getPlantingDate.year(),this.getPlantingDate.month(),this.getPlantingDate.date()),
                    label: {
                        text: 'Planting',
                        //color: 'gray',
                        //fontWeight: 'lighter',
                        rotation: 90,
                        y: 10,
                    },
                    zIndex: 5,
                },{
                    color: 'rgba(0,0,255,0.5)',
                    width: 2,
                    dashStyle: 'dash',
                    //value: this.getIrrigationDate,
                    value: this.getIrrigationDate ? Date.UTC(this.getIrrigationDate.year(),this.getIrrigationDate.month(),this.getIrrigationDate.date()) : this.getIrrigationDate, 
                    label: {
                        text: 'Irrigation',
                        rotation: 90,
                        y: 10,
                    },
                    zIndex: 5,
                }],
            },
            yAxis: {
                //min: IRR_TOOLVARS.soilmoisture.wiltingpoint - IRR_TOOLVARS.soilmoisture[IRR_TOOLVARS.irrigationlevel] - 0.3,
                //min: -2.3,
                min: modeldata.soildata.soilmoistureoptions[this.getSelectedSoilWaterCapacity].wiltingpoint - modeldata.soildata.soilmoistureoptions[this.getSelectedSoilWaterCapacity].fieldcapacity- 0.3,
                max: Math.max(0.3, Math.max.apply(null, data)),
                //max: 0.3,
                gridLineWidth: 0,
                tickLength: 8,
                tickWidth: 1,
                tickPosition: 'outside',
                tickInterval: 0.5,
                lineWidth: 1,
                labels: {
                    format: '{value:.1f}',
                    style: {
                        color: '#000000',
                    }
                },
                title: {
                    text: 'Water Deficit (in/ft soil)',
                    style: {
                        color: '#000000',
                    }
                },
                plotBands: [{
                    //color: ((data[data.length-1] <= sat-fc) && (data[data.length-1] > fc-fc)) ? 'rgba(0,128,0,0.5)': 'transparent',
                    color: ((this.latestSelectableYear.toString()===this.getPlantingYear) && (data[idxFirstFcst-1] <= sat-fc) && (data[idxFirstFcst-1] > fc-fc)) ? 'rgba(0,128,0,0.5)': 'transparent',
                    from: 0.0,
                    to: sat-fc,
                    label: {
                        text: 'No deficit for plant',
                        style: {
                            fontSize: '1.2em',
                            //color: ((data[data.length-1] <= sat-fc) && (data[data.length-1] >= fc-fc)) ? 'black' : 'gray',
                            //fontWeight: ((data[data.length-1] <= sat-fc) && (data[data.length-1] >= fc-fc)) ? 'bold' : 'lighter',
                            color: ((this.latestSelectableYear.toString()===this.getPlantingYear) && (data[idxFirstFcst-1] <= sat-fc) && (data[idxFirstFcst-1] >= fc-fc)) ? 'black' : 'gray',
                            fontWeight: ((this.latestSelectableYear.toString()===this.getPlantingYear) && (data[idxFirstFcst-1] <= sat-fc) && (data[idxFirstFcst-1] >= fc-fc)) ? 'bold' : 'lighter',
                        },
                        align: 'left',
                        verticalAlign: 'middle',
                        x: 10,
                        y: 5
                    },
                },{
                    //color: ((data[data.length-1] <= fc-fc) && (data[data.length-1] > stress-fc)) ? 'rgba(255,255,0,0.5)': 'transparent',
                    color: ((this.latestSelectableYear.toString()===this.getPlantingYear) && (data[idxFirstFcst-1] <= fc-fc) && (data[idxFirstFcst-1] > stress-fc)) ? 'rgba(255,255,0,0.5)': 'transparent',
                    from: stress-fc,
                    to: fc-fc,
                    label: {
                        text: 'Deficit, no plant stress',
                        style: {
                            fontSize: '1.2em',
                            //color: ((data[data.length-1] <= fc-fc) && (data[data.length-1] >= stress-fc)) ? 'black' : 'gray',
                            //fontWeight: ((data[data.length-1] <= fc-fc) && (data[data.length-1] >= stress-fc)) ? 'bold' : 'lighter',
                            color: ((this.latestSelectableYear.toString()===this.getPlantingYear) && (data[idxFirstFcst-1] <= fc-fc) && (data[idxFirstFcst-1] >= stress-fc)) ? 'black' : 'gray',
                            fontWeight: ((this.latestSelectableYear.toString()===this.getPlantingYear) && (data[idxFirstFcst-1] <= fc-fc) && (data[idxFirstFcst-1] >= stress-fc)) ? 'bold' : 'lighter',
                        },
                        align: 'left',
                        verticalAlign: 'middle',
                        x: 10,
                        y: 5
                    },
                },{
                    //color: ((data[data.length-1] <= stress-fc) && (data[data.length-1] > prewp-fc)) ? 'rgba(255,128,0,0.5)': 'transparent',
                    color: ((this.latestSelectableYear.toString()===this.getPlantingYear) && (data[idxFirstFcst-1] <= stress-fc) && (data[idxFirstFcst-1] > prewp-fc)) ? 'rgba(255,128,0,0.5)': 'transparent',
                    from: prewp-fc,
                    to: stress-fc,
                    label: {
                        text: 'Deficit, plant stress likely',
                        style: {
                            fontSize: '1.2em',
                            //color: ((data[data.length-1] <= stress-fc) && (data[data.length-1] >= prewp-fc)) ? 'black' : 'gray',
                            //fontWeight: ((data[data.length-1] <= stress-fc) && (data[data.length-1] >= prewp-fc)) ? 'bold' : 'lighter',
                            color: ((this.latestSelectableYear.toString()===this.getPlantingYear) && (data[idxFirstFcst-1] <= stress-fc) && (data[idxFirstFcst-1] >= prewp-fc)) ? 'black' : 'gray',
                            fontWeight: ((this.latestSelectableYear.toString()===this.getPlantingYear) && (data[idxFirstFcst-1] <= stress-fc) && (data[idxFirstFcst-1] >= prewp-fc)) ? 'bold' : 'lighter',
                        },
                        align: 'left',
                        verticalAlign: 'middle',
                        x: 10,
                        y: 5
                    },
                },{
                    //color: ((data[data.length-1] <= prewp-fc) && (data[data.length-1] > wp-fc)) ? 'rgba(255,0,0,0.5)': 'transparent',
                    color: ((this.latestSelectableYear.toString()===this.getPlantingYear) && (data[idxFirstFcst-1] <= prewp-fc) && (data[idxFirstFcst-1] > wp-fc)) ? 'rgba(255,0,0,0.5)': 'transparent',
                    from: wp-fc,
                    to: prewp-fc,
                    label: {
                        text: 'Deficit, severe plant stress',
                        style: {
                            fontSize: '1.2em',
                            //color: ((data[data.length-1] <= prewp-fc) && (data[data.length-1] >= wp-fc)) ? 'black' : 'gray',
                            //fontWeight: ((data[data.length-1] <= prewp-fc) && (data[data.length-1] >= wp-fc)) ? 'bold' : 'lighter',
                            color: ((this.latestSelectableYear.toString()===this.getPlantingYear) && (data[idxFirstFcst-1] <= prewp-fc) && (data[idxFirstFcst-1] >= wp-fc)) ? 'black' : 'gray',
                            fontWeight: ((this.latestSelectableYear.toString()===this.getPlantingYear) && (data[idxFirstFcst-1] <= prewp-fc) && (data[idxFirstFcst-1] >= wp-fc)) ? 'bold' : 'lighter',
                        },
                        align: 'left',
                        verticalAlign: 'middle',
                        x: 10,
                        y: 5
                    },
                },{
                    //color: ((data[data.length-1] <= wp-fc) && (data[data.length-1] > 0.0-fc)) ? 'rgba(255,0,0,0.5)': 'transparent',
                    color: ((this.latestSelectableYear.toString()===this.getPlantingYear) && (data[idxFirstFcst-1] <= wp-fc) && (data[idxFirstFcst-1] > 0.0-fc)) ? 'rgba(255,0,0,0.5)': 'transparent',
                    from: 0.0-fc,
                    to: wp-fc,
                    label: {
                        text: '',
                        style: {
                            fontSize: '1.2em',
                            //color: ((data[data.length-1] <= wp-fc) && (data[data.length-1] >= 0.0-fc)) ? 'black' : 'gray',
                            //fontWeight: ((data[data.length-1] <= wp-fc) && (data[data.length-1] >= 0.0-fc)) ? 'bold' : 'lighter',
                            color: ((this.latestSelectableYear.toString()===this.getPlantingYear) && (data[idxFirstFcst-1] <= wp-fc) && (data[idxFirstFcst-1] >= 0.0-fc)) ? 'black' : 'gray',
                            fontWeight: ((this.latestSelectableYear.toString()===this.getPlantingYear) && (data[idxFirstFcst-1] <= wp-fc) && (data[idxFirstFcst-1] >= 0.0-fc)) ? 'bold' : 'lighter',
                        },
                        align: 'left',
                        verticalAlign: 'middle',
                        x: 10,
                        y: 5
                    },
                }],
                plotLines: [{
                    value: sat-fc,
                    width: 1.0,
                    color: '#808080',
                    label: {
                        text: 'Saturation',
                        style: {
                            fontSize: '0.8em',
                            //color: ((data[data.length-1] <= sat-fc) && (data[data.length-1] >= fc-fc)) ? 'black' : 'gray',
                            //fontWeight: ((data[data.length-1] <= sat-fc) && (data[data.length-1] >= fc-fc)) ? 'bold' : 'lighter',
                            color: ((this.latestSelectableYear.toString()===this.getPlantingYear) && (data[idxFirstFcst-1] <= sat-fc) && (data[idxFirstFcst-1] >= fc-fc)) ? 'black' : 'gray',
                            fontWeight: ((this.latestSelectableYear.toString()===this.getPlantingYear) && (data[idxFirstFcst-1] <= sat-fc) && (data[idxFirstFcst-1] >= fc-fc)) ? 'bold' : 'lighter',
                        },
                        align: 'right',
                        x: -4,
                        y: 12
                    },
                    zIndex: 6,
                },{
                    value: 0.0,
                    width: 1.0,
                    color: '#808080',
                    label: {
                        text: 'Field Capacity',
                        style: {
                            fontSize: '0.8em',
                            //color: ((data[data.length-1] <= fc-fc) && (data[data.length-1] >= stress-fc)) ? 'black' : 'gray',
                            //fontWeight: ((data[data.length-1] <= fc-fc) && (data[data.length-1] >= stress-fc)) ? 'bold' : 'lighter',
                            color: ((this.latestSelectableYear.toString()===this.getPlantingYear) && (data[idxFirstFcst-1] <= fc-fc) && (data[idxFirstFcst-1] >= stress-fc)) ? 'black' : 'gray',
                            fontWeight: ((this.latestSelectableYear.toString()===this.getPlantingYear) && (data[idxFirstFcst-1] <= fc-fc) && (data[idxFirstFcst-1] >= stress-fc)) ? 'bold' : 'lighter',
                        },
                        align: 'right',
                        x: -4,
                        y: 12
                    },
                    zIndex: 6,
                },{
                    value: stress-fc,
                    width: 1.0,
                    color: '#808080',
                    label: {
                        text: 'Plant Stress Begins',
                        style: {
                            fontSize: '0.8em',
                            //color: ((data[data.length-1] <= stress-fc) && (data[data.length-1] >= prewp-fc)) ? 'black' : 'gray',
                            //fontWeight: ((data[data.length-1] <= stress-fc) && (data[data.length-1] >= prewp-fc)) ? 'bold' : 'lighter',
                            color: ((this.latestSelectableYear.toString()===this.getPlantingYear) && (data[idxFirstFcst-1] <= stress-fc) && (data[idxFirstFcst-1] >= prewp-fc)) ? 'black' : 'gray',
                            fontWeight: ((this.latestSelectableYear.toString()===this.getPlantingYear) && (data[idxFirstFcst-1] <= stress-fc) && (data[idxFirstFcst-1] >= prewp-fc)) ? 'bold' : 'lighter',
                        },
                        align: 'right',
                        x: -4,
                        y: 12
                    },
                    zIndex: 6,
                },{
                    value: prewp-fc,
                    width: 1.0,
                    color: '#808080',
                    label: {
                        text: 'Wilting Danger Exists',
                        style: {
                            fontSize: '0.8em',
                            //color: ((data[data.length-1] <= prewp-fc) && (data[data.length-1] >= wp-fc)) ? 'black' : 'gray',
                            //fontWeight: ((data[data.length-1] <= prewp-fc) && (data[data.length-1] >= wp-fc)) ? 'bold' : 'lighter',
                            color: ((this.latestSelectableYear.toString()===this.getPlantingYear) && (data[idxFirstFcst-1] <= prewp-fc) && (data[idxFirstFcst-1] >= wp-fc)) ? 'black' : 'gray',
                            fontWeight: ((this.latestSelectableYear.toString()===this.getPlantingYear) && (data[idxFirstFcst-1] <= prewp-fc) && (data[idxFirstFcst-1] >= wp-fc)) ? 'bold' : 'lighter',
                        },
                        align: 'right',
                        x: -4,
                        y: 12
                    },
                    zIndex: 6,
                }],
            },
            tooltip: {
                backgroundColor: 'transparent',
                borderColor: 'black',
                borderRadius: 1,
                borderWidth: 0,
                shadow: false,
                style: {
                    padding: 0,
                    fontSize: '12px',
                },

                crosshairs: [{
                    width: 1,
                    color: 'gray',
                    dashStyle: 'solid'
                },{
                    width: 1,
                    color: 'transparent',
                    dashStyle: 'solid'
                }],
                useHTML: true,
                formatter: function() {
                    var selected_bg_color = null
                    //var recent_bg_color = null
                    var date_label = null
                    var label_color = null
                    selected_bg_color = getDeficitColor(this.point.y)
                    //selected_bg_color = "rgba(255,0,0,0.5)";
                    date_label = (this.series.name === 'Deficit') ? 'Observed on' : 'Forecasted for'
                    label_color = (this.series.name === 'Deficit') ? 'rgba(0,0,255,1.0)' : 'rgba(255,0,0,1.0)'
                    var deficit_value = null
                    deficit_value = (this.point.y < 0.00) ? this.point.y.toFixed(2)+'"' : 'NONE ('+this.point.y.toFixed(2)+'" surplus)'
                    var s = [];
                    s.push('<div>')
                    s.push('<table cellpadding="4">')
                    s.push('<tr>')
                    s.push('<td>')
                    s.push('<span style="font-weight:bold; color:'+label_color+';">'+date_label+': </span>')
                    s.push('</td>')
                    s.push('<td>')
                    s.push('<b>'+moment.utc(this.x).format("MM/DD/YYYY")+' @ 8AM</b>')
                    s.push('</td>')
                    s.push('</tr>')
                    s.push('<tr>')
                    s.push('<td>')
                    s.push('<span style="font-weight:bold; color:'+label_color+';">Water Deficit: </span>')
                    s.push('</td>')
                    s.push('<td>')
                    s.push('<span style="background-color:'+selected_bg_color+'">'+deficit_value+'</span>')
                    s.push('</td>')
                    s.push('</tr>')
                    s.push('</table')
                    s.push('</div>')
                    return s.join('');
                },
                positioner: function (labelWidth, labelHeight, point) {
                    var tooltipX, tooltipY;
                    //var wp_plotline_pixel, yaxis_min;
                    var yaxis_min;
                    //wp_plotline_pixel = this.chart.yAxis[0].toPixels(modeldata.soildata.soilmoistureoptions[this.getSelectedSoilWaterCapacity].wiltingpoint-modeldata.soildata.soilmoistureoptions[this.getSelectedSoilWaterCapacity].fieldcapacity)
                    //wp_plotline_pixel = this.chart.yAxis[0].toPixels(-2.0)
                    yaxis_min = this.chart.yAxis[0].toPixels(this.chart.yAxis[0].min)
                    tooltipX = this.chart.plotLeft
                    //tooltipY = Math.floor((wp_plotline_pixel + yaxis_min -labelHeight)/2.);
                    tooltipY = yaxis_min - 60;
                    return {
                        x: tooltipX,
                        y: tooltipY
                    };
                }
            },
            series: [{
                type: 'line',
                name: 'Deficit',
                pointStart: Date.UTC(parseInt(this.getPlantingYear,10),2,1),
                pointInterval: 24*3600*1000,
                color: 'rgba(0,0,0,0.8)',
                marker: {
                  enabled: true,
                  symbol: 'circle',
                  lineWidth: 1,
                  lineColor: 'rgba(0,0,0,0.8)',
                  radius: 4
                },
                lineWidth: 2,
                data: preprocessMarkerColors(data.slice(0,idxFirstFcst)),
            },{
                type: 'line',
                name: 'Deficit Fcst',
                pointStart: firstFcstDate,
                pointInterval: 24*3600*1000,
                color: 'rgba(0,0,0,0.8)',
                marker: {
                  enabled: true,
                  symbol: 'circle',
                  lineWidth: 1,
                  lineColor: 'rgba(0,0,0,0.8)',
                  radius: 4
                },
                lineWidth: 2,
                dashStyle: 'dot',
                step: false,
                data: preprocessMarkerColors(data.slice(idxFirstFcst)),
            }],
        }
    }

    @observable chart_label="CLICK & DRAG TO ZOOM";
    @action updateChartLabel = (b) => {
            this.chart_label = b;
        }
    @computed get getChartLabel() {
            return this.chart_label
        }

    // Outlook tooltip variables
    @observable outlookTooltipIndex = 1
    @action updateOutlookTooltipIndex = (d) => {
        this.outlookTooltipIndex = d;
    }
    @action initOutlookTooltipIndex = () => {
        this.outlookTooltipIndex = 1
    }
    @computed get getOutlookTooltipIndex() {
            return this.outlookTooltipIndex
        }

    // Outlook tooltip variables
    @observable outlookTooltipDate = ''
    @action updateOutlookTooltipDate = (x) => {
        this.outlookTooltipDate = moment.utc(x).format("MM/DD");
    }
    @action initOutlookTooltipDate = () => {
        this.outlookTooltipDate = ''
    }
    @computed get getOutlookTooltipDate() {
            return this.outlookTooltipDate
        }

    // Outlook config
    @observable outlookConfig = {}
    @action updateOutlookConfig = (data,outlook) => {

        //console.log('TEST OUTLOOK CONFIG DATA');
        //console.log(data);
        //console.log(outlook);

        let sat = modeldata.soildata.soilmoistureoptions[this.getSelectedSoilWaterCapacity].saturation
        let fc = modeldata.soildata.soilmoistureoptions[this.getSelectedSoilWaterCapacity].fieldcapacity
        let stress = modeldata.soildata.soilmoistureoptions[this.getSelectedSoilWaterCapacity].stressthreshold
        let prewp = modeldata.soildata.soilmoistureoptions[this.getSelectedSoilWaterCapacity].prewiltingpoint
        let wp = modeldata.soildata.soilmoistureoptions[this.getSelectedSoilWaterCapacity].wiltingpoint

        // one-day forecast, relative to current date : this is the initial date of focus
        // - data is an array (output from water deficit model) that starts on either:
        //   1. the last irrigation date, if it exists
        //   2. the start of the season, if no irrigation
        let modelStartDate = this.getIrrigationDate ?
                             this.getIrrigationDate.format('MM/DD/YYYY') :
                             this.getFirstDate
        let numberOfFcsts = this.getPrecipFcst.length
        let lastObsDate = moment(modelStartDate, 'MM/DD/YYYY').add(data.length - 1 - numberOfFcsts,'days')
        //let oneDayForecastDate = moment(modelStartDate, 'MM/DD/YYYY').add(data.length,'days')
        let oneDayForecastDate = moment(modelStartDate, 'MM/DD/YYYY').add(data.length - numberOfFcsts,'days')
        //let modelStartDate = moment().set({'year': parseInt(this.getPlantingYear,10), 'month': 2, 'date': 1})
        //let oneDayForecastDate = seasonStartDate.add(data.length,'days')
        this.updateOutlookTooltipDate(oneDayForecastDate);

        // chart starts at last obs value for next 30 days
        // seriesDeficit will have one value (one obs)
        data = data.slice(data.length-1-numberOfFcsts, data.length)
        // seriesDates will have same number of entries as seriesDeficitFcst
        //seriesDates = seriesDates.slice(seriesDates.length-seriesDeficitFcst.length, seriesDates.length)

        // create starting x-axis point of chart as UTC date
        //let pointStart = Date.UTC(parseInt(this.getPlantingYear,10),9,31)
        let pointStart = lastObsDate

        //let getDeficitColor = function (d) {
        //    // return color to use for deficit table value
        //    var col = null;
        //    if (d>fc-fc && d<=sat-fc) {
        //        // Green
        //        col = "rgba(0,128,0,0.5)";
        //    } else if (d>stress-fc && d<=fc-fc) {
        //        // Yellow
        //        col = "rgba(255,255,0,0.5)";
        //    } else if (d>prewp-fc && d<=stress-fc) {
        //        // Orange
        //        col = "rgba(255,128,0,0.5)";
        //    } else if (d<=prewp-fc) {
        //        // Red
        //        col = "rgba(255,0,0,0.5)";
        //    } else {
        //        // No color
        //        col = null;
        //    }
        //    return col;
        //}

        // create series only for chart coloring purposes
        let seriesDeficitAboveFieldCapacity = [];
        let idx = 0;
        for (idx=0; idx<data.length; idx++) {
            if (data[idx]>(fc-sat)) {
                seriesDeficitAboveFieldCapacity.push(data[idx]);
            } else {
                seriesDeficitAboveFieldCapacity.push(fc-sat);
            }
        }

        // find index of latest recharge to field capacity (via irrigation or natural)
        //let lastIdxAboveFieldCapacity = 0;
        //for (idx=0; idx<data.length; idx++) {
        //    if (data[idx]>=(fc-fc)) {
        //        lastIdxAboveFieldCapacity = idx
        //    } else {
        //    }
        //}

        let preprocessMarkerColors = function (data) {
            let nData = [];
            let colorUse = null;
            for (var i = 0; i < data.length; i++) {
                if ((data[i] <= sat-fc) && (data[i] > fc-fc)) {
                    colorUse = 'rgba(0,128,0,0.8)'
                } else if ((data[i] <= fc-fc) && (data[i] > stress-fc)) {
                    colorUse = 'rgba(255,255,0,0.8)'
                } else if ((data[i] <= stress-fc) && (data[i] > prewp-fc)) {
                    colorUse = 'rgba(255,128,0,0.8)'
                } else if ((data[i] <= prewp-fc) && (data[i] > 0.0-fc)) {
                    colorUse = 'rgba(255,0,0,0.8)'
                } else {
                    colorUse = null
                }
                nData.push({
                    y: data[i],
                    //x: i,
                    fillColor: colorUse,
                    color: colorUse
                })
            }
            return nData;
        }

        var createRelativeDate = function (utcDate, n) {
            // utcDate is a UTC date.
            // n is the number of days to add.
            // returns the new date as a UTC date.
            let d = new Date(utcDate);
            d.setDate(d.getDate()+n);
            return Date.UTC(d.getFullYear(),d.getMonth(),d.getDate(),24)
        }

        var combineArraysForOutlookArearange = function (aArr,bArr) {
            // create a 2-D array, with provided arrays as columns in array
            let aTemp = []
            let bTemp = []
            let finalArr = []
            // temporary arrays, to avoid modifying originals
            let i = 0
            for (i=0; i<aArr.length; i++) { aTemp.push(aArr[i]) }
            for (i=0; i<bArr.length; i++) { bTemp.push(bArr[i]) }

            // make sure each array is 31 items long. If it is not, tack appropriate value at end of array to complete shading
            while (aTemp.length<31) { aTemp.push(fc-fc) };
            while (bTemp.length<31) { bTemp.push(fc-fc) };
            // create new 2-D array
            for (i = 0; i < aTemp.length; i++) {
                finalArr.push([aTemp[i],bTemp[i]]);
            }
            return finalArr
        }

        return {
            chart: {
                spacingBottom: 10,
                spacingTop: 10,
                spacingLeft: 10,
                spacingRight: 30,
                height: 460,
                width: 724,
                //width: 679,
                //marginTop: 60,
                backgroundColor: null,
                //zoomType: 'x',
                events: {
                    load: function(){
                        //show tooltip on tomorrow's value
                        let idx = 1
                        var p = [this.series[1].points[idx],this.series[2].points[idx],this.series[3].points[idx],this.series[4].points[idx],this.series[5].points[idx]];
                        this.tooltip.refresh(p);
                        //console.log(e);
                        //var p = [e.target.series[1].data[this.getOutlookTooltipIndex].y, e.target.series[2].data[this.getOutlookTooltipIndex].y,e.target.series[3].data[this.getOutlookTooltipIndex].y,e.target.series[4].data[this.getOutlookTooltipIndex].y,e.target.series[5].data[this.getOutlookTooltipIndex].y];
                        //e.target.tooltip.now = {x:0, y:p};
                        //e.target.tooltip.isHidden = false;
                    }
                }
            },
            plotOptions: {
                series: {
                    states: {
                        hover: {
                            enabled: false
                        }
                    },
                    events: {
                        mouseOut: (e) => {
                            //console.log(e);
                            this.initOutlookTooltipIndex();
                            //console.log(e.target.chart.series[1].data[this.getOutlookTooltipIndex].y);
                            //var p = [e.target.chart.series[1].data[this.getOutlookTooltipIndex].y, e.target.chart.series[2].data[this.getOutlookTooltipIndex].y,e.target.chart.series[3].data[this.getOutlookTooltipIndex].y,e.target.chart.series[4].data[this.getOutlookTooltipIndex].y,e.target.chart.series[5].data[this.getOutlookTooltipIndex].y];
                            this.updateOutlookTooltipDate(e.target.xData[this.getOutlookTooltipIndex]);
                            this.updateOutlookBarChartConfig(outlook);
                        },
                    },
                    point: {
                        events: {
                            mouseOver: (e) => {
                                //const d = new Date(e.target.x);
                                const x = e.target.x;
                                const idx = e.target.index;
                                this.updateOutlookTooltipIndex(idx);
                                this.updateOutlookTooltipDate(x);
                                this.updateOutlookBarChartConfig(outlook);
                                //console.log(this.getOutlookTooltipIndex, this.getOutlookTooltipDate);
                            },
                        }
                    }
                }
            },
            title: {
                text: '30-day water deficit outlook based on historical probabilities',
                margin: 5,
                x: 10 //center
            },
            subtitle: {
                text: '@ '+this.getAddress,
            },
            exporting: {
              chartOptions: {
                chart: {
                  backgroundColor: '#ffffff'
                }
              }
            },
            credits: {
                enabled: false,
            },
            xAxis: {
                type: 'datetime',
                dateTimeLabelFormats: { millisecond: '%H:%M:%S.%L', second: '%H:%M:%S', minute: '%H:%M', hour: '%H:%M', day: '%d %b', week: '%d %b', month: '%b<br/>%Y', year: '%Y' },
                min: pointStart,
                max: createRelativeDate(pointStart,30),
                labels: {
                  rotation: 0,
                  style: {
                      color: '#000000',
                  }
                },
                plotLines: [{
                    value: pointStart,
                    width: 2,
                    color: '#FF0000',
                    dashStyle: 'shortdash',
                    label: {
                        //text: seriesDates[data.length-1],
                        //text: '10/31',
                        text: lastObsDate.format('MM/DD'),
                        align: 'right',
                        rotation: 0,
                        style: {
                            fontSize: '1.0em'
                        },
                        x: 42,
                        y: 20
                    },
                    zIndex: 6,
                }],
            },
            yAxis: {
                min: wp-fc-0.3,
                max: Math.max(0.3, Math.max.apply(null, data)),
                gridLineWidth: 0,
                tickLength: 8,
                tickWidth: 1,
                tickPosition: 'outside',
                tickInterval: 0.5,
                lineWidth: 1,
                labels: {
                    format: '{value:.1f}',
                    style: {
                        color: '#000000',
                    }
                },
                title: {
                    text: 'Water Deficit (in/ft soil)',
                    style: {
                        color: '#000000',
                    }
                },
                plotBands: [{
                    color: 'transparent',
                    from: 0.0,
                    to: sat-fc,
                    label: {
                        text: 'No deficit for plant',
                        style: {
                            fontSize: '1.2em',
                            color: 'gray',
                            fontWeight: 'lighter',
                        },
                        align: 'left',
                        verticalAlign: 'middle',
                        x: 10,
                        y: 5
                    },
                },{
                    color: 'transparent',
                    from: stress-fc,
                    to: fc-fc,
                    label: {
                        text: 'Deficit, no plant stress',
                        style: {
                            fontSize: '1.2em',
                            color: 'gray',
                            fontWeight: 'lighter',
                        },
                        align: 'left',
                        verticalAlign: 'middle',
                        x: 10,
                        y: 5
                    },
                },{
                    color: 'transparent',
                    from: prewp-fc,
                    to: stress-fc,
                    label: {
                        text: 'Deficit, plant stress likely',
                        style: {
                            fontSize: '1.2em',
                            color: 'gray',
                            fontWeight: 'lighter',
                        },
                        align: 'left',
                        verticalAlign: 'middle',
                        x: 10,
                        y: 5
                    },
                },{
                    color: 'transparent',
                    from: wp-fc,
                    to: prewp-fc,
                    label: {
                        //text: 'Deficit, severe plant stress',
                        //text: '',
                        text: (this.getSelectedSoilWaterCapacity!=='high') ? 'Deficit, severe plant stress' : '',
                        style: {
                            fontSize: '1.2em',
                            color: 'gray',
                            fontWeight: 'lighter',
                        },
                        align: 'left',
                        verticalAlign: 'middle',
                        x: 10,
                        y: 5
                    },
                }],
                plotLines: [{
                    value: sat-fc,
                    width: 2.0,
                    color: 'rgba(0,0,255,0.8)',
                    dashStyle: 'Dash',
                    label: {
                        text: 'Saturation',
                        style: {
                            fontSize: '0.8em',
                            color: 'rgba(0,0,255,0.8)',
                            fontWeight: 'bold',
                        },
                        align: 'right',
                        x: -4,
                        y: 12
                    },
                    zIndex: 5,
                },{
                    value: 0.0,
                    width: 2.0,
                    color: 'rgba(0,0,255,0.8)',
                    dashStyle: 'Dash',
                    label: {
                        text: 'Field Capacity',
                        style: {
                            fontSize: '0.8em',
                            color: 'rgba(0,0,255,0.8)',
                            fontWeight: 'bold',
                        },
                        align: 'right',
                        x: -4,
                        y: 12
                    },
                    zIndex: 5,
                },{
                    value: stress-fc,
                    width: 2.0,
                    color: 'rgba(0,0,255,0.8)',
                    dashStyle: 'Dash',
                    label: {
                        text: 'Plant Stress Begins',
                        style: {
                            fontSize: '0.8em',
                            color: 'rgba(0,0,255,0.8)',
                            fontWeight: 'bold',
                        },
                        align: 'right',
                        x: -4,
                        y: 12
                    },
                    zIndex: 5,
                },{
                    value: prewp-fc,
                    width: 2.0,
                    color: 'rgba(0,0,255,0.8)',
                    dashStyle: 'Dash',
                    label: {
                        text: 'Wilting Danger Exists',
                        style: {
                            fontSize: '0.8em',
                            color: 'rgba(0,0,255,0.8)',
                            fontWeight: 'bold',
                        },
                        align: 'right',
                        x: -4,
                        y: 12
                    },
                    zIndex: 5,
                }],
            },
            tooltip: {
                enabled: true,
                hideDelay: 200,
                shared: true,
                backgroundColor: 'transparent',
                borderColor: 'black',
                borderRadius: 1,
                borderWidth: 0,
                shadow: false,
                style: {
                    padding: 10,
                    fontSize: '12px',
                },

                crosshairs: [{
                    width: 1,
                    color: 'gray',
                    dashStyle: 'solid'
                },{
                    width: 1,
                    color: 'transparent',
                    dashStyle: 'solid'
                }],
                useHTML: true,
                formatter: function() {
                    var s = [];
                    s.push('<table cellpadding="2">')
                    s.push('<tr>')
                    s.push('<td>')

                    s.push('<table>')
                    s.push('<tr>')
                    s.push('<td>')
                    //s.push('<b><span style="color:red">Valid Date:</span> '+Highcharts.dateFormat('%m/%d/%Y @ 8AM', this.x)+'</b>')
                    s.push('<b><span style="color:red">Valid Date:</span> '+moment.utc(this.x).format("MM/DD/YYYY")+' @ 8AM</b>')
                    s.push('</td>')
                    s.push('</tr>')
                    s.push('</table>')
                    s.push('<table cellpadding="2">')
                    s.push('<tr>')
                    s.push('<td>')
                    s.push('<span style="color:red; font-weight:bold">Probability:</span>')
                    s.push('</td>')
                    jQuery.each(this.points,
                        function(i, point) {
                            if (point.series.name!=='Deficit' && point.series.name!=='Deficit Fcst' && point.series.name.indexOf('area') === -1 && this.point.x!==0) {
                                s.push('<td style="text-align: center; font-weight: bold; color: '+this.series.color+'"><u>'+ this.series.name +'</u></td>');
                            } else {
                            }
                        }
                    );
                    s.push('</tr>')
                    s.push('<tr>')
                    s.push('<td>')
                    s.push('<span style="color:red; font-weight:bold">Water Deficit:</span>')
                    s.push('</td>')
                    jQuery.each(this.points,
                        function(i, point) {
                            if (point.series.name!=='Deficit' && point.series.name!=='Deficit Fcst' && point.series.name.indexOf('area') === -1 && this.point.x!==0) {
                                s.push('<td style="text-align: center; font-weight: bold">'+this.point.y.toFixed(2) +'"</td>');
                            } else {
                            }
                        }
                    );
                    s.push('</tr>')
                    s.push('</table>')

                    s.push('</td>')
                    s.push('<td style="padding: 15px;"')
                    s.push('</td>')
                    s.push('<td>')
                    s.push('<div id="chartInTooltip"></div>')
                    s.push('</td>')
                    s.push('</tr>')
                    s.push('</table>')
                    return s.join('');
                },
                positioner: function (labelWidth, labelHeight, point) {
                    var tooltipX, tooltipY;
                    var yaxis_min;
                    yaxis_min = this.chart.yAxis[0].toPixels(this.chart.yAxis[0].min)
                    tooltipX = this.chart.plotLeft
                    tooltipY = yaxis_min - 80;
                    return {
                        x: tooltipX,
                        y: tooltipY
                    };
                }
            },
            legend: {
                enabled: false
            },
            series: [{
                type: 'line',
                name: 'Deficit',
                pointStart: pointStart,
                pointInterval: 24*3600*1000,
                color: 'rgba(0,0,0,0.8)',
                marker: {
                  enabled: true,
                  symbol: 'circle',
                  lineWidth: 1,
                  lineColor: 'rgba(0,0,0,0.8)',
                  radius: 4
                },
                lineWidth: 2,
                data: preprocessMarkerColors(data),
                zIndex: 7,
            },{
                type: 'line',
                name: '10%',
                pointStart: pointStart,
                pointInterval: 24*3600*1000,
                linkedTo: ':previous',
                color: 'rgba(160,82,45,0.8)',
                lineWidth: 2,
                marker: {
                  enabled: false,
                },
                data: outlook.pointsToPlot['10'],
                zIndex: 6,
            },{
                type: 'line',
                name: '25%',
                pointStart: pointStart,
                pointInterval: 24*3600*1000,
                linkedTo: ':previous',
                color: 'rgba(160,82,45,0.8)',
                lineWidth: 2,
                marker: {
                  enabled: false,
                },
                data: outlook.pointsToPlot['25'],
                zIndex: 6,
            },{
                type: 'line',
                name: '50%',
                pointStart: pointStart,
                pointInterval: 24*3600*1000,
                linkedTo: ':previous',
                color: 'rgba(0,0,0,0.8)',
                lineWidth: 3,
                marker: {
                  enabled: false,
                },
                data: outlook.pointsToPlot['50'],
                zIndex: 6,
            },{
                type: 'line',
                name: '25%',
                pointStart: pointStart,
                pointInterval: 24*3600*1000,
                linkedTo: ':previous',
                color: 'rgba(0,128,0,0.8)',
                lineWidth: 2,
                marker: {
                  enabled: false,
                },
                data: outlook.pointsToPlot['75'],
                zIndex: 6,
            },{
                type: 'line',
                name: '10%',
                pointStart: pointStart,
                pointInterval: 24*3600*1000,
                linkedTo: ':previous',
                color: 'rgba(0,128,0,0.8)',
                lineWidth: 2,
                marker: {
                  enabled: false,
                },
                data: outlook.pointsToPlot['90'],
                zIndex: 6,
            },{
                showInLegend: false,
                type: 'arearange',
                name: 'area25%',
                pointStart: pointStart,
                pointInterval: 24*3600*1000,
                linkedTo: ':previous',
                color: 'rgb(222,184,135)',
                lineWidth: 2,
                data: combineArraysForOutlookArearange(outlook.pointsToPlot['25'],outlook.pointsToPlot['50']),
            },{
                showInLegend: false,
                type: 'arearange',
                name: 'area10%',
                pointStart: pointStart,
                pointInterval: 24*3600*1000,
                linkedTo: ':previous',
                color: 'rgba(245,222,179,0.3)',
                lineWidth: 2,
                data: combineArraysForOutlookArearange(outlook.pointsToPlot['10'],outlook.pointsToPlot['25']),
            },{
                showInLegend: false,
                type: 'arearange',
                name: 'area75%',
                pointStart: pointStart,
                pointInterval: 24*3600*1000,
                linkedTo: ':previous',
                color: 'rgba(170,255,170,0.3)',
                //color: 'rgba(220,220,220,0.3)',
                lineWidth: 2,
                data: combineArraysForOutlookArearange(outlook.pointsToPlot['75'],outlook.pointsToPlot['50']),
            },{
                showInLegend: false,
                type: 'arearange',
                name: 'area90%',
                pointStart: pointStart,
                pointInterval: 24*3600*1000,
                linkedTo: ':previous',
                color: 'rgba(210,255,210,0.3)',
                //color: 'rgba(220,220,220,0.3)',
                lineWidth: 2,
                data: combineArraysForOutlookArearange(outlook.pointsToPlot['90'],outlook.pointsToPlot['75']),
            //},{
            //    showInLegend: false,
            //    name: 'Deficit Fcst',
            //    lineWidth: 0,
            //    lineColor: 'rgba(0,0,0,0.8)',
            //    pointStart: pointStart,
            //    pointInterval: 24*3600*1000,
            //    linkedTo: ':previous',
            //    marker: {
            //      enabled: true,
            //      symbol: 'circle',
            //      lineWidth: 1,
            //      lineColor: 'rgba(0,0,0,0.8)',
            //      radius: 4
            //    },
            //    data: preprocessMarkerColors(seriesDeficitFcst),
            //    zIndex: 7,
            }],
        }
    }


    // Outlook config
    @observable outlookBarChartConfig = {}
    @action updateOutlookBarChartConfig = (outlook) => {
        let tooltipIdx = this.getOutlookTooltipIndex;
        let tooltipDate = this.getOutlookTooltipDate;
        //console.log(tooltipIdx);
        //console.log(outlook.thresholdPercentiles['fc'][tooltipIdx]);

        //return {
        this.outlookBarChartConfig =  {
            plotOptions: {
                bar: {
                    dataLabels: {
                        enabled: true,
                        style: {
                            color: "rgb(0,0,0)",
                            fontSize: "8px",
                            fontWeight: "bold",
                            textOutline: "1px contrast",
                        },
                        formatter:function() {
                            return parseInt(this.y,10).toString() + '%';
                        },
                        x: -2,
                        y: -2,
                    }
                }
            },
            chart: {
                type: 'bar',
                spacingBottom: 0,
                spacingTop: 10,
                spacingLeft: 0,
                spacingRight: 0,
                backgroundColor: null,
                width: 260,
                height: 55,
            },
            title:{
                  text: 'Probability of deficit category on ' + tooltipDate,
                  floating: true,
                  margin: 0,
                  x: -10,
                  y: -2,
                  style: {
                     color: 'rgba(0,0,0,1.0)',
                     fontSize: '10px',
                     fontWeight: 'bold',
                 }
            },
            subtitle:{
                  text: null
            },
            tooltip:{
                  enabled: false
            },
            credits:{
                  enabled: false
            },
            legend:{
                  enabled: false
            },
            exporting:{
                  enabled: false
            },
            xAxis: {
                categories: ['None', 'Small', 'Stress', 'Severe'],
                labels: {
                    style: {
                        fontWeight: "bold",
                        fontSize: "9px",
                    },
                    step: 1,
                    x: -2,
                    y: 3,
                },
                title: {
                    text: null
                },
                lineColor: 'transparent',
                //minPadding: 0,
                //maxPadding: 0,
                tickLength: 0
            },
            yAxis: {
                min: 0,
                max: 100,
                labels: {
                    enabled: false
                },
                title: {
                    text: null
                },
            },
            series: [{
                animation: false,
                data: [
                    {y: 100.-outlook.thresholdPercentiles['fc'][tooltipIdx], color: 'rgba(0,128,0,0.8)'},
                    {y: outlook.thresholdPercentiles['fc'][tooltipIdx] - outlook.thresholdPercentiles['ps'][tooltipIdx], color: 'rgba(255,255,0,0.8)'},
                    {y: outlook.thresholdPercentiles['ps'][tooltipIdx] - outlook.thresholdPercentiles['pwp'][tooltipIdx], color: 'rgba(255,128,0,0.8)'},
                    {y: outlook.thresholdPercentiles['pwp'][tooltipIdx], color: 'rgba(255,0,0,0.8)'},
                ]
            }]
        }
    }
    @computed get getOutlookBarChartConfig() {
        return this.outlookBarChartConfig
    }

    // API -------------------------------------------------------------------------------
    //@observable precip = [];
    @observable precip = null;
    @action updatePrecip = (p) => {
            if (this.getPrecip) { this.precip.clear() };
            //this.precip = p;
            this.precip = nullifyMissingData(p,miss);
        }
    @computed get getPrecip() {
            return this.precip
        }

    @observable precip_fcst = null;
    @action updatePrecipFcst = (p) => {
            if (this.getPrecipFcst) { this.precip_fcst.clear() };
            //this.precip_fcst = p;
            this.precip_fcst = nullifyMissingData(p,miss);
        }
    @computed get getPrecipFcst() {
            return this.precip_fcst
        }

    //@observable pet = [];
    @observable pet = null;
    @action updatePet = (p) => {
            if (this.getPet) { this.pet.clear() }
            //this.pet = p;
            this.pet = nullifyMissingData(p,miss);
        }
    @computed get getPet() {
            return this.pet
        }

    @observable pet_fcst = null;
    @action updatePetFcst = (p) => {
            if (this.getPetFcst) { this.pet_fcst.clear() }
            //this.pet_fcst = p;
            this.pet_fcst = nullifyMissingData(p,miss);
        }
    @computed get getPetFcst() {
            return this.pet_fcst
        }

    @observable clim = {};
    @action updateClim = (c) => {
            this.clim = c;
        }
    @computed get getClim() {
            return this.clim
        }

    @observable first_date = "03/01/"+this.latestSelectableYear;
    @action updateFirstDate = (v) => {
            //this.first_date = v;
            this.first_date = v.slice(0,6)+this.getPlantingYear;
        }
    @computed get getFirstDate() {
            return this.first_date
        }

    @action downloadResultData = () => {
            if (this.getLoaderResults === false) { this.updateLoaderResults(true); }
            if (this.isDownloadingResultData === false) { this.updateDownloadingResultDataStatus(true); }
            const url = 'http://tools.climatesmartfarming.org/irrigationtool/datahdf5/?lat='+this.getLat+'&lon='+this.getLon+'&year='+this.getPlantingYear
            //const url = 'http://tools.climatesmartfarming.org/irrigationtool/datahdf5/?lat='+lt+'&lon='+ln+'&year='+yr
            jsonp(url, null, (err,data) => {
                if (err) {
                    console.error(err.message);
                    return
                } else {
                    //console.log('DOWNLOADED RESULTS DATA COMPLETE');
                    //console.log(this.getPlantingYear);
                    this.updatePrecip(data.precip);
                    this.updatePrecipFcst(data.precip_fcst);
                    this.updatePet(data.pet);
                    this.updatePetFcst(data.pet_fcst);
                    //this.updatePrecip(data.precip.concat(data.precip_fcst));
                    //this.updatePet(data.pet.concat(data.pet_fcst));
                    this.updateFirstDate(data.first_date);
                    if (this.getLoaderResults === true) { this.updateLoaderResults(false); }
                    if (this.isDownloadingResultData === true) { this.updateDownloadingResultDataStatus(false); }
                    return
                }
            });
        }

    @action downloadOutlookData = () => {
            if (this.getLoaderOutlook === false) { this.updateLoaderOutlook(true); }
            if (this.isDownloadingOutlookData === false) { this.updateDownloadingOutlookDataStatus(true); }
            const url = 'http://tools.climatesmartfarming.org/irrigationtool/clim/'
            jsonp(url, null, (err,data) => {
                if (err) {
                    console.error(err.message);
                    return
                } else {
                    //console.log('DOWNLOADED OUTLOOK DATA COMPLETE');
                    this.updateClim(data);
                    this.updateOutlookTooltipIndex(1);
                    //this.updateOutlookTooltipDate(x);
                    //this.updateOutlookBarChartConfig(outlook);
                    if (this.getLoaderOutlook === true) { this.updateLoaderOutlook(false); }
                    if (this.isDownloadingOutlookData === true) { this.updateDownloadingOutlookDataStatus(false); }
                    return
                }
            });
        }
 
}

