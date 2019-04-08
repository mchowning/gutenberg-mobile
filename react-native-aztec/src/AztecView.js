import PropTypes from 'prop-types';
import React from 'react';
import ReactNative, {requireNativeComponent, ViewPropTypes, UIManager, ColorPropType, TouchableWithoutFeedback} from 'react-native';
import TextInputState from 'react-native/lib/TextInputState';

const AztecManager = UIManager.getViewManagerConfig('RCTAztecView');

class AztecView extends React.Component {
  selectionEndCaretY: number;

  static propTypes = {
    activeFormats: PropTypes.array,
    isSelected: PropTypes.bool,
    disableGutenbergMode: PropTypes.bool,
    text: PropTypes.object,
    placeholder: PropTypes.string,
    placeholderTextColor: ColorPropType,
    color: ColorPropType,
    maxImagesWidth: PropTypes.number,
    minImagesWidth: PropTypes.number,
    onChange: PropTypes.func,
    onFocus: PropTypes.func,
    onBlur: PropTypes.func,
    onContentSizeChange: PropTypes.func,
    onEnter: PropTypes.func,
    onBackspace: PropTypes.func,
    onScroll: PropTypes.func,
    onSelectionChange: PropTypes.func,
    onHTMLContentWithCursor: PropTypes.func,
    onCaretVerticalPositionChange: PropTypes.func,
    blockType: PropTypes.object,
    textAlign: PropTypes.string,
    ...ViewPropTypes, // include the default view properties
  }

  dispatch(command, params) {
    params = params || [];
    UIManager.dispatchViewManagerCommand(
                                          ReactNative.findNodeHandle(this),
                                          command,
                                          params,
    );
  }

  requestHTMLWithCursor() {
    this.dispatch(AztecManager.Commands.returnHTMLWithCursor)
  }

  _onContentSizeChange = (event) => {
    if (!this.props.onContentSizeChange) {
      return;
    }
    const size = event.nativeEvent.contentSize;
    const { onContentSizeChange } = this.props;
    onContentSizeChange(size);
  }

  _onEnter = (event) => {
    if (!this.props.onEnter) {
      return;
    }

    const { onEnter } = this.props;
    onEnter(event);
  }

  _onBackspace = (event) => {
    if (!this.props.onBackspace) {
      return;
    }

    const { onBackspace } = this.props;
    onBackspace(event);
  }

  _onHTMLContentWithCursor = (event) => {
    if (!this.props.onHTMLContentWithCursor) {
      return;
    }
    
    const text = event.nativeEvent.text;
    const selectionStart = event.nativeEvent.selectionStart;
    const selectionEnd = event.nativeEvent.selectionEnd;
    const { onHTMLContentWithCursor } = this.props;
    onHTMLContentWithCursor(text, selectionStart, selectionEnd);
  }

  _onFocus = (event) => {
    if (!this.props.onFocus) {
      return;
    }

    const { onFocus } = this.props;
    onFocus(event);
  }
  
  _onBlur = (event) => {
    this.selectionEndCaretY = null;
    TextInputState.blurTextInput(ReactNative.findNodeHandle(this));

    if (!this.props.onBlur) {
      return;
    }

    const { onBlur } = this.props;
    onBlur(event);
  }

  _onSelectionChange = (event) => {
    if ( this.props.onSelectionChange ) {
      const { selectionStart, selectionEnd, text } = event.nativeEvent;
      const { onSelectionChange } = this.props;
      onSelectionChange( selectionStart, selectionEnd, text, event );
    }

    if ( this.props.onCaretVerticalPositionChange && 
      this.selectionEndCaretY != event.nativeEvent.selectionEndCaretY ) {
        const caretY = event.nativeEvent.selectionEndCaretY;
        this.props.onCaretVerticalPositionChange( event.target, caretY, this.selectionEndCaretY );
        this.selectionEndCaretY = caretY;
    }
  }

  blur = () => {
    TextInputState.blurTextInput(ReactNative.findNodeHandle(this));
  }

  focus = () => {
    TextInputState.focusTextInput(ReactNative.findNodeHandle(this));
  }

  isFocused = () => {
    const focusedField = TextInputState.currentlyFocusedField();
    return focusedField && ( focusedField === ReactNative.findNodeHandle(this) );
  }

  _onPress = (event) => {
    this.focus(event); // Call to move the focus in RN way (TextInputState)
    this._onFocus(event); // Check if there are listeners set on the focus event
  }

  render() {
    const { onActiveFormatsChange, ...otherProps } = this.props    
    return (
      <TouchableWithoutFeedback onPress={ this._onPress }>
        <RCTAztecView {...otherProps}
          onContentSizeChange = { this._onContentSizeChange }
          onHTMLContentWithCursor = { this._onHTMLContentWithCursor }
          onSelectionChange = { this._onSelectionChange }
          onEnter = { this._onEnter }
          // IMPORTANT: the onFocus events are thrown away as these are handled by onPress() in the upper level.
          // It's necessary to do this otherwise onFocus may be set by `{...otherProps}` and thus the onPress + onFocus
          // combination generate an infinite loop as described in https://github.com/wordpress-mobile/gutenberg-mobile/issues/302
          onFocus = { () => {} } 
          onBlur = { this._onBlur }
          onBackspace = { this._onBackspace }
        />
      </TouchableWithoutFeedback>
    );
  }
}

const RCTAztecView = requireNativeComponent('RCTAztecView', AztecView);

export default AztecView