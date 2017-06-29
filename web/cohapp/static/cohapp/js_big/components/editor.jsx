import Preloader from './preloader.jsx';

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
                   onClick={this.analyzeText}>Analyziere meinen Text</a>;
    var loadingRing = <Preloader />;

    let buttonElement = this.state.displayButton ? button : loadingRing;

    return (
      <div className="row" id="editor">
       <div id="editor-medium-editor" className="col s11 m8 offset-m2 l8 offset-l2">
          <div id="editor-textinput" ref={(el) => { this.textInput = el; }}
              dangerouslySetInnerHTML={this.returnInnerHTML()}
              onKeyUp={this.updateDraft} ></div>
          <div id="editor-button-div" className="s12 m8 offset-m2 l6 offset-l3 col center-align">
            {buttonElement}
          </div>
        </div>
      </div>
      )
  }

  updateDraft() {
    this.props.updateDraft(this.textInput.innerHTML);
  }

  componentDidMount() {
    // Enable editor
    var editor = new MediumEditor(this.textInput, {
      toolbar: false,
      placeholder: {
        text: 'Bitte füge deinen Text hier ein',
        hideOnClick: true
      },
    });
  }

  returnInnerHTML() {
    return {__html: this.props.draftText};
  }

  analyzeText() {
    this.setState({'displayButton': false});
  }

};

export default Editor;
