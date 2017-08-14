class HeaderExperiment extends React.Component {
  constructor(props) {
    super(props);
  }

  render() {

    return (
      <div className="row" id="header-experiment">
        <ul id="header-experiment-ul">
          <li onClick={this.props.renderInstruction}
            className={this.props.showInstruction ? 'highlight-experiment-status' : ''}> <i className="material-icons">library_books</i>Anleitung lesen</li>
          <li onClick={this.props.renderEditor}
            className={this.props.showEditor ? 'highlight-experiment-status' : ''}><i className="material-icons">mode_edit</i>Text schreiben</li>
          <li onClick={this.props.renderRevisionPrompt}
            className={this.props.showRevisionPrompt ? 'highlight-experiment-status' : ''}><i className="material-icons">library_books</i>Anleitung zur Überarbeitung</li>
          <li onClick={this.props.renderRevision}
            className={this.props.showRevision ? 'highlight-experiment-status' : ''}><i className="material-icons">refresh</i>Text überarbeiten</li>
        </ul>
      </div>
    )
  }
};

export default HeaderExperiment;
