import React, { useState, useEffect} from 'react';

import { connect } from 'react-redux';

import { Checkbox } from '../components/Checkbox';
import { Select } from '../components/Select';

import { heads, chests, arms, waists, legs, decorations, skills } from '../gamedata';

import style from '../css/screens/Search.module.css';

function SkillRow(props) {
  const { skill, add_effect } = props;
  return (
    <tr className={style.row}>
      <td>{skill.name}</td>
      <td onClick={() => add_effect(skill.name, -20)}>{skill.skills['-20'] ?? ''}</td>
      <td onClick={() => add_effect(skill.name, -10)}>{skill.skills['-10'] ?? ''}</td>
      <td onClick={() => add_effect(skill.name, 10)}>{skill.skills['10'] ?? ''}</td>
      <td onClick={() => add_effect(skill.name, 15)}>{skill.skills['15'] ?? ''}</td>
      <td onClick={() => add_effect(skill.name, 20)}>{skill.skills['20'] ?? ''}</td>
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
    <table style={{position: 'relative'}}>
      <thead>
        <tr>
          <th style={{position: 'sticky', top: 0, backgroundColor: 'white'}}>Bonus</th>
          <th style={{position: 'sticky', top: 0, backgroundColor: 'white'}}>-20</th>
          <th style={{position: 'sticky', top: 0, backgroundColor: 'white'}}>-10</th>
          <th style={{position: 'sticky', top: 0, backgroundColor: 'white'}}>10</th>
          <th style={{position: 'sticky', top: 0, backgroundColor: 'white'}}>20</th>
          <th style={{position: 'sticky', top: 0, backgroundColor: 'white'}}>30</th>
        </tr>
      </thead>
      <tbody style={{overflow: 'auto'}}>
        {skills.map((skill, i) => <SkillRow_ skill={skill} key={i}/>)}
      </tbody>
    </table>
  );
}

function EffectItem({effect}) {
  const skill = skills.find(s => s.name === effect.skill);

  return <li key={skill.skills[effect.points]}>{skill.skills[effect.points]}</li>;
}

function Search(props) {
  const { search, update, update_check, set } = props;
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
    worker.onmessage = set;
    worker.postMessage({action: 'skills', payload: skills});
    worker.postMessage({action: 'decorations', payload: decorations});
    worker.postMessage({action: 'armour', payload: {heads, chests, arms, waists, legs}});
    setWorker(worker);
  },
  []);

  const start = () => {
    worker.postMessage({action: 'start', payload: search});
  };

  return (
    <div className={style.container}>
      <div>
        <div>
          <Select options={vr} name={'vr'} onChange={update} value={search.vr}/>
          <Select options={hr} name={'hr'} onChange={update} value={search.hr}/>
          <Select options={genders} name={'gender'} onChange={update} value={search.gender}/>
        </div>
        <div>
          <Select options={classes} name={'class'} onChange={update} value={search.class}/>
          <Select options={'0123'.split('').map(x => { return {value: x, label: x}; })} name={'slots'} onChange={update} value={search.slots}/>
        </div>
        <div>
          <Checkbox name={'allow_bad'} onChange={update_check} checked={search.allow_bad}/>
          <Checkbox name={'allow_piercings'} onChange={update_check} checked={search.allow_piercings}/>
          <Checkbox name={'allow_torsoinc'} onChange={update_check} checked={search.allow_torsoinc}/>
          <Checkbox name={'allow_dummy'} onChange={update_check} checked={search.allow_dummy}/>
        </div>
        <SkillTable/>
      </div>
      <div style={{position: 'relative'}}>
        <ul style={{position: 'sticky', top: 0}}>
          {search.effects.map(e => <EffectItem effect={e}/>)}
        </ul>
        <input type="button" value="Search" onClick={start}/>
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
        set: message => dispatch({type: 'set', payload: message.data.build})
    };
};

export default connect(mapStateToProps, mapDispatchToProps)(Search);
