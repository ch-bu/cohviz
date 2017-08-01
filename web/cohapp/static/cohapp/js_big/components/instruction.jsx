import Preloader from './preloader.jsx';

class Instruction extends React.Component {
	constructor(props) {
		super(props);
	}

  render() {

    let button = <a id="instruction-read" className="waves-effect waves-light btn" onClick={this.props.renderNextState}>Ich habe die Instruktion gelesen</a>;

    if (this.props.seenInstruction) {
      if (this.props.draftAnalyzed == null) {
        button = <Preloader />;
      }
    }

    return (
      <div className="row" id="instruction">
        <div className="s12 m10 offset-m1 l6 offset-l3 col" id="instruction-text">
          <p>{this.props.instructionText}</p>
        </div>
        <div className="s12 m8 offset-m2 l6 offset-l3 col">
          {button}
        </div>
      </div>
    )
  }
};

export default Instruction;
