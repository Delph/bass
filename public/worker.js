// raw data, do not modify
let skills;
let decorations;
let heads;
let chests;
let arms;
let waists;
let legs;

// build information (like valid armour pieces)
class Context
{
  constructor(query)
  {
    this.query = query;

    this.run = true;

    // timing information
    this.setup_start = 0;
    this.setup_end = 0;
    this.loop_start = 0;
    this.loop_end = 0;
  }

  /**
   * filter our gear list down to what we allow
   */
  filter_gear(list)
  {
    const items = [];
    for (const item of list)
    {
      // item hunter/village rank
      if (item.hr > this.query.hr)
        continue;
      if (item.elder > this.query.vr)
        continue;

      // gender/weapon class
      if (item.gender & this.query.gender === 0)
        continue;
      if (item.class & this.query.class === 0)
        continue;

      // other limits -- we can filter piercings like this because it's not used in any other gear
      if (!this.query.allow_piercings && item.name.includes('Piercing'))
        continue;
      if (!this.query.allow_torso && item.torso_inc)
        continue;
      if (!this.query.allow_dummy && item.name.includes('dummy'))
        continue;

      items.push(item);
    }
    return items;
  }

  /**
   *  set generator
   */
  * generate()
  {
    for (const head of heads)
    {
      for (const chest of chests)
      {
        for (const arm of arms)
        {
          for (const waist of waists)
          {
            for (const leg of legs)
            {
              yield [head, chest, arm, waist, leg];
            }
          }
        }
      }
    }
  }

  setup()
  {
    this.setup_start = new Date();

    this.heads = this.filter_gear(heads);
    this.chests = this.filter_gear(chests);
    this.arms = this.filter_gear(arms);
    this.waists = this.filter_gear(waists);
    this.legs = this.filter_gear(legs);

    this.decorations = decorations.filter(d => d.hr <= this.query.hr && d.elder <= this.query.vr, this);

    this.combinations = this.generate();

    this.setup_end = new Date();
  }

  // determine which one is better
  // assumes they're of the same skill
  decoration_better(a, b)
  {
    const a_ratio = a.skill.points / a.slots;
    const b_ratio = b.skill.points / b.slots;
    if (a_ratio > b_ratio)
      return a;
    if (a_ratio < b_ratio)
      return b;
    if (a.slots < b.slots)
      return a;
    if (a.slots > b.slots)
      return b;
    const a_p_ratio = a.skill.points / (a.penalty?.points ?? 0);
    const b_p_ratio = a.skill.points / (b.penalty?.points ?? 0);
    if (a_p_ratio < b_p_ratio)
      return a;
    if (b_p_ratio < a_p_ratio)
      return b;

    // these are apparently the same, so pick the lower one because it's cheaper
    return a;
  }

  best_decoration(decorations, slots, torso_inc, points)
  {
    let best = null;
    for (const decoration of decorations)
    {
      if (decoration.slots > slots)
        continue;
      best = decoration;
      if (decoration.points * (torso_inc + 1) >= points)
        break;
    }
    return best;
  }

  loop()
  {
    this.loop_start = new Date();

    while (this.run)
    {
      const {done, value} = this.combinations.next();
      const combination = value;

      // we're done, stop
      if (done)
      {
        this.run = false;
        break;
      }

      // calculate how much torso inc we've got
      // no need to check if we're allowed, that's already been done
      const torso_inc = combination.filter(g => g.torso_inc).length;
      let chest_slots = combination[1].slots;

      // calculate slots, don't include chest though (torso inc)
      const slots = {1: 0, 2: 0, 3: 0};
      ++slots[combination[0].slots];
      ++slots[combination[2].slots];
      ++slots[combination[3].slots];
      ++slots[combination[4].slots];
      ++slots[this.query.slots];
      const slots_available = () => {
        for (let i = 3; i > 0; --i)
        {
          if (slots[i] > 0)
            return i;
        }
        return 0;
      };

      // calculate what we got
      const skills = {};
      for (const piece of combination)
      {
        for (const skill of piece.skills)
        {
          if (skills[skill.skill] === undefined)
            skills[skill.skill] = 0;
          skills[skill.skill] += skill.points;
        }
      }

      const need = [];
      for (const effect of this.query.effects)
      {
        // skip those already met
        if (skills[effect.skill] < effect.points)
          need.push({name: effect.skill, points: effect.points - skills[effect.skill] ?? 0})
      }
      // sort so we gem the most needed first
      need.sort((a, b) => b.points - a.points);

      const build = {combination, chest_decorations: [], decorations: []};
      for (let {name, points} of need)
      {
        const decorations = this.decorations.filter(d => d.skill.skill === name).sort((a, b) => a.skill.points - b.skill.points);

        while (points > 0)
        {
          // find the best chest decoration
          const chest_decoration = this.best_decoration(decorations, {[chest_slots]: 1}, torso_inc, points);
          // find the best other decoration
          const other_decoration = this.best_decoration(decorations, slots, 0, points);
          if (other_decoration === null)
            break;

          const chest_density = chest_decoration ? (chest_decoration.skill.points * (torso_inc + 1) / chest_decoration.slots) : -1;
          const other_density = other_decoration.skill.points / other_decoration.slots;
          const is_chest = chest_density >= other_density;

          const decoration = is_chest ? chest_decoration : other_decoration;

          // we have our decoration, gem it
          if (is_chest)
          {
            build.chest_decorations.push(decoration);
            chest_slots -= decoration.slots;
          }
          else
          {
            build.decorations.push(decoration);
            --slots[decoration.slots];
          }
          points -= decoration.skill.points * (is_chest ? (torso_inc + 1) : 1);

          if (decoration.penalty !== undefined)
          {
            if (skills[decoration.penalty.skill] === undefined)
              skills[decoration.penalty.skill] = 0;
            skills[decoration.penalty.skill] += decoration.penalty.points;
          }
        }
      }

      console.log(build);

      // attempt to fix bad skills if we have them

      // send to main thread
      this.run = false;
    }
    this.loop_end = new Date();
    // send to main thread

  }

  stop()
  {
    this.run = false;
  }
}
let context = null;

onmessage = message => {
  const data = message.data;
  switch (data.action)
  {
    // data setup
    case 'skills':
      skills = data.payload;
    break;
    case 'decorations':
      decorations = data.payload;
    break;
    case 'armour':
      heads = data.payload.heads;
      chests = data.payload.chests;
      arms = data.payload.arms;
      waists = data.payload.waists;
      legs = data.payload.legs;
    break;

    // execution
    case 'start':
      context = new Context(data.payload);
      context.setup();
      context.loop();
    break;
    case 'stop':
      context?.stop();
    break;
    default:
      throw 'Received unknown message: ' + data.action;
  }
};
