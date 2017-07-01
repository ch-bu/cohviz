class HeaderExperiment extends React.Component {
  constructor(props) {
    super(props);
  }

  render() {

    return (
      <div className="row" id="header-experiment">
        <ul id="header-experiment-ul">
          <li onClick={this.props.renderInstruction} className={this.props.showInstruction ? 'highlight-experiment-status' : ''}> <i className="material-icons">library_books</i> Instruktion lesen</li>
          <li onClick={this.props.renderEditor} className={this.props.showEditor ? 'highlight-experiment-status' : ''}><i className="material-icons">mode_edit</i> Text verfassen </li>
          <li className={this.props.showRevisionPrompt ? 'highlight-experiment-status' : ''}><i className="material-icons">library_books</i> Revisionsinstruktion lesen</li>
          <li className={this.props.showRevision ? 'highlight-experiment-status' : ''}><i className="material-icons">refresh</i> Text revidieren </li>
        </ul>
      </div>
    )
  }
};

export default HeaderExperiment;
