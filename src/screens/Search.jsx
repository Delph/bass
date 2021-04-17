import React, { useState, useEffect} from 'react';

import { connect } from 'react-redux';

import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';

import { Label } from '../components/Label';
import { Checkbox } from '../components/Checkbox';
import { Select } from '../components/Select';

import { heads, chests, arms, waists, legs, decorations, skills } from '../gamedata';

import style from '../css/screens/Search.module.css';

function SkillRow(props) {
  const { skill, add_effect } = props;
  return (
    <tr className={style.row}>
      <td>{skill.name}</td>
      <td className={skill.skills['-20'] ? style.cell : ''} onClick={() => add_effect(skill.name, -20)}>{skill.skills['-20'] ?? ''}</td>
      <td className={skill.skills['-10'] ? style.cell : ''} onClick={() => add_effect(skill.name, -10)}>{skill.skills['-10'] ?? ''}</td>
      <td className={skill.skills['10'] ? style.cell : ''} onClick={() => add_effect(skill.name, 10)}>{skill.skills['10'] ?? ''}</td>
      <td className={skill.skills['15'] ? style.cell : ''} onClick={() => add_effect(skill.name, 15)}>{skill.skills['15'] ?? ''}</td>
      <td className={skill.skills['20'] ? style.cell : ''} onClick={() => add_effect(skill.name, 20)}>{skill.skills['20'] ?? ''}</td>
    </tr>
  );
}
const srdispatch = dispatch => {
  return {
    add_effect: (skill, points) => dispatch({type: 'add_effect', payload: {skill, points}})
  };
};
const SkillRow_ = connect(null, srdispatch)(SkillRow);


function SkillTable() {
  return (
    <table className={style.table}>
      <thead>
        <tr>
          <th className={style.head}>Bonus</th>
          <th className={style.head}>-20</th>
          <th className={style.head}>-10</th>
          <th className={style.head}>10</th>
          <th className={style.head}>20</th>
          <th className={style.head}>30</th>
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
      <span title={`${effect.points} ${effect.skill} points`}>{skill.skills[effect.points]}</span>
      <FontAwesomeIcon icon={['fas', 'times']} onClick={remove} className={style.effectitemremove}/>
    </div>
  );
}

function Search(props) {
  const { search, update, update_check, sets, remove_effect } = props;
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
        <input type="button" value="Search" onClick={() => start(props)}/>
      </div>
      <div className={style.tableContainer}>
        <SkillTable/>
      </div>
    </div>
  );
}

function mapStateToProps(state) {
  return {
    search: state.search
  };
}

const mapDispatchToProps = dispatch => {
    return {
        update: e => dispatch({type: e.target.name, payload: e.target.value}),
        update_check: e => dispatch({type: e.target.name, payload: e.target.checked}),
        sets: message => dispatch({type: 'sets', payload: message.data.batch}),
        clear: () => dispatch({type: 'clear'}),
        remove_effect: e => dispatch({type: 'remove_effect', payload: e})
    };
};

export default connect(mapStateToProps, mapDispatchToProps)(Search);
