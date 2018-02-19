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
import { string, any } from 'prop-types'
import jQuery from 'jquery';
import 'jquery-ui/themes/base/core.css';
import 'jquery-ui/themes/base/theme.css';
import 'jquery-ui/themes/base/button.css';
import 'jquery-ui/ui/core';
import 'jquery-ui/ui/widgets/button';

import '../../styles/CropTypeInfoWindow.css';

@inject("store") @observer
class CropTypeInfoWindow extends Component {

  static propTypes = {
    content: any,
    button_label: string,
  }

  static defaultProps = {
    content: <h2>Popup Content</h2>,
    button_label: "Back",
  }

  componentDidMount() {
    jQuery(".crop-type-into-button-return").button({
       icons: { primary: "ui-icon-arrowreturnthick-1-w" },
       label: this.props.button_label,
    });
  }

  render() {
    const className = this.props.store.app.cropTypeInfoStatus ? 'crop-type-info' : 'crop-type-info-display-none';
    return (
        <div className={className}>
           <div>
               <button className="data-sources-button-return" onClick={this.props.store.app.updateCropTypeInfoStatus}>return</button>
           </div>
           <div className="crop-type-info-content">
               {this.props.content}
           </div>
        </div>
    );
  }

}

export default CropTypeInfoWindow;
