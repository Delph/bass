import React from 'react';

import PropTypes from 'prop-types';

import style from '../css/components/InputField.module.css';


class InputField extends React.Component {
  static propTypes = {
    type: PropTypes.string,
    name: PropTypes.string,
    value: PropTypes.string.isRequired,
    placeholder: PropTypes.string,
    id: PropTypes.string
  };

  static defaultProps = {
    type: 'text',
    name: '',
    placeholder: '',
  };

  render() {
    const { id, type, name, placeholder, className, value, ...rest } = this.props;

    return (
      <input spellCheck={true} id={id ?? name} type={type} name={name} className={`${style.input} ${className}`} placeholder={placeholder} value={value ?? ''} {...rest}/>
    );
  }
}

export { InputField };
