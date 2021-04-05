import React from 'react';

import PropTypes from 'prop-types';

import style from '../css/components/Checkbox.module.css';


class Checkbox extends React.Component {
  static propTypes = {
    id: PropTypes.string,
    name: PropTypes.string.isRequired,
    value: PropTypes.any,
    onChange: PropTypes.func,
    checked: PropTypes.bool
  };

  static defaultProps = {
    value: 'on',
    checked: false
  };

  render() {
    const {id, name, value, className, onChange, checked, ...rest} = this.props;

    return (
      <input type="checkbox" id={id ?? name} name={name} value={value} className={`${style.checkbox} ${className ?? ''}`} defaultChecked={checked} onChange={onChange} {...rest}/>
    );
  }
}

export { Checkbox };
