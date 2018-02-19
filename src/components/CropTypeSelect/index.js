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

import CropTypeInfoButton from '../../components/CropTypeInfoButton';

import '../../styles/CropTypeSelect.css';

const selectLabels = [
    'Grass Reference',
    'Cereals',
    'Forages',
    'Grapes (wine)',
    'Legumes',
    'Roots and Tubers',
    'Vegetables (Small) - Short Season',
    'Vegetables (Small) - Long Season',
    'Vegetables (Solanum Family)',
    'Vegetables (Cucumber Family)'
  ]

const selectValues = [
    'grass',
    'cereals',
    'forages',
    'grapes',
    'legumes',
    'rootstubers',
    'vegsmallshort',
    'vegsmalllong',
    'vegsolanum',
    'vegcucumber'
  ]

var disabled
var selectOptions = []
for(var idx=0; idx<selectValues.length; idx++){
    disabled = false
    selectOptions.push({ value: selectValues[idx].toString(), label: selectLabels[idx].toString(), clearableValue: false, disabled: disabled })
}

@inject("store") @observer
class CropTypeSelect extends Component {

  render() {
        return (
            <div className='input-div'>
            <div className='input-label'>
              <label><b>Crop Type</b></label>&nbsp;
              <CropTypeInfoButton button_label="" />
            </div>
            <div className='select-div'>
                <Select
                    name="crop"
                    value={this.props.store.app.getSelectedCropType}
                    clearable={false}
                    options={selectOptions}
                    onChange={this.props.store.app.updateSelectedCropType}
                />
            </div>
            </div>
        )
  }

};

export default CropTypeSelect;
