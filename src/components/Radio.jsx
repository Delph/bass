import React from 'react';

import PropTypes from 'prop-types';

import style from '../css/components/Radio.module.css';


class Radio extends React.Component {
  static propTypes = {
    name: PropTypes.string.isRequired,
    value: PropTypes.any.isRequired,
    onChange: PropTypes.func,
    checked: PropTypes.bool
  };

  static defaultProps = {
    checked: false
  };

  render() {
    const {id, name, value, className, onChange, checked, ...rest} = this.props;
    return (
      <input type="radio" id={id ?? value} name={name} value={value} className={`${style.radio} ${className ?? ''}`} defaultChecked={checked} onChange={onChange} {...rest}/>
    );
  }
}

export { Radio };
