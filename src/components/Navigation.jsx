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
  return (
    <nav className={style.bar}>
      <Tab href={'/'} label={'Search'} icon={'search'}/>
      <Tab href={'/results'} label={'Results'} icon={'file'}/>
      <Tab href={'/sets'} label={'Sets'} icon={'folder'}/>
      <Tab href={'/history'} label={'History'} icon={'history'}/>
      <Tab href={'/settings'} label={'Settings'} icon={'cog'}/>
    </nav>
  );
}


export { TabBar };
