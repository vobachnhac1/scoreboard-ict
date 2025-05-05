const initialState = {
  rounds: 3,
  scoreTime: 1000,
  discipline: 'VOVINAM',
  matchTime: 10,
  scoreSystem1: 'TRUE',
  resistanceList: '-------',
  breakTime: 90,
  scoreSystem2: 'TRUE',
  rightList: '-------',
  extraRounds: 1,
  scoreSystem3: 'TRUE',
  refereeList: '-------',
  extraMatchTime: 90,
  rightMatch: 'TRUE',
  registerForm: '-------',
  resistanceCount: 5,
  reportPath: 'D:/Documents',
  rightCount: 5,
  logo: '-------',
  loading: false,
  error: null
};

const configReducer = (state = initialState, action) => {
  switch (action.type) {
    case 'SET_CONFIG':
      return {
        ...state,
        ...action.payload
      };

    case 'RESET_CONFIG':
      return initialState;

    case 'UPDATE_CONFIG_FIELD':
      return {
        ...state,
        [action.payload.field]: action.payload.value
      };

    default:
      return state;
  }
};

export default configReducer;
