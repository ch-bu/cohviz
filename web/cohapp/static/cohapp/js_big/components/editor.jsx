class Editor extends React.Component {
  constructor(props) {
    super(props);

    this.analyzeText = this.analyzeText.bind(this);
  }

  render() {
    return (
      <div className="row" id="editor">
       <div id="editor-medium-editor" className="col s11 m10 offset-m1 l8 offset-l2">
         <div id="editor-textinput"></div>
          <div id="editor-button-div" className="center-align">
            <a className="waves-effect waves-light btn" id="editor-button" onClick={this.analyzeText}>Analyziere meinen Text</a>
          </div>
        </div>
      </div>
      )
  }

  analyzeText() {
    this.props.analyzeText();
  }
};

export default Editor;
