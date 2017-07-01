class Instruction extends React.Component {
	constructor(props) {
		super(props);
	}

  render() {
    return (
      <div className="row" id="instruction">
        <div className="s12 m10 offset-m1 l6 offset-l3 col" id="instruction-text">
          <p>{this.props.instructionText}</p>
        </div>
        <div className="s12 m8 offset-m2 l6 offset-l3 col">
          <a id="instruction-read" className="waves-effect waves-light btn"
             onClick={this.props.renderNextState}>Ich habe die Instruktion gelesen</a>
        </div>
      </div>
    )
  }
};

export default Instruction;
