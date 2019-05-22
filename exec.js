// constants
const ACTIONS = ['top', 'right', 'down', 'left'];
const ACTION_SIZE = 4;
const STATE_SIZE = 5 * 5;
const TABLE_ROW_SIZE = 5;
const TABLE_COL_SIZE = 5;
const DEFAULT_REWARD = -1;
const REWARD_INDEX = 23;

class Enviroment {
  constructor() {
    this.qtable = this._createQtable(ACTION_SIZE, STATE_SIZE);
    this.init();
  }

  init() {
    let undone = true;
    const hash = {};


    while(undone) {
      const random = Math.floor((Math.random() * 25) + 1);

      if (random === 1) continue;
      if (random === 24) continue;
      if (hash[random]) continue

      hash[random] = document.getElementById(`state_${random}`);
      if (Object.keys(hash).length === 7) undone = false;
    }

    //set class on el
    const keys = Object.keys(hash);
    keys.forEach(key => {
      const el = hash[key];
      el.classList.add('alligator');
    })

    console.log('hash');
    console.log(hash);
    this.rewardtable = this._createRewardTable(TABLE_ROW_SIZE, TABLE_COL_SIZE, DEFAULT_REWARD, hash);
  }

  getBestAction(state)  {
    let max = -1;
    let bestAction = this.getRandomAction(state);
    const actionsRow = this.qtable[state];
    const actions = Object.keys(actionsRow);

    actions.forEach((action) => {
      const actionReward = actionsRow[action];

      if (actionReward > max) {
        max = actionReward;
        bestAction = action;
      }
    });

    return bestAction;
  }

  getRandomAction(state) {
    const action = Math.floor((Math.random() * 3) + 0)
    if (this._isActionForbidden(state, action) !== undefined) return this.getRandomAction(state);

    return action;
  }

  act(currentState, action) {
    const newState = this._getNextState(currentState, action);
    const reward = this._getReward(newState);
    const done = (currentState === REWARD_INDEX ? true : false);

    return { newState, reward, done };
  }

  getPosition(state) {
    const row = Math.floor(state / 5);
    let col;

    if (state < 5) col = state;
    else if (state <= 9) col = state - 5;
    else if (state <= 14) col = state - 10;
    else if (state <= 19) col = state - 15;
    else if (state <= 24) col = state - 20;

    return { col, row };
  }

  updateQtable({
    currentState,
    newState,
    reward,
    gamma,
    learningRate,
    action,
  }) {
    this.qtable[currentState][action] = this.qtable[currentState][action]
                                        + learningRate
                                        * (reward + gamma * this._getBestActionReward(newState) - this.qtable[currentState][action]);
  }


  _createQtable(actionSize, stateSize) {
    const qtable = {};

    for (let i = 0; i < stateSize; i++) {
      for (let j = 0; j < actionSize; j++) {
        if (!qtable[i]) qtable[i] = {};
        qtable[i][j] = 0;
      }
    }

    console.log('created qtable: ', Object.assign({}, qtable));
    return qtable;
  }

  _createRewardTable(rowSize, colSize, defaultReward, hash) {
    const rewardtable = {};
    let counter = 0;

    for (let i = 0; i < rowSize; i++) {
      for (let j = 0; j < colSize; j++) {
        counter += 1;

        if (!rewardtable[i]) rewardtable[i] = {};
        if (i === 4 && j === 3) rewardtable[i][j] = 100;
        else if (hash[counter]) rewardtable[i][j] = -100;
        else rewardtable[i][j] = defaultReward;
      }
    }

    console.log('created rewardtable: ', rewardtable);
    return rewardtable;
  }

  _getBestActionReward(newState) {
    let max = 0;
    const actions = this.qtable[newState];
    const keys = Object.keys(actions);

    keys.forEach((key) => {
      const actionReward = actions[key];
      if (actionReward > max) max = actionReward;
    });

    return max;
  }

  _getNextState(currentState, action) {
    let nextState;

    if (this._isActionForbidden(currentState, action) !== undefined) return currentState;

    if (Number(action) === 0) nextState = currentState - 5;
    if (Number(action) === 1) nextState = currentState + 1;
    if (Number(action) === 2) nextState = currentState + 5;
    if (Number(action) === 3) nextState = currentState -1;

    return nextState;
  }

  _getReward(newState) {
    const { col, row } = this.getPosition(newState);
    return this.rewardtable[row][col];
  }

  _isActionForbidden(state, action) {
    if (state === 0) return [0, 3].find(a => Number(a) === Number(action));
    if (state === 1) return [0].find(a => Number(a) === Number(action));
    if (state === 2) return [0].find(a => Number(a) === Number(action));
    if (state === 3) return [0].find(a => Number(a) === Number(action));
    if (state === 4) return [0, 1].find(a => Number(a) === Number(action));
    if (state === 9) return [1].find(a => Number(a) === Number(action));
    if (state === 14) return [1].find(a => Number(a) === Number(action));
    if (state === 19) return [1].find(a => Number(a) === Number(action));
    if (state === 20) return [2, 3].find(a => Number(a) === Number(action));
    if (state === 21) return [2].find(a => Number(a) === Number(action));
    if (state === 22) return [2].find(a => Number(a) === Number(action));
    if (state === 23) return [2].find(a => Number(a) === Number(action));
    if (state === 24) return [1, 2].find(a => Number(a) === Number(action));
    if (state % 5 === 0) return [3].find(a => Number(a) === Number(action));
  }
}

class Game {
  constructor() {
    this.env = new Enviroment();
    this.initHyperParameters();
  }

  train() {
    let episode = 0;
    const _states = []
    const states = {};

    for (; episode < this.totalTrainEpisodes; episode++) {
      const step = 0;
      const done = false;
      let state = 0;

      for (let j = 0; j < this.maxSteps; j++) {
        const exploration = this._getRandomNumber();
        let action;
        _states.push(state);

        if (!states[episode]) states[episode] = [];
        states[episode].push(state);

        if (exploration > this.epsilon) action = this.env.getBestAction(state);
        else action = this.env.getRandomAction(state);

        const { newState, reward, done } = this.env.act(state, action);
        this.env.updateQtable({
          currentState: state,
          gamma: this.gamma,
          learningRate: this.learningRate,
          newState,
          reward,
          action,
        });

        state = newState
      }

      this.epsilon = this.minEpsilon + (this.maxEpsilon - this.minEpsilon) * Math.exp(-this.decayRate * episode);
    }

    console.log('trained qtable: ', this.env.qtable);
    // this._play(_states);
  }

  test() {
    let episode = 0;
    const rewards = [];
    const states = []

    for (; episode < this.totalTestEpisodes; episode++) {
      let state = 0;
      let totalRewards = 0;
      const step = 0;
      const done = false;

      for (let j = 0; j < this.maxSteps; j++) {
        states.push(state);
        const action = this.getBestActionT(this.env, state);
        const { newState, reward, done } = this.env.act(state, action);

        totalRewards += reward;
        state = newState;

        if (done) {
          rewards.push(totalRewards)
          this._play(states);

          break
        }
      }
    }

    console.log('Score over time: ' +  rewards);
  }

  getBestActionT(env, state)  {
    let max = -1;
    let bestAction = env.getRandomAction(state);
    const actionsRow = env.qtable[state];
    const actions = Object.keys(actionsRow);

    actions.forEach((action) => {
      const actionReward = actionsRow[action];

      if (actionReward > max) {
        max = actionReward;
        bestAction = action;
      }
    });

    return bestAction;
  }

  initHyperParameters() {
    this.totalTrainEpisodes = 100;
    this.totalTestEpisodes = 1;
    this.maxSteps = 99;
    this.learningRate = 0.7;
    this.gamma = 0.618;
    this.epsilon = 1.0;       // exploration rate
    this.maxEpsilon = 1.0;    // exploration propability at start
    this.minEpsilon = 0.01;   // minimum exploration propability
    this.decayRate = 0.01;
  }

  _play(states) {
    const self = this;
    let lastState;

    function * _iterator(states) {
      for (let i = 0, len = states.length; i < len; i++) {
        if (i === 0) lastState = 0 + 1;
        lastState = states[i - 1] + 1;

        const state = states[i] + 1;
        const td = document.getElementById('state_' + state);
        const lastTd = document.getElementById('state_' + lastState);

        if (self._hasClass(td, 'alligator')) {
          self._removeClass(td, 'alligator');
          self._removeClass(td, 'warrior');
          self._addClass(td, 'dead');
        }

        if (self._hasClass(td, 'castle')) {
          self._removeClass(td, 'castle');
          self._removeClass(td, 'warrior');
          self._addClass(td, 'balloon');
        }

        td.classList.add('warrior');
        yield
      }
    }

    const play = _iterator(states)
    setInterval(() => {
      play.next();
    }, 500);
  }

  _hasClass(el, classToTest) {
    const pattern = new RegExp("(^| )" + classToTest + "( |$)");
    return pattern.test(el.className) ? true : false;
  }

  _addClass(el, classToAdd) {
    el.classList.add(classToAdd);
  }

  _removeClass(el, classToRemove) {
    el.classList.remove(classToRemove);
  }

  _getRandomNumber() {
    return (Math.random() * 1) + 0;
  }
}

const game = new Game();
game.train();
game.test();
