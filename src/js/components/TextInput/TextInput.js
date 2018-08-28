import React, { Component } from 'react';
import { compose } from 'recompose';
import styled from 'styled-components';

import { Box } from '../Box';
import { Button } from '../Button';
import { Drop } from '../Drop';
import { InfiniteScroll } from '../InfiniteScroll';
import { Keyboard } from '../Keyboard';
import {
  withAnnounce,
  withForwardRef,
  withTheme,
} from '../hocs';

import {
  StyledTextInput,
  StyledTextInputContainer,
  StyledPlaceholder,
  StyledSuggestions,
} from './StyledTextInput';
import { doc } from './doc';

function renderLabel(suggestion) {
  if (suggestion && typeof suggestion === 'object') {
    return suggestion.label || suggestion.value;
  }
  return suggestion;
}

function stringLabel(suggestion) {
  if (suggestion && typeof suggestion === 'object') {
    if (suggestion.label && typeof suggestion.label === 'string') {
      return suggestion.label;
    }
    return suggestion.value;
  }
  return suggestion;
}

const ContainerBox = styled(Box)`
  max-height: inherit;

  /* IE11 hack to get drop contents to not overflow */
  @media screen and (-ms-high-contrast: active), (-ms-high-contrast: none) {
    width: 100%;
  }
`;

class TextInput extends Component {
  static defaultProps = {
    dropAlign: { top: 'bottom', left: 'left' },
    messages: {
      enterSelect: '(Press Enter to Select)',
      suggestionsCount: 'suggestions available',
      suggestionsExist: 'This input has suggestions use arrow keys to navigate',
      suggestionIsOpen: 'Suggestions drop is open, continue to use arrow keys to navigate',
    },
  }

  static getDerivedStateFromProps(nextProps, prevState) {
    const { forwardRef } = nextProps;
    const { inputRef } = prevState;
    const nextInputRef = forwardRef || inputRef;
    if (nextInputRef !== inputRef) {
      return { inputRef: nextInputRef };
    }
    return null;
  }

  state = {
    activeSuggestionIndex: -1,
    inputRef: React.createRef(),
    showDrop: false,
  }

  componentWillUnmount() {
    clearTimeout(this.resetTimer);
  }

  announce = (message, mode) => {
    const { announce, suggestions } = this.props;
    if (suggestions && suggestions.length > 0) {
      announce(message, mode);
    }
  }

  announceSuggestionsCount = () => {
    const { suggestions, messages: { suggestionsCount } } = this.props;
    this.announce(`${suggestions.length} ${suggestionsCount}`);
  }

  announceSuggestionsExist = () => {
    const { messages: { suggestionsExist } } = this.props;
    this.announce(suggestionsExist);
  }

  announceSuggestionsIsOpen = () => {
    const { messages: { suggestionIsOpen } } = this.props;
    this.announce(suggestionIsOpen);
  }

  announceSuggestion(index) {
    const { suggestions, messages: { enterSelect } } = this.props;
    if (suggestions && suggestions.length > 0) {
      const labelMessage = stringLabel(suggestions[index]);
      this.announce(`${labelMessage} ${enterSelect}`);
    }
  }

  resetSuggestions = () => {
    // delay this to avoid re-render interupting event delivery
    // https://github.com/grommet/grommet/issues/2154
    // 10ms was chosen empirically based on ie11 using TextInput
    // with and without a FormField.
    clearTimeout(this.resetTimer);
    this.resetTimer = setTimeout(() => {
      const { suggestions } = this.props;
      if (suggestions && suggestions.length) {
        this.setState({
          activeSuggestionIndex: -1,
          showDrop: true,
          selectedSuggestionIndex: -1,
        }, this.announceSuggestionsCount);
      }
    }, 10);
  }

  getSelectedSuggestionIndex = () => {
    const { suggestions, value } = this.props;
    const suggestionValues = suggestions.map((suggestion) => {
      if (typeof suggestion === 'object') {
        return suggestion.value;
      }
      return suggestion;
    });
    return suggestionValues.indexOf(value);
  }

  onShowSuggestions = () => {
    // Get values of suggestions, so we can highlight selected suggestion
    const selectedSuggestionIndex = this.getSelectedSuggestionIndex();

    this.setState({
      showDrop: true,
      activeSuggestionIndex: -1,
      selectedSuggestionIndex,
    }, this.announceSuggestionsIsOpen);
  }

  onNextSuggestion = (event) => {
    const { suggestions } = this.props;
    const { activeSuggestionIndex, showDrop } = this.state;
    if (suggestions && suggestions.length > 0) {
      if (!showDrop) {
        this.onShowSuggestions();
      } else {
        event.preventDefault();
        const index = Math.min(activeSuggestionIndex + 1, suggestions.length - 1);
        this.setState({ activeSuggestionIndex: index }, () => this.announceSuggestion(index));
      }
    }
  }

  onPreviousSuggestion = (event) => {
    const { suggestions } = this.props;
    const { activeSuggestionIndex, showDrop } = this.state;
    if (suggestions && suggestions.length > 0 && showDrop) {
      event.preventDefault();
      const index = Math.max(activeSuggestionIndex - 1, 0);
      this.setState({ activeSuggestionIndex: index }, () => this.announceSuggestion(index));
    }
  }

  onClickSuggestion = (suggestion) => {
    const { onSelect } = this.props;
    const { inputRef } = this.state;
    this.setState({ showDrop: false });
    if (onSelect) {
      onSelect({ target: inputRef.current, suggestion });
    }
  }

  onSuggestionSelect = (event) => {
    const { onSelect, suggestions } = this.props;
    const { activeSuggestionIndex, inputRef } = this.state;
    this.setState({ showDrop: false });
    if (activeSuggestionIndex >= 0) {
      event.preventDefault(); // prevent submitting forms
      const suggestion = suggestions[activeSuggestionIndex];
      if (onSelect) {
        onSelect({ target: inputRef.current, suggestion });
      }
    }
  }

  onFocus = (event) => {
    const { onFocus, suggestions } = this.props;
    if (suggestions && suggestions.length > 0) {
      this.announceSuggestionsExist();
    }
    this.resetSuggestions();
    if (onFocus) {
      onFocus(event);
    }
  }

  onBlur = (event) => {
    const { onBlur } = this.props;
    clearTimeout(this.resetTimer);
    if (onBlur) {
      onBlur(event);
    }
  }

  onInput = (event) => {
    const { onInput } = this.props;
    this.resetSuggestions();
    if (onInput) {
      onInput(event);
    }
  }

  onDropClose = () => {
    this.setState({ showDrop: false });
  }

  renderSuggestions = () => {
    const { suggestions, theme } = this.props;
    const { activeSuggestionIndex, selectedSuggestionIndex } = this.state;

    return (
      <StyledSuggestions theme={theme}>
        <InfiniteScroll items={suggestions} step={theme.select.step}>
          {(suggestion, index) => (
            <li key={`${stringLabel(suggestion)}-${index}`}>
              <Button
                active={
                  activeSuggestionIndex === index ||
                  selectedSuggestionIndex === index
                }
                fill={true}
                hoverIndicator='background'
                onClick={() => this.onClickSuggestion(suggestion)}
                plain={true}
              >
                <Box align='start' pad='small'>
                  {renderLabel(suggestion)}
                </Box>
              </Button>
            </li>
          )}
        </InfiniteScroll>
      </StyledSuggestions>
    );
  }

  render() {
    const {
      defaultValue, dropAlign, dropTarget, id, placeholder, plain, theme, value,
      onKeyDown,
      ...rest
    } = this.props;
    delete rest.onInput; // se we can manage in onInputChange()
    delete rest.forwardRef;
    const { inputRef, showDrop } = this.state;
    // needed so that styled components does not invoke
    // onSelect when text input is clicked
    delete rest.onSelect;
    let drop;
    if (showDrop) {
      drop = (
        <Drop
          id={id ? `text-input-drop__${id}` : undefined}
          align={dropAlign}
          responsive={false}
          target={dropTarget || inputRef.current}
          onClickOutside={() => this.setState({ showDrop: false })}
          onEsc={() => this.setState({ showDrop: false })}
        >
          <ContainerBox overflow='auto'>
            {this.renderSuggestions()}
          </ContainerBox>
        </Drop>
      );
    }
    return (
      <StyledTextInputContainer plain={plain}>
        {placeholder && typeof placeholder !== 'string' && !value ? (
          <StyledPlaceholder theme={theme}>{placeholder}</StyledPlaceholder>
        ) : null}
        <Keyboard
          onEnter={this.onSuggestionSelect}
          onEsc={this.onDropClose}
          onTab={this.onDropClose}
          onUp={this.onPreviousSuggestion}
          onDown={this.onNextSuggestion}
          onKeyDown={onKeyDown}
        >
          <StyledTextInput
            id={id}
            innerRef={inputRef}
            autoComplete='off'
            plain={plain}
            placeholder={typeof placeholder === 'string' ? placeholder : undefined}
            theme={theme}
            {...rest}
            defaultValue={renderLabel(defaultValue)}
            value={renderLabel(value)}
            onFocus={this.onFocus}
            onBlur={this.onBlur}
            onInput={this.onInput}
          />
        </Keyboard>
        {drop}
      </StyledTextInputContainer>
    );
  }
}

const TextInputWrapper = compose(
  withTheme,
  withAnnounce,
  withForwardRef,
)(
  process.env.NODE_ENV !== 'production' ? doc(TextInput) : TextInput
);

export { TextInputWrapper as TextInput };
