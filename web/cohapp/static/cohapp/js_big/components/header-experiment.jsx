class HeaderExperiment extends React.Component {
  constructor(props) {
    super(props);
  }

  render() {

    return (
      <div className="row" id="header-experiment">
        <ul id="header-experiment-ul">
          <li className={this.props.showInstruction ? 'highlight-experiment-status' : ''}>Instruktion lesen</li>
          <li className={this.props.showEditor ? 'highlight-experiment-status' : ''}>Text verfassen</li>
          <li className={this.props.showFeedback ? 'highlight-experiment-status' : ''}>Revisionsinstruktion lesen</li>
          <li className={this.props.showRevision ? 'highlight-experiment-status' : ''}>Text revidieren</li>
        </ul>
      </div>
    )
  }
};

export default HeaderExperiment;
