import React, { useMemo, useState } from 'react';

import { connect } from 'react-redux';

import { useHistory } from 'react-router-dom';

import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';

import { Label } from '../components/Label';
import { Checkbox } from '../components/Checkbox';
import { Select } from '../components/Select';
import { InputField } from '../components/InputField';

import { game } from '../gamedata';

import { slots_format, translate } from '../util';

import style from '../css/screens/Search.module.css';

function SkillRow(props) {
  const { skill, add_effect, effects } = props;

  if (Object.keys(skill.skills).length === 0)
    return null;

  return (
    <React.Fragment>
      <tr className={style.mobile}>
        <td rowSpan={6}>{translate('skill', skill.name)}</td>
        <td className={`${skill.skills['20'] ? style.cell : ''} ${effects.some(e => e.skill === skill.name && e.points === 20) ? style.selected : ''}`} onClick={() => {if (skill.skills['20']) add_effect(skill.name, 20)}}>20</td>
        <td className={`${skill.skills['20'] ? style.cell : ''} ${effects.some(e => e.skill === skill.name && e.points === 20) ? style.selected : ''}`} onClick={() => {if (skill.skills['20']) add_effect(skill.name, 20)}}>{translate('effect', skill.skills['20'] ?? '')}</td>
      </tr>
      <tr className={style.mobile}>
        <td className={`${skill.skills['15'] ? style.cell : ''} ${effects.some(e => e.skill === skill.name && e.points === 15) ? style.selected : ''}`} onClick={() => {if (skill.skills['15']) add_effect(skill.name, 15)}}>15</td>
        <td className={`${skill.skills['15'] ? style.cell : ''} ${effects.some(e => e.skill === skill.name && e.points === 15) ? style.selected : ''}`} onClick={() => {if (skill.skills['15']) add_effect(skill.name, 15)}}>{translate('effect', skill.skills['15'] ?? '')}</td>
      </tr>
      <tr className={style.mobile}>
        <td className={`${skill.skills['10'] ? style.cell : ''} ${effects.some(e => e.skill === skill.name && e.points === 10) ? style.selected : ''}`} onClick={() => {if (skill.skills['10']) add_effect(skill.name, 10)}}>10</td>
        <td className={`${skill.skills['10'] ? style.cell : ''} ${effects.some(e => e.skill === skill.name && e.points === 10) ? style.selected : ''}`} onClick={() => {if (skill.skills['10']) add_effect(skill.name, 10)}}>{translate('effect', skill.skills['10'] ?? '')}</td>
      </tr>
      <tr className={style.mobile}>
        <td className={`${skill.skills['-10'] ? style.cell : ''} ${effects.some(e => e.skill === skill.name && e.points === -10) ? style.selected : ''}`} onClick={() => {if (skill.skills['-10']) add_effect(skill.name, -10)}}>-10</td>
        <td className={`${skill.skills['-10'] ? style.cell : ''} ${effects.some(e => e.skill === skill.name && e.points === -10) ? style.selected : ''}`} onClick={() => {if (skill.skills['-10']) add_effect(skill.name, -10)}}>{translate('effect', skill.skills['-10'] ?? '')}</td>
      </tr>
      <tr className={style.mobile}>
        <td className={`${skill.skills['-15'] ? style.cell : ''} ${effects.some(e => e.skill === skill.name && e.points === -15) ? style.selected : ''}`} onClick={() => {if (skill.skills['-15']) add_effect(skill.name, -15)}}>-15</td>
        <td className={`${skill.skills['-15'] ? style.cell : ''} ${effects.some(e => e.skill === skill.name && e.points === -15) ? style.selected : ''}`} onClick={() => {if (skill.skills['-15']) add_effect(skill.name, -15)}}>{translate('effect', skill.skills['-15'] ?? '')}</td>
      </tr>
      <tr className={style.mobile}>
        <td className={`${skill.skills['-20'] ? style.cell : ''} ${effects.some(e => e.skill === skill.name && e.points === -20) ? style.selected : ''}`} onClick={() => {if (skill.skills['-20']) add_effect(skill.name, -20)}}>-20</td>
        <td className={`${skill.skills['-20'] ? style.cell : ''} ${effects.some(e => e.skill === skill.name && e.points === -20) ? style.selected : ''}`} onClick={() => {if (skill.skills['-20']) add_effect(skill.name, -20)}}>{translate('effect', skill.skills['-20'] ?? '')}</td>
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
    effects: state.game[state.game.game].search.effects
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
          <th className={`${style.head} ${style.mobile_head}`}>Points</th>
          <th className={`${style.head} ${style.mobile_head}`}>Effect</th>
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
  const skill = game().skills.find(s => s.name === effect.skill);

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
  const { search, update, update_check, remove_effect, filter, set_filter, reset, worker } = props;

  const history = useHistory();

  const [match, setMatch] = useState('');

  const vr = game().village_ranks;
  const hr = game().hunter_ranks;
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

  const categories = useMemo(() => [...game().skills.map(s => s.categories)].flat().filter((e, i, a) => i === a.indexOf(e)), []);

  const start = (props) => {
    props.clear(); // clear result state
    worker({type: 'start', payload: search});
    props.push_history(search);
    history.push('/results');
  };


/*
  const display_skills = useMemo(() => {
    skills.filter(s => !match || translate('skill', s.name).toLowerCase().includes(match) || Object.values(s.skills).some(s => translate('effect', s).toLowerCase().includes(match)))
      .filter(s => ((filter['none'] ?? true) && s.categories.length === 0) || s.categories.map(s => s.toLowerCase()).some(r => categories.map(c => c.toLowerCase()).filter(c => filter[c] === undefined || filter[c] === true).includes(r)))
  }, [filter, categories, match]);
*/
  const display_skills = game().skills.filter(s => !match || translate('skill', s.name).toLowerCase().includes(match) || Object.values(s.skills).some(s => translate('effect', s).toLowerCase().includes(match)))
      .filter(s => ((filter['none'] ?? true) && s.categories.length === 0) || s.categories.map(s => s.toLowerCase()).some(r => categories.map(c => c.toLowerCase()).filter(c => filter[c] === undefined || filter[c] === true).includes(r)));

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
            {game().has_decorations ?
              <Label text={'Weapon Slots'}>
                <Select options={'0123'.split('').map(x => { return {value: x, label: slots_format(x)}; })} name={'slots'} onChange={update} value={search.slots}/>
              </Label>
            :
              null
            }
          </fieldset>
          <fieldset className={style.section}>
            <legend>Options</legend>
            <Label text={'Allow Bad Effects'}>
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
        <div className={style.buttons}>
          <input className={style.start} type={'button'} value={'Search'} onClick={() => start(props)}/>
          <input className={style.reset} type={'button'} value={'Reset'} onClick={reset}/>
        </div>
      </div>
      <fieldset>
        <legend>Filter</legend>
        <InputField onChange={e => setMatch(e.target.value.toLowerCase())} value={match} placeholder={'Search'}/>
        {categories.map(c => <CategoryFilter key={c} category={c} onChange={set_filter} value={filter[c] ?? true}/>)}
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
    search: state.game[state.game.game].search,
    filter: state.game[state.game.game].filter
  };
}

const mapDispatchToProps = dispatch => {
  return {
    update: e => dispatch({type: e.target.name, payload: e.target.value}),
    update_check: e => dispatch({type: e.target.name, payload: e.target.checked}),
    worker: payload => dispatch({type: 'worker', payload}),
    clear: () => dispatch({type: 'clear'}),
    remove_effect: e => dispatch({type: 'remove_effect', payload: e}),
    push_history: search => dispatch({type: 'push_history', payload: search}),

    reset: e => dispatch({type: 'reset'}),
    set_filter: e => dispatch({type: 'filter', payload: {category: e.target.name, value: e.target.checked}})
  };
};

export default connect(mapStateToProps, mapDispatchToProps)(Search);
