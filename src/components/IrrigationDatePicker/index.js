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
import PropTypes from 'prop-types';
import { inject, observer } from 'mobx-react';
import DatePicker from 'react-datepicker';
import { withBaseIcon } from 'react-icons-kit';
import { calendar } from 'react-icons-kit/fa/calendar';
import moment from 'moment';

import 'react-datepicker/dist/react-datepicker.css';
import '../../styles/IrrigationDatePicker.css';

const validMonths = [3,4,5,6,7,8,9,10]

class DatePickerButton extends Component {
    static propTypes = {
        onClick: PropTypes.func,
        value: PropTypes.string
    };
    render() {
        const {value, onClick} = this.props;
        const IconGreen14 = withBaseIcon({ size: 14, style: {color:'#006600'}});
        let dateText = value ? value : 'NONE'

        return (
            <div className="date-picker-button-group">
                <button
                  className="date-picker-button"
                  onClick={onClick}>
                  {dateText}
                  <IconGreen14 icon={calendar} className="cal-icon" onClick={onClick} />
                </button>
            </div>
        );
    }
}

@inject("store") @observer
class IrrigationDatePicker extends Component {

  isMonthInGrowingSeason = (d) => {
    let month = moment(d).month() + 1
    //let validMonths = [3,4,5,6,7,8,9,10]
    return validMonths.includes(month)
  }

  render() {
        //const irrigationDatepickerClassName = this.props.store.app.getPlantingYear==='2017' ? 'irrigation-datepicker-show' : 'irrigation-datepicker-display-none';
        const irrigationDatepickerClassName = 'irrigation-datepicker-show';
        //let open_to_date_in_past_year = this.props.store.app.getIrrigationDate ? this.props.store.app.getIrrigationDate : moment(this.props.store.app.getPlantingYear+"-06-01")
        let open_to_date_in_past_year = this.props.store.app.getIrrigationDate ? this.props.store.app.getIrrigationDate : moment(this.props.store.app.getPlantingYear+"-06-01")
        let open_to_date = ((this.props.store.app.getPlantingYear===this.props.store.app.latestSelectableYear.toString()) && validMonths.includes(moment().month()+1)) ? moment() : open_to_date_in_past_year
        let max_date = ((this.props.store.app.getPlantingYear===this.props.store.app.latestSelectableYear.toString()) && validMonths.includes(moment().month()+1)) ? moment() : moment(this.props.store.app.getPlantingYear+"-10-31")
        return (
            <div className={irrigationDatepickerClassName}>
            <div className='datepicker-input-label'>
              <label><b>Last Irrigation Date</b></label>
            </div>
            <div className='datepicker-div'>
              <DatePicker
                  customInput={<DatePickerButton />}
                  className='input-date'
                  calendarClassName='calendar-pdate'
                  readOnly={true}
                  fixedHeight={true}
                  selected={this.props.store.app.getIrrigationDate}
                  //selected={moment(this.props.store.app.getIrrigationDate,"MM-DD-YYYY")}
                  openToDate={open_to_date}
                  onChange={this.props.store.app.updateIrrigationDate}
                  minDate={moment(this.props.store.app.getPlantingYear+"-03-01")}
                  //maxDate={moment(this.props.store.app.getPlantingYear+"-10-31")}
                  maxDate={max_date}
                  filterDate={this.isMonthInGrowingSeason}
                  popperPlacement="right"
                  popperModifiers={{
                    offset: {
                      enabled: true,
                      offset: '-80px, 5px'
                    },
                  }}
                  placeholderText="NONE"
              >
                <div className="calendar-message">
                  Select Last Irrigation Date
                </div>
              </DatePicker>
            </div>
            </div>
        )
  }

};

export default IrrigationDatePicker;
