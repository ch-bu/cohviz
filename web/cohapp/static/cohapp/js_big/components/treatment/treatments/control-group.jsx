import Preloader from '../../preloader.jsx';

class ControlGroup extends React.Component {
  constructor(props) {
    super(props);

    // Bind this to methods
    this.updateRevision = this.updateRevision.bind(this);
    this.returnInnerHTML = this.returnInnerHTML.bind(this);
  }

  render() {
    return (
      <div className="row" id="editor">
       <div id="editor-medium-editor" className="col s11 m8 offset-m2 l6 offset-l3">
          <div id="editor-textinput" ref={(el) => { this.textInput = el; }}
              dangerouslySetInnerHTML={this.returnInnerHTML()}
              onKeyUp={this.updateRevision} ></div>
          <div id="editor-button-div" className="s12 m8 offset-m2 l6 offset-l3 col">
            <a onClick={this.props.analyzeRevision}
               className="waves-effect waves-light btn" id="editor-button">Analysiere meinen Text</a>
          </div>
        </div>
      </div>
    )
  }

  /**
   * Return dangerous html to editor
   * @return {dict} html
   */
  returnInnerHTML() {
    return {__html: this.props.revisionText}
  }

  // We need to store the revision in a state variable
  // in order to process it afterwards. Otherwise we will
  // lose the changes when the component is mounted again
  updateRevision() {
    this.props.updateRevision(this.textInput.innerHTML);
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
        // text: '',
        hideOnClick: true
      },
    });
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
};

export default ControlGroup;
