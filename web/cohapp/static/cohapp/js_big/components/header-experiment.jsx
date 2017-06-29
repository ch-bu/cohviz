class HeaderExperiment extends React.Component {
  constructor(props) {
    super(props);

    // Bind this to methods
    this.renderInstruction = this.renderInstruction.bind(this);
  }

  render() {

    return (
      <div className="row" id="header-experiment">
        <ul id="header-experiment-ul">
          <li onClick={this.renderInstruction} className={this.props.showInstruction ? 'highlight-experiment-status' : ''}>Instruktion lesen</li>
          <li className={this.props.showEditor ? 'highlight-experiment-status' : ''}>Text verfassen</li>
          <li className={this.props.showRevisionPrompt ? 'highlight-experiment-status' : ''}>Revisionsinstruktion lesen</li>
          <li className={this.props.showRevision ? 'highlight-experiment-status' : ''}>Text revidieren</li>
        </ul>
      </div>
    )
  }

  renderInstruction() {
    this.props.renderInstruction();
  }
};

export default HeaderExperiment;
