import Preloader from './preloader.jsx';

class Instruction extends React.Component {
	constructor(props) {
		super(props);

    // Bind this to methods
    this.renderEditorParent = this.renderEditorParent.bind(this);
	}

  render() {
    return (
      <div className="row" id="instruction">
        <div className="s12 m8 offset-m2 l6 offset-l3 col">
          <p>{this.props.instruction_text}</p>
        </div>
        <div className="s12 m8 offset-m2 l6 offset-l3 col center-align">
          <a id="instruction-read" className="center-align waves-effect waves-light btn"
             onClick={this.renderEditorParent}>Ich habe die Instruktion gelesen</a>
        </div>
      </div>
    )
  }

  /**
   * User clicks that she has
   * written the instruction and the
   * editor opens up.
   * @return {None}
   */
  renderEditorParent() {
    // Run function to change showEditor boolean to true
    this.props.renderEditor();
  }
};

export default Instruction;
