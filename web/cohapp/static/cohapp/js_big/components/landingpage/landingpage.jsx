import {Provider} from 'react-redux';
import {LandingPageStore} from '../../store.jsx';
import {connect} from 'react-redux';
import About from './about.jsx';
import Contact from './contact.jsx';
import Application from './application.jsx';
import { HashRouter, Route, Switch, NavLink, withRouter } from 'react-router-dom';
// import { push as Menu } from 'react-burger-menu';

class LandingPage extends React.Component {
  constructor(props) {
    super(props);
  }

  render() {
    return (
      <div>
        {/* <Menu right pageWrapId={"page-wrap"}> */}
          <NavLink to="/">Application</NavLink>
          <NavLink to="/contact">Contact</NavLink>
        {/* </Menu> */}
        <main id="page-wrap">
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
