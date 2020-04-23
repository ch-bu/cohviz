import Preloader from '../preloader.jsx';

class Editor extends React.Component {
  constructor(props) {
    super(props);

    this.state = {'displayButton': true};

    this.analyzeText = this.analyzeText.bind(this);
    this.returnInnerHTML = this.returnInnerHTML.bind(this);
    this.updateDraft = this.updateDraft.bind(this);
  }

  render() {
    // Store button and loading Ring in variables
    var button = <a className="waves-effect waves-light btn" id="editor-button"
                   onClick={this.analyzeText}>Weiter</a>;

    return (
      <div className="row" id="editor">
       <div id="editor-medium-editor" className="col s11 m8 offset-m2 l6 offset-l3">
          <div id="editor-textinput" ref={(el) => { this.textInput = el; }}
              style={{marginTop: '20px', marginBottom: '20px', border: '1px solid #ccc', padding: '10px'}}
              dangerouslySetInnerHTML={this.returnInnerHTML()}
              onKeyUp={this.updateDraft} ></div>
          <div id="editor-button-div" className="col s11 m8 offset-m2 l6 offset-l3">
            {this.state.displayButton ? button : <Preloader />}
          </div>
        </div>
      </div>
      )
  }

  updateDraft() {
    this.props.updateDraft(this.textInput.innerHTML);
  }

  /**
   * Update component only if editor is not currently
   * visible
   * @return {Boolean} True if editor is not visible false otherwise
   */
  shouldComponentUpdate() {
    if (this.props.editorVisible) {
      return false;
    }

    return true;
  }

  /**
   * Enable Medium Editor after component mounted
   * @return {undefined}
   */
  componentDidMount() {
    // Enable editor
    var editor = new MediumEditor(this.textInput, {
      toolbar: false,
      placeholder: {
        text: 'Bitte schreiben Sie hier ihren argumentativen Text ...',
        hideOnClick: true
      },
    });
  }

  returnInnerHTML() {
    return {__html: this.props.draftText};
  }

  analyzeText() {
    // this.setState({'displayButton': false});

    // Analyze the draft
    this.props.analyzeText();
  }

};

export default Editor;
