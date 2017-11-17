/*
 * Backpack - Skyscanner's Design System
 *
 * Copyright 2017 Skyscanner Ltd
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

import {
  ScrollView,
  Platform,
  StyleSheet,
  View,
  ViewPropTypes,
} from 'react-native';
import React from 'react';
import PropTypes from 'prop-types';

import BpkHorizontalNavSelectedIndicator from './BpkHorizontalNavSelectedIndicator';
import withAnimatedProps from './withAnimatedProps';

const AnimatedIndicator = withAnimatedProps(BpkHorizontalNavSelectedIndicator, ['xOffset', 'width']);

const tokens = Platform.select({
  ios: () => require('bpk-tokens/tokens/ios/base.react.native.common.js'), // eslint-disable-line global-require
  android: () => require('bpk-tokens/tokens/android/base.react.native.common.js'), // eslint-disable-line global-require
})();

const styles = StyleSheet.create({
  horizontalNav: {
    borderColor: 'transparent',
    borderBottomColor: tokens.colorGray100,
    borderWidth: tokens.borderSizeSm,
  },
  horizontalNavInner: {
    flexDirection: 'row',
  },
  spaceAround: {
    flex: 0,
    flexGrow: 1,
    justifyContent: 'space-around',
  },
});

class BpkHorizontalNav extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      indicatorOffsetX: null,
      indicatorWidth: null,
    };
    this.onChildLayout = this.onChildLayout.bind(this);
  }

  componentWillReceiveProps(nextProps) {
    if (nextProps.selectedId && this.childrenPositions[nextProps.selectedId]) {
      const nextLayoutProps = this.childrenPositions[nextProps.selectedId];
      this.setState({
        indicatorOffsetX: nextLayoutProps.x,
        indicatorWidth: nextLayoutProps.width,
      });
    }
  }

  onChildLayout(event, id) {
    const { width, x } = event.nativeEvent.layout;
    this.childrenPositions[id] = { width, x };

    // If the child in question is the initially selected one, the indicator can now be positioned.
    if (this.props.selectedId === id) {
      this.setState({
        indicatorOffsetX: x,
        indicatorWidth: width,
      });
    }
  }

  childrenPositions = {};

  render() {
    const {
      children,
      selectedId,
      spaceAround,
      style,
      ...rest
    } = this.props;

    const navStyle = [styles.horizontalNav];
    if (spaceAround) { navStyle.push(styles.spaceAround); }

    const enhancedChildren = React.Children.map(children, child => (
      React.isValidElement(child) && React.cloneElement(child, {
        key: child.props.id,
        selected: selectedId === child.props.id,

        // Have children report their layout details after being laid out.
        // This allows the selected indicator to be correctly positioned.
        onLayout: event => this.onChildLayout(event, child.props.id),
      })));

    const renderIndicator = () => {
      if (this.state.indicatorOffsetX === null) {
        return null;
      }
      return <AnimatedIndicator xOffset={this.state.indicatorOffsetX} width={this.state.indicatorWidth} />;
    };

    return (
      <ScrollView
        alwaysBounceHorizontal={false}
        contentContainerStyle={[navStyle, style]}
        horizontal
        showsHorizontalScrollIndicator={false}
        {...rest}
      >
        <View>
          <View style={styles.horizontalNavInner}>
            {enhancedChildren}
          </View>
          { renderIndicator() }
        </View>
      </ScrollView>
    );
  }
}

BpkHorizontalNav.propTypes = {
  children: PropTypes.node.isRequired,
  selectedId: PropTypes.string.isRequired,
  spaceAround: PropTypes.bool,
  style: ViewPropTypes.style,
};

BpkHorizontalNav.defaultProps = {
  spaceAround: false,
  style: null,
};

export default BpkHorizontalNav;
