class LandingPage extends React.Component {
  constructor(props) {
    super(props)
  }

  render() {
    return (
      <p>Hi there</p>
    )
  }
}

ReactDOM.render(
  <LandingPage />,
  document.getElementById('landingpage')
);
