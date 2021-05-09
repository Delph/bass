import React from 'react';

import { connect } from 'react-redux';

import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';

import style from '../css/components/Notice.module.css';

function Notice(props) {
  const { notice, seen } = props;

  return (
    <div className={style.notice}>
      <div className={style.header}>
        <p className={style.title}>{notice.title}</p>
        <FontAwesomeIcon icon={['fas', 'times']} onClick={() => seen(notice.codename)} title={'Dismiss'} className={style.dismiss}/>
      </div>
      <p className={style.text}>{notice.notice}</p>
    </div>
  );
}

function mapDispatchToProps(dispatch) {
  return {
    seen: codename => dispatch({type: 'seen', payload: codename})
  }
}

export default connect(null, mapDispatchToProps)(Notice);
