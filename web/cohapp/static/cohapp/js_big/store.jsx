import {createStore} from 'redux';
import {LandingPageReducer} from './reducers/';

var LandingPageStore = createStore(LandingPageReducer);

export {LandingPageStore};
