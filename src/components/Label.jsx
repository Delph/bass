import React from 'react';

import style from '../css/components/Label.module.css';

function Label(props) {
  const { children, text } = props;

  return (
    <label className={style.label}>
      {text}: {children}
    </label>
  );
}

export { Label };
