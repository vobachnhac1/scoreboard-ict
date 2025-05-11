const initialState = {
  language: 'VI' // default language
};

const languageReducer = (state = initialState, action) => {
  switch (action.type) {
    case 'SET_LANGUAGE':
      return {
        ...state,
        language: action.payload
      };
    case 'RESET_LANGUAGE':
      return {
        ...state,
        language: 'VI' // reset to default language
      };
    default:
      return state;
  }
};

export default languageReducer;
