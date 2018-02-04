import {Provider} from 'react-redux';
import {LandingPageStore} from '../../store.jsx';
import {connect} from 'react-redux';
import WhatIsIt from './what-is-it.jsx';
import Application from './application.jsx';
import { HashRouter, Route, Switch, NavLink, withRouter } from 'react-router-dom';

class LandingPage extends React.Component {
  constructor(props) {
    super(props);
  }

  render() {
    return (
      <div>
        <nav id="navigation">
          <ul id="nav-wrapper">
            <li><NavLink className="logo" to="/">CohViz</NavLink></li>
            <li><NavLink to="/">Application</NavLink></li>
            <li><NavLink to="/about">What is it?</NavLink></li>
          </ul>
        </nav>
        <main>
            <Switch>
              <Route path="/about" component={WhatIsIt} />
              <Route path="/" component={Application} />
            </Switch>
        </main>
    </div>
    )
  }
}

/**
 * Maps the state to the props
 * @param  {[type]} store [description]
 * @return {[type]}       [description]
 */
function mapStatetoProps(store) {
  return {
    textdata: store.textdata,
    loading: store.general.loading
  }
}

// Connect store to landing page
// https://github.com/ReactTraining/react-router/issues/4671
var ConnectedLandingPage = withRouter(connect(mapStatetoProps)(LandingPage));

// Subscribe app to local storage
LandingPageStore.subscribe(() => {
  localStorage.setItem('landingpage', JSON.stringify(LandingPageStore.getState()));
});

ReactDOM.render(<Provider store={LandingPageStore}>
    <HashRouter basename="/">
      <ConnectedLandingPage />
    </HashRouter>
  </Provider>,
  document.getElementById('landing-page')
);
