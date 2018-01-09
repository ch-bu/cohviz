import {createStore} from 'redux';
import {LandingPageReducer} from './reducers/';


const persistedStoreLandingPage = localStorage.getItem('landingpage') ?
  JSON.parse(localStorage.getItem('landingpage')): {};

var LandingPageStore = createStore(LandingPageReducer, persistedStoreLandingPage);

export {LandingPageStore};
