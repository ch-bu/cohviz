import Preloader from '../preloader.jsx';

class Instruction extends React.Component {
	constructor(props) {
		super(props);

    this.addInstruction = this.addInstruction.bind(this);
	}

  render() {

    let button = <a id="instruction-read" className="waves-effect waves-light btn" onClick={this.props.renderNextState}>Weiter</a>;

    if (this.props.seenInstruction) {
      if (this.props.draftAnalyzed == null) {
        button = <Preloader />;
      }
    }

    return (
      <div className="row" id="instruction">
        <div className="s12 m10 offset-m1 l7 offset-l2 col" id="instruction-text">
          <p dangerouslySetInnerHTML={this.addInstruction()}></p>
        </div>
        <div className="s12 m8 offset-m2 l7 offset-l2 col">
          {button}
        </div>
      </div>
    )
  }

  addInstruction() {
    return {__html: this.props.instructionText};
  }

};

export default Instruction;
