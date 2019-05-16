import React, { Component } from 'react';
import PropTypes from 'prop-types';
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  ViewPropTypes,
  TouchableOpacity,
} from 'react-native';
import * as Animatable from 'react-native-animatable';

const styles = StyleSheet.create({
  containerDefault: {},
  cellDefault: {
    borderColor: 'gray',
    borderWidth: 1,
  },
  cellFocusedDefault: {
    borderColor: 'black',
    borderWidth: 1,
  },
  textStyleDefault: {
    color: 'gray',
    fontSize: 24,
  },
  textStyleFocusedDefault: {
    color: 'black',
  },
});

class SmoothPinCodeInput extends Component {

  state = {
    maskDelay: false,
    focused: false,
  };
  ref = React.createRef();
  inputRef = React.createRef();

  shake = () => {
    return this.ref.current.shake(650);
  };

  focus = () => {
    return this.inputRef.current.focus();
  };

  blur = () => {
    return this.inputRef.current.blur();
  };

  _inputCode = (code) => {
    const { password, codeLength = 4, onTextChange, onFulfill } = this.props;

    if (onTextChange) {
      onTextChange(code);
    }
    if (code.length === codeLength && onFulfill) {
      onFulfill(code);
    }

    // handle password mask
    const maskDelay = password &&
      code.length - 1 > this.props.value.length; // only when input new char
    this.setState({ maskDelay });

    if (maskDelay) { // mask password after delay
      setTimeout(() => this.setState({ maskDelay: false }), 200);
    }
  };

  _keyPress = (event) => {
    if (event.nativeEvent.key === 'Backspace') {
      const { value, onBackspace } = this.props;
      if (value === '' && onBackspace) {
        onBackspace();
      }
    }
  };

  _onFocused = (focused) => {
    this.setState({ focused });
  };

  render() {
    const {
      value,
      codeRows, codeLength, cellSize, cellSpacing,
      placeholder,
      password,
      mask,
      autoFocus,
      containerStyle,
      cellStyle,
      cellStyleFocused,
      textStyle,
      textStyleFocused,
      keyboardType,
      animationFocused,
      ignoreCase,
      testID
    } = this.props;
    const { maskDelay, focused } = this.state;
    return (
      <Animatable.View
        ref={this.ref}
        style={[{
          alignItems: 'stretch', justifyContent: 'center', position: 'relative',
          width: cellSize * codeLength + cellSpacing * (codeLength - 1),
          height: cellSize*codeRows + cellSpacing * (codeRows - 1),
        },
          containerStyle,
        ]}>
        <View>
        {
          Array.apply(null, Array(codeRows)).map((_, row) => {
            return (
              <View style={{
                position: 'absolute', margin: 0, height: '100%',
                flexDirection: 'row',
                alignItems: 'center',
                top: row*cellSize + row*cellSpacing
              }}
              key={row}
              >
                {
                  Array.apply(null, Array(codeLength)).map((_, idx) => {
                    const gIdx = row*codeLength + idx
                    const cellFocused = focused && ((gIdx === value.length) || (value.length === codeLength*codeRows && gIdx === value.length - 1));
                    const filled = gIdx < value.length;
                    const last = (gIdx === value.length - 1);

                    return (
                      <Animatable.View
                        key={gIdx}
                        style={[
                          {
                            width: cellSize,
                            height: cellSize,
                            marginLeft: cellSpacing / 2,
                            marginRight: cellSpacing / 2,
                            flexDirection: 'row',
                            alignItems: 'center',
                            justifyContent: 'center',
                          },
                          cellStyle,
                          cellFocused ? cellStyleFocused : {},
                        ]}
                        animation={gIdx === value.length && focused ? animationFocused : null}
                        iterationCount="infinite"
                        duration={500}
                      >
                        <Text
                          style={[
                            textStyle,
                            cellFocused ? textStyleFocused : {},
                          ]}>
                          {filled && (password && (!maskDelay || !last)) ? mask : (value ? value.toUpperCase().charAt(gIdx) : '')}
                          {!filled && placeholder}
                        </Text>
                      </Animatable.View>
                    );
                  })
                }
              </View>
            );
        })}
        </View>
        <TouchableOpacity
          style={{
              flex: 1,
              opacity: 0,
              textAlign: 'center',
              alignItems: "flex-end",
              flexDirection: "row",
              marginTop: -cellSize/2,
              marginBottom: cellSize/2,
              marginLeft: cellSpacing/2,
              marginRight: -cellSpacing/2,
            }}
          onPress={() => this.inputRef && this.inputRef.current.focus()}
        >
        <TextInput
          textContentType={'password'}
          value={value}
          ref={this.inputRef}
          testID={this.testID}
          onChangeText={this._inputCode}
          onKeyPress={this._keyPress}
          onFocus={() => this._onFocused(true)}
          onBlur={() => this._onFocused(false)}
          spellCheck={false}
          autoFocus={autoFocus}
          keyboardType={keyboardType}
          numberOfLines={codeRows}
          maxLength={codeRows*codeLength}
          selection={{
            start: value.length,
            end: value.length,
          }}
          style={{
            textAlign: 'center',
            opacity: 0
          }} />
          </TouchableOpacity>
      </Animatable.View>
    );
  }

  static defaultProps = {
    value: '',
    codeRows: 1,
    codeLength: 4,
    cellSize: 48,
    cellSpacing: 4,
    placeholder: '',
    password: false,
    mask: '*',
    keyboardType: 'numeric',
    autoFocus: false,
    containerStyle: styles.containerDefault,
    cellStyle: styles.cellDefault,
    cellStyleFocused: styles.cellFocusedDefault,
    textStyle: styles.textStyleDefault,
    textStyleFocused: styles.textStyleFocusedDefault,
    animationFocused: 'pulse',
    ignoreCase: false
  };
}

SmoothPinCodeInput.propTypes = {
  value: PropTypes.string,
  codeLength: PropTypes.number,
  cellSize: PropTypes.number,
  cellSpacing: PropTypes.number,

  placeholder: PropTypes.string,
  mask: PropTypes.string,
  password: PropTypes.bool,

  autoFocus: PropTypes.bool,

  containerStyle: ViewPropTypes.style,

  cellStyle: ViewPropTypes.style,
  cellStyleFocused: ViewPropTypes.style,

  textStyle: Text.propTypes.style,
  textStyleFocused: Text.propTypes.style,

  animationFocused: PropTypes.oneOfType([
    PropTypes.string,
    PropTypes.object,
  ]),

  onFulfill: PropTypes.func,
  onChangeText: PropTypes.func,
  onBackspace: PropTypes.func,

  keyboardType: PropTypes.string,
};

export default SmoothPinCodeInput;
