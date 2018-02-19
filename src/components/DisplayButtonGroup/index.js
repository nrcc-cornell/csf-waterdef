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
import ResultsButton from '../../components/ResultsButton';
import Next30Button from '../../components/Next30Button';
import ClimateChangeButton from '../../components/ClimateChangeButton';
import InfoButton from '../../components/InfoButton';

import '../../styles/DisplayButtonGroup.css';

class DisplayButtonGroup extends Component {

  render() {
        return (
            <div className="display-button-group">
                    <table><tbody>
                    <tr>
                    <td>
                      <ResultsButton button_label="Season to Date" />
                    </td>
                    </tr>
                    <tr>
                    <td>
                      <Next30Button button_label="30-Day Outlook" />
                    </td>
                    </tr>
                    <tr>
                    <td>
                      <ClimateChangeButton button_label="Climate Change" />
                    </td>
                    </tr>
                    <tr>
                    <td>
                      <InfoButton button_label="Info" />
                    </td>
                    </tr>
                    </tbody></table>
            </div>
        )
  }

};

export default DisplayButtonGroup;
