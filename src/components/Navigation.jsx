import React from 'react';

import { connect } from 'react-redux';

import { Link } from 'react-router-dom';

import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';

import style from '../css/components/Navigation.module.css';


import Notice from '../components/Notice';

function Tab(props) {
  const { href, label, icon } = props;
  return (
    <Link to={href} className={style.tab}>
      <div className={style.container}>
        <FontAwesomeIcon icon={['fas', icon]} className={style.icon}/>
      </div>
      <div className={style.label}>{label}</div>
    </Link>
  );
}


function TabBar(props) {
  const { seen } = props;
  const info = process.env.REACT_APP_VERSION;

  const notices = [
/*
    {
      codename: 'v0.1.3',
      replaces: 'v0.1.2',
      title: 'Version 0.1.3',
      notice: 'Foo'
    },
*/
    {
      codename: 'v0.1.2',
      title: 'Version 0.1.2',
      notice: 'New version introduces notices and search history. Changelog which was introduced in 0.1.1 can be accessed from Settings.'
    }
  ];

  return (
    <div className={style.bar}>
      <div className={style.notices}>
        {notices.filter(notice => !seen.includes(notice.codename) && !notices.some(n => n.replaces === notice.codename)).map(notice => <Notice key={notice.codename} notice={notice}/>)}
      </div>
      <nav>
        <Tab href={'/'} label={'Search'} icon={'search'}/>
        <Tab href={'/results'} label={'Results'} icon={'file'}/>
        {/*<Tab href={'/sets'} label={'Sets'} icon={'folder'}/>*/}
        {/*<Tab href={'/builder'} label={'Builder'} icon={'hammer'}/>*/}
        <Tab href={'/history'} label={'History'} icon={'history'}/>
        <Tab href={'/settings'} label={'Settings'} icon={'cog'}/>
      </nav>
      {/*
      <div>
        <h1>Donate</h1>
      </div>
      */}
      <div className={style.version}>
        <span>Version: {info}</span>
      </div>
    </div>
  );
}


function mapStateToProps(state) {
  return {
    seen: state.notices
  }
};

export default connect(mapStateToProps)(TabBar);
