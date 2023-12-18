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
  const { game, seen } = props;
  const info = process.env.REACT_APP_VERSION;

  const notices = [
    {
      codename: 'v0.2.4',
      replaces: 'v0.2.3',
      title: 'Version 0.2.4',
      notice: 'Added dark mode, some styling improvements.'
    },
    {
      codename: 'v0.2.3',
      replaces: 'v0.2.2',
      title: 'Version 0.2.3',
      notice: 'Updated dependencies.'
    },
    {
      codename: 'v0.2.2',
      replaces: 'v0.2.1',
      title: 'Version 0.2.2',
      notice: 'Sets feature. Individual results can now be saved for later use in the Sets tab. Improved history management'
    },
    {
      codename: 'v0.2.1',
      replaces: 'v0.2.0',
      title: 'Version 0.2.1',
      notice: 'MHF: Removed ice, implemented Torso +1, Torso +2'
    },
    {
      codename: 'v0.2.0',
      replaces: 'v0.1.2',
      title: 'Version 0.2.0',
      notice: 'MHF support has been added. This required significant changes to how data is handled, any saved state (history) will be lost.'
    },
    {
      codename: 'v0.1.2',
      title: 'Version 0.1.2',
      notice: 'New version introduces notices and search history. Changelog which was introduced in 0.1.1 can be accessed from Settings.'
    }
  ];

  return (
    <div className={style.bar}>
      <div className={style.desktop}>
        {notices.filter(notice => !seen.includes(notice.codename) && !notices.some(n => n.replaces === notice.codename)).map(notice => <Notice key={notice.codename} notice={notice}/>)}
      </div>
      <div className={`${style.game} ${style.desktop}`}>{game.toUpperCase()}</div>
      <div className={`${style.game} ${style.mobile}`}>{game.substr(2).toUpperCase()}</div>
      <nav>
        <Tab href={'/'} label={'Search'} icon={'search'}/>
        <Tab href={'/results'} label={'Results'} icon={'file'}/>
        <Tab href={'/sets'} label={'Sets'} icon={'layer-group'}/>
        {/*<Tab href={'/builder'} label={'Builder'} icon={'hammer'}/>*/}
        <Tab href={'/history'} label={'History'} icon={'history'}/>
        <Tab href={'/settings'} label={'Settings'} icon={'cog'}/>
      </nav>

      <a
        className={`${style.donate} ${style.tab}`}
        href="https://buymeacoffee.com/bobbo"
        target="_blank"
        rel="noreferrer"
      >
        <div className={style.icon}>💰</div>
        <div className={style.label}>Donate</div>
      </a>

      <div className={style.bottom}>
        <div className={style.privacy}>
          <Link to={'/privacy'}>Privacy Policy</Link>
        </div>
        <div className={style.version}>
          <span>Version: {info}</span>
        </div>
      </div>
    </div>
  );
}


function mapStateToProps(state) {
  return {
    game: state.game.game,
    seen: state.notices
  }
};

export default connect(mapStateToProps)(TabBar);
