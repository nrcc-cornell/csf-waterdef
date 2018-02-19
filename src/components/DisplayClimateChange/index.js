import React, { Component } from 'react';
import { inject, observer } from 'mobx-react';
import { any } from 'prop-types'

import '../../styles/DisplayClimateChange.css';

@inject("store") @observer
class DisplayClimateChange extends Component {

  static propTypes = {
    content: any,
  }

  static defaultProps = {
    content: <h2>Climate Change Projection Content</h2>,
  }

  render() {
        const className = this.props.store.app.climateChangeStatus ? 'climate-change-display-active' : 'climate-change-display-none';
        return (
            <div className={className}>
              <div className="climate-change-display-content">
                 {this.props.content}
              </div>
            </div>
        )
  }

};

export default DisplayClimateChange;
