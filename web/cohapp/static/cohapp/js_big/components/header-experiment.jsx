class HeaderExperiment extends React.Component {
  constructor(props) {
    super(props);
  }

  render() {
    return (
      <div className="row" id="header-experiment">
        <ul id="header-experiment-ul">
          <li>Instruktion lesen</li>
          <li>Text verfassen</li>
          <li>Revisionsinstruktion lesen</li>
          <li>Text revidieren</li>
        </ul>
      </div>
    )
  }
};

export default HeaderExperiment;
