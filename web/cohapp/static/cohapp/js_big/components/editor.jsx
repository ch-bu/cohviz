import Preloader from './preloader.jsx';

class Editor extends React.Component {
  constructor(props) {
    super(props);

    this.state = {'displayButton': true};

    this.analyzeText = this.analyzeText.bind(this);
    this.getText = this.getText.bind(this);
  }

  render() {

    // Store button and loading Ring in variables
    var button = <a className="waves-effect waves-light btn" id="editor-button"
                   onClick={this.analyzeText}>Analyziere meinen Text</a>;
    var loadingRing = <Preloader />;

    let buttonElement = this.state.displayButton ? button : loadingRing;

    return (
      <div className="row" id="editor">
       <div id="editor-medium-editor" className="col s11 m8 offset-m2 l6 offset-l3">
          <div id="editor-textinput" ref={(el) => { this.textInput = el; }}></div>
          <div id="editor-button-div" className="s12 m8 offset-m2 l6 offset-l3 col center-align">
            {buttonElement}
          </div>
        </div>
      </div>
      )
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

  analyzeText() {
    // Replace button when clicked
    this.setState({'displayButton': false});

    // Get text from medium editor
    var text = this.getText();

    // Analyze text
    this.props.analyzeText();
  }

  getText() {
    console.log(this.textInput.getDOMNode);
    // var res = [];

    // for(var m in this.textInput) {
    //     if(typeof this.textInput[m] == "function") {
    //         console.log(m);
    //     }
    // }
  }
};

export default Editor;
