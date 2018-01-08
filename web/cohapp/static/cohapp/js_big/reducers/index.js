import {combineReducers} from 'redux';
import textdata from './landingpage/textdata.jsx';
import general from  './landingpage/general.jsx';

var LandingPageReducer =  combineReducers({
  textdata,
  general
});

export {LandingPageReducer};
