import React from 'react';

import PropTypes from 'prop-types';

import style from '../css/components/Select.module.css';

class Select extends React.Component {
  static propTypes = {
    placeholder: PropTypes.string,
    options: PropTypes.array.isRequired,
  };

  constructor(props) {
    super(props);

    this.state = {
      placeholder: !!props.placeholder
    };
  }

  render() {
    const {placeholder, options, initial, name, className, disabled, value, ...rest} = this.props;

    return (
      <select
        className={`${style.select} ${this.state.placeholder ? style.placeholder : ''} ${className}`}
        onChange={this.props.onChange}
        defaultValue={initial}
        name={name}
        value={value}
        disabled={disabled}
        {...rest}
      >
        {placeholder ?
          <option value={''} disabled hidden>{placeholder}</option>
        :
          null
        }
        {options.map(opt => <option key={opt.value} value={opt.value}>{opt.label}</option>)}
      </select>
    );
  }
}

export { Select };
