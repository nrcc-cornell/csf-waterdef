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
import Select from 'react-select';
import 'react-select/dist/react-select.css';

import '../../styles/SoilWaterCapacitySelect.css';

const selectLabels = ['High (Clay, fine texture)','Medium (Loam, med texture)','Low (Sand, coarse texture)']
const selectValues = ['high','medium','low']

var disabled
var selectOptions = []
for(var idx=0; idx<selectValues.length; idx++){
    disabled = false
    //selectOptions.push({ value: selectValues[idx].toString(), label: selectLabels[idx].toString(), clearableValue: false, disabled: disabled })
    selectOptions.push({ value: selectValues[idx], label: selectLabels[idx], clearableValue: false, disabled: disabled })
}

@inject("store") @observer
class SoilWaterCapacitySelect extends Component {

  render() {
        return (
            <div className='input-div'>
            <div className='input-label'>
              <label><b>Soil Water Capacity</b></label>
            </div>
            <div className='select-div'>
                <Select
                    name="capacity"
                    value={this.props.store.app.getSelectedSoilWaterCapacity}
                    clearable={false}
                    options={selectOptions}
                    onChange={this.props.store.app.updateSelectedSoilWaterCapacity}
                />
            </div>
            </div>
        )
  }

};

export default SoilWaterCapacitySelect;
