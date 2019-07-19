import {Provider} from 'react-redux';
import {LandingPageStore} from '../../store.jsx';
import {connect} from 'react-redux';
import About from './about.jsx';
import Contact from './contact.jsx';
import Research from './research.jsx';
import Application from './application.jsx';
import React from 'react';
import ReactDOM from 'react-dom';
import { HashRouter, Route, Switch, NavLink, withRouter } from 'react-router-dom';
import styled from 'styled-components';

const Container = styled.div`
  border-top: 15px solid #3E5AA7;
  width: 100vw;
  margin: 0;
`;

const App = styled.div`
  margin: 0 auto;
  width: 95vw;

  @media only screen and (min-width: 1600px) {
    width: 70vw;
  }
`;

const Menu = styled.div`
  width: 100%;
  height: 120px;
  display: flex;
  flex-direction: row;
  align-items: flex-end;
  justify-content: space-between;

  .logo h1 {
    font-size: 3rem !important;
    font-weight: light;
    font-family: "Open Sans";
  }

  .navigation {
    margin-bottom: 10px;
  }

  .is-active {
    border-bottom: 3px solid #3E5AA7 !important;
  }
  
  .navigation a {
    color: #000;
    font-size: 20px;
    margin-left: 12px;
    padding: 10px;
    border-bottom: 3px solid #fff;



    &:hover {
      color: #000;
      border-bottom: 3px solid #3E5AA7;
    }
  }
`;

class LandingPage extends React.Component {
  constructor(props) {
    super(props);
  }

  render() {
    return (
      <Container>
        <App>
          <Menu>
            <div className="logo">
              <h1>CohViz</h1>
            </div>
            <div className="navigation">
              <NavLink activeClassName='is-active' to="/about">About</NavLink>
              <NavLink activeClassName='is-active' to="/" exact>Application</NavLink>
              <NavLink activeClassName='is-active' to="/contact">Contact</NavLink>
              <NavLink activeClassName='is-active' to="/research">Research</NavLink>
            </div>
          </Menu>

          <Switch>
            <Route path="/about" component={About} />
            <Route path="/research" component={Research} />
            <Route path="/contact" component={Contact} />
            <Route path="/" component={Application} />
          </Switch>
        </App>
    </Container>
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
