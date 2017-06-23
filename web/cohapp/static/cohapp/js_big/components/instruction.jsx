import Preloader from './preloader.jsx';

class Instruction extends React.Component {
	constructor(props) {
		super(props);

    this.state = {
      showButton: true
    };

    // Bind this to methods
    this.renderEditorParent = this.renderEditorParent.bind(this);
	}

  render() {

    var button = this.state.showButton ?
      <a id="instruction-read" className="center-align waves-effect waves-light btn" onClick={this.renderEditorParent}>Ich habe die Instruktion gelesen</a> :
      <Preloader />;
    // var button = <h1>Button</h1>;

    return (
      <div className="row" id="instruction">
        <div className="s12 m8 offset-m2 l8 offset-l2 col">
          <p>{this.props.instruction_text}</p>
        </div>
        <div className="s12 m8 offset-m2 l5 offset-l3 col center-align">
          {button}
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
    // Show preloader
    this.setState({showButton: false});

    // Run function to change showEditor boolean to true
    this.props.renderEditor();
  }
};

export default Instruction;
