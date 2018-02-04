import {Provider} from 'react-redux';
import {LandingPageStore} from '../../store.jsx';
import {connect} from 'react-redux';
import About from './about.jsx';
import Contact from './contact.jsx';
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
            <li><NavLink to="/contact">Contact</NavLink></li>
          </ul>
        </nav>
        <main>
            <Switch>
              <Route path="/about" component={About} />
              <Route path="/contact" component={Contact} />
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
    app: store.general
  }
}

// Subscribe app to local storage
LandingPageStore.subscribe(() => {
  localStorage.setItem('landingpage', JSON.stringify(LandingPageStore.getState()));
});

// Connect store to landing page
// https://github.com/ReactTraining/react-router/issues/4671
var ConnectedLandingPage = withRouter(connect(mapStatetoProps)(LandingPage));

ReactDOM.render(<Provider store={LandingPageStore}>
    <HashRouter basename="/">
      <ConnectedLandingPage />
    </HashRouter>
  </Provider>,
  document.getElementById('landing-page')
);
