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
        <div className="s12 m10 offset-m1 l6 offset-l3 col" id="instruction-text">
          <p>{this.props.instructionText}</p>
        </div>
        <div className="s12 m8 offset-m2 l6 offset-l3 col">
          <a id="instruction-read" className="waves-effect waves-light btn"
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
