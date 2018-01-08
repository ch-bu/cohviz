var initialState = {
  'loading': false,
}

export default function reducer(state=initialState, action) {
  switch(action.type) {
    case "SET_LOADING": {
      return Object.assign({}, state, {loading: action.payload ? true : false});
    }
  }

  return state;
}
