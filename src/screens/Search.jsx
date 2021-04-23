import React, { useState, useEffect, useMemo } from 'react';

import { connect } from 'react-redux';

import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';

import { Label } from '../components/Label';
import { Checkbox } from '../components/Checkbox';
import { Select } from '../components/Select';

import { heads, chests, arms, waists, legs, decorations, skills } from '../gamedata';

import { translate } from '../util';

import style from '../css/screens/Search.module.css';

function SkillRow(props) {
  const { skill, add_effect, effects } = props;

  return (
    <React.Fragment>
      <tr className={style.mobile}>
        <td rowspan={6}>{translate('skill', skill.name)}</td>
        <td className={`${skill.skills['20'] ? style.cell : ''} ${effects.some(e => e.skill === skill.name && e.points === 20) ? style.selected : ''}`} onClick={() => {if (skill.skills['20']) add_effect(skill.name, -20)}}>20</td>
        <td className={`${skill.skills['20'] ? style.cell : ''} ${effects.some(e => e.skill === skill.name && e.points === 20) ? style.selected : ''}`} onClick={() => {if (skill.skills['20']) add_effect(skill.name, -20)}}>{translate('effect', skill.skills['20'] ?? '')}</td>
      </tr>
      <tr className={style.mobile}>
        <td className={`${skill.skills['15'] ? style.cell : ''} ${effects.some(e => e.skill === skill.name && e.points === 15) ? style.selected : ''}`} onClick={() => {if (skill.skills['15']) add_effect(skill.name, -15)}}>15</td>
        <td className={`${skill.skills['15'] ? style.cell : ''} ${effects.some(e => e.skill === skill.name && e.points === 15) ? style.selected : ''}`} onClick={() => {if (skill.skills['15']) add_effect(skill.name, -15)}}>{translate('effect', skill.skills['15'] ?? '')}</td>
      </tr>
      <tr className={style.mobile}>
        <td className={`${skill.skills['10'] ? style.cell : ''} ${effects.some(e => e.skill === skill.name && e.points === 10) ? style.selected : ''}`} onClick={() => {if (skill.skills['10']) add_effect(skill.name, -10)}}>10</td>
        <td className={`${skill.skills['10'] ? style.cell : ''} ${effects.some(e => e.skill === skill.name && e.points === 10) ? style.selected : ''}`} onClick={() => {if (skill.skills['10']) add_effect(skill.name, -10)}}>{translate('effect', skill.skills['10'] ?? '')}</td>
      </tr>
      <tr className={style.mobile}>
        <td className={`${skill.skills['-10'] ? style.cell : ''} ${effects.some(e => e.skill === skill.name && e.points === -10) ? style.selected : ''}`} onClick={() => {if (skill.skills['-10']) add_effect(skill.name, 10)}}>-10</td>
        <td className={`${skill.skills['-10'] ? style.cell : ''} ${effects.some(e => e.skill === skill.name && e.points === -10) ? style.selected : ''}`} onClick={() => {if (skill.skills['-10']) add_effect(skill.name, 10)}}>{translate('effect', skill.skills['-10'] ?? '')}</td>
      </tr>
      <tr className={style.mobile}>
        <td className={`${skill.skills['-15'] ? style.cell : ''} ${effects.some(e => e.skill === skill.name && e.points === -15) ? style.selected : ''}`} onClick={() => {if (skill.skills['-15']) add_effect(skill.name, 15)}}>-15</td>
        <td className={`${skill.skills['-15'] ? style.cell : ''} ${effects.some(e => e.skill === skill.name && e.points === -15) ? style.selected : ''}`} onClick={() => {if (skill.skills['-15']) add_effect(skill.name, 15)}}>{translate('effect', skill.skills['-15'] ?? '')}</td>
      </tr>
      <tr className={style.mobile}>
        <td className={`${skill.skills['-20'] ? style.cell : ''} ${effects.some(e => e.skill === skill.name && e.points === -20) ? style.selected : ''}`} onClick={() => {if (skill.skills['-20']) add_effect(skill.name, 20)}}>-20</td>
        <td className={`${skill.skills['-20'] ? style.cell : ''} ${effects.some(e => e.skill === skill.name && e.points === -20) ? style.selected : ''}`} onClick={() => {if (skill.skills['-20']) add_effect(skill.name, 20)}}>{translate('effect', skill.skills['-20'] ?? '')}</td>
      </tr>

      <tr className={`${style.row} ${style.desktop}`}>
        <td >{translate('skill', skill.name)}</td>
        <td className={`${skill.skills['-20'] ? style.cell : ''} ${effects.some(e => e.skill === skill.name && e.points === -20) ? style.selected : ''}`} onClick={() => { if (skill.skills['-20']) add_effect(skill.name, -20)} }>{translate('effect', skill.skills['-20'] ?? '')}</td>
        <td className={`${skill.skills['-15'] ? style.cell : ''} ${effects.some(e => e.skill === skill.name && e.points === -15) ? style.selected : ''}`} onClick={() => { if (skill.skills['-15']) add_effect(skill.name, -15)} }>{translate('effect', skill.skills['-15'] ?? '')}</td>
        <td className={`${skill.skills['-10'] ? style.cell : ''} ${effects.some(e => e.skill === skill.name && e.points === -10) ? style.selected : ''}`} onClick={() => { if (skill.skills['-10']) add_effect(skill.name, -10)} }>{translate('effect', skill.skills['-10'] ?? '')}</td>
        <td className={`${skill.skills['10'] ? style.cell : ''} ${effects.some(e => e.skill === skill.name && e.points === 10) ? style.selected : ''}`} onClick={() => { if (skill.skills['10']) add_effect(skill.name, 10)} }>{translate('effect', skill.skills['10'] ?? '')}</td>
        <td className={`${skill.skills['15'] ? style.cell : ''} ${effects.some(e => e.skill === skill.name && e.points === 15) ? style.selected : ''}`} onClick={() => { if (skill.skills['15']) add_effect(skill.name, 15)} }>{translate('effect', skill.skills['15'] ?? '')}</td>
        <td className={`${skill.skills['20'] ? style.cell : ''} ${effects.some(e => e.skill === skill.name && e.points === 20) ? style.selected : ''}`} onClick={() => { if (skill.skills['20']) add_effect(skill.name, 20)} }>{translate('effect', skill.skills['20'] ?? '')}</td>
      </tr>
    </React.Fragment>
  );
}
const srstate = state => {
  return {
    effects: state.search.effects
  };
}
const srdispatch = dispatch => {
  return {
    add_effect: (skill, points) => dispatch({type: 'add_effect', payload: {skill, points}})
  };
};
const SkillRow_ = connect(srstate, srdispatch)(SkillRow);


function SkillTable({skills}) {
  return (
    <table className={style.table}>
      <thead>
        <tr>
          <th className={style.head}>Skill</th>
          <th className={`${style.head} ${style.mobile}`}>Points</th>
          <th className={`${style.head} ${style.mobile}`}>Effect</th>
          <th className={`${style.head} ${style.desktop}`}>-20</th>
          <th className={`${style.head} ${style.desktop}`}>-15</th>
          <th className={`${style.head} ${style.desktop}`}>-10</th>
          <th className={`${style.head} ${style.desktop}`}>10</th>
          <th className={`${style.head} ${style.desktop}`}>15</th>
          <th className={`${style.head} ${style.desktop}`}>20</th>
        </tr>
      </thead>
      <tbody className={style.body}>
        {skills.map((skill, i) => <SkillRow_ skill={skill} key={i}/>)}
      </tbody>
    </table>
  );
}

function EffectItem({effect, remove}) {
  const skill = skills.find(s => s.name === effect.skill);

  return (
    <div className={style.effectitem}>
      <span title={`${effect.points} ${effect.skill} points`}>{translate('effect', skill.skills[effect.points])}</span>
      <FontAwesomeIcon icon={['fas', 'times']} onClick={remove} className={style.effectitemremove}/>
    </div>
  );
}

function CategoryFilter({category, onChange, value}) {
  return (
    <Label text={category}>
      <Checkbox name={category.toLowerCase()} onChange={onChange} checked={value}/>
    </Label>
  );
}


function Search(props) {
  const { search, update, update_check, sets, remove_effect, filter, set_filter } = props;
  const vr = [
    {value: 9, label: '9★ (Nekoht)'},
    {value: 8, label: '8★ (Nekoht)'},
    {value: 7, label: '7★ (Nekoht)'},
    {value: 6, label: '6★'},
    {value: 5, label: '5★'},
    {value: 4, label: '4★'},
    {value: 3, label: '3★'},
    {value: 2, label: '2★'},
    {value: 1, label: '1★'}
  ];

  const hr = [
    {value: 9, label: 'HR9 (GR)'},
    {value: 8, label: 'HR8 (GR)'},
    {value: 7, label: 'HR7 (GR)'},
    {value: 6, label: 'HR6 (HR)'},
    {value: 5, label: 'HR5 (HR)'},
    {value: 4, label: 'HR4 (HR)'},
    {value: 3, label: 'HR3 (LR)'},
    {value: 2, label: 'HR2 (LR)'},
    {value: 1, label: 'HR1 (LR)'}
  ];
  const genders = [
    {
      value: 1,
      label: 'Male'
    },
    {
      value: 2,
      label: 'Female'
    }
  ];
  const classes = [
    {
      value: 1,
      label: 'Blademaster'
    },
    {
      value: 2,
      label: 'Gunner'
    }
  ];

  const categories = useMemo(() => [...skills.map(s => s.categories)].flat().filter((e, i, a) => i === a.indexOf(e)), []);

  const [worker, setWorker] = useState(null);
  useEffect(() => {
    const worker = new Worker('./worker.js');
    worker.onmessage = sets;
    worker.postMessage({action: 'skills', payload: skills});
    worker.postMessage({action: 'decorations', payload: decorations});
    worker.postMessage({action: 'armour', payload: {heads, chests, arms, waists, legs}});
    setWorker(worker);
  },
  [sets]);

  const start = (props) => {
    props.clear();
    worker.postMessage({action: 'start', payload: search});
    props.history.push('/results');
  };


  const display_skills = useMemo(() => skills.filter(s => ((filter['none'] ?? true) && s.categories.length === 0) || s.categories.map(s => s.toLowerCase()).some(r => Object.keys(filter).filter(c => filter[c]).includes(r))), [filter]);

  return (
    <div className={style.container}>
      <div className={style.top}>
        <div className={style.settings}>
          <fieldset className={style.section}>
            <legend>Hunter</legend>
            <Label text={'Village Quests'}>
              <Select options={vr} name={'vr'} onChange={update} value={search.vr}/>
            </Label>
            <Label text={'Hunter Rank'}>
              <Select options={hr} name={'hr'} onChange={update} value={search.hr}/>
            </Label>
            <Label text={'Gender'}>
              <Select options={genders} name={'gender'} onChange={update} value={search.gender}/>
            </Label>
          </fieldset>
          <fieldset className={style.section}>
            <legend>Weapon</legend>
            <Label text={'Weapon Class'}>
              <Select options={classes} name={'class'} onChange={update} value={search.class}/>
            </Label>
            <Label text={'Weapon Slots'}>
              <Select options={'0123'.split('').map(x => { return {value: x, label: x}; })} name={'slots'} onChange={update} value={search.slots}/>
            </Label>
          </fieldset>
          <fieldset className={style.section}>
            <legend>Options</legend>
            <Label text={'Allow Bad'}>
              <Checkbox name={'allow_bad'} onChange={update_check} checked={search.allow_bad}/>
            </Label>
            <Label text={'Allow Piercings'}>
              <Checkbox name={'allow_piercings'} onChange={update_check} checked={search.allow_piercings}/>
            </Label>
            <Label text={'Allow Torso Inc'}>
              <Checkbox name={'allow_torsoinc'} onChange={update_check} checked={search.allow_torsoinc}/>
            </Label>
            <Label text={'Allow Dummy'}>
              <Checkbox name={'allow_dummy'} onChange={update_check} checked={search.allow_dummy}/>
            </Label>
          </fieldset>
        </div>
        <fieldset className={style.effectitems}>
          <legend>Effects</legend>
          {search.effects.map((e, i) => <EffectItem key={i} effect={e} remove={() => remove_effect(e.skill)}/>)}
        </fieldset>
        <input className={style.button} type="button" value="Search" onClick={() => start(props)}/>
      </div>
      <fieldset>
        <legend>Filter</legend>
        {categories.map(c => <CategoryFilter category={c} onChange={set_filter} value={filter[c] ?? true}/>)}
        <CategoryFilter category={'None'} onChange={set_filter} value={filter['none'] ?? true}/>
      </fieldset>
      <div className={style.tableContainer}>
        <SkillTable skills={display_skills}/>
      </div>
    </div>
  );
}

function mapStateToProps(state) {
  return {
    search: state.search,
    filter: state.filter
  };
}

const mapDispatchToProps = dispatch => {
    return {
        update: e => dispatch({type: e.target.name, payload: e.target.value}),
        update_check: e => dispatch({type: e.target.name, payload: e.target.checked}),
        sets: message => dispatch({type: 'sets', payload: message.data.batch}),
        clear: () => dispatch({type: 'clear'}),
        remove_effect: e => dispatch({type: 'remove_effect', payload: e}),

        set_filter: e => dispatch({type: 'filter', payload: {category: e.target.name, value: e.target.checked}})
    };
};

export default connect(mapStateToProps, mapDispatchToProps)(Search);
