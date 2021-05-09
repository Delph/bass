import React from 'react';

import { Link } from 'react-router-dom';

import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';

import style from '../css/components/Navigation.module.css';


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
  const info = process.env.REACT_APP_VERSION;

  return (
    <div className={style.bar}>
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


export { TabBar };
