import Preloader from '../preloader.jsx';

class Instruction extends React.Component {
	constructor(props) {
		super(props);

    this.addInstruction = this.addInstruction.bind(this);
	}

  render() {

    let button = <a id="instruction-read" className="waves-effect waves-light btn"
    onClick={this.props.renderNextState}>STOP. Warten Sie auf weitere Instruktionen</a>;

    if (this.props.seenInstruction) {
      if (this.props.draftAnalyzed == null) {
        button = <Preloader />;
      }
    }

    return (
      <div className="row" id="instruction">
        <div className="col s12 m8 offset-m2 l6 offset-l3" id="instruction-text">
          <p dangerouslySetInnerHTML={this.addInstruction()}></p>
        </div>
        <div className="col s12 m8 offset-m2 l6 offset-l3">
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
