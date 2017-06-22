class Instruction extends React.Component {
	constructor(props) {
		super(props);

    // Bind this to methods
    this.renderEditor = this.renderEditor.bind(this);
	}

  render() {
    return (
      <div className="row" id="instruction">
        <div className="s12 m8 offset-m2 l8 offset-l2 col">
          <p>{this.props.instruction_text}</p>
        </div>
        <div className="s12 m8 offset-m2 l5 offset-l3 col center-align">
          <a id="instruction-read" className="center-align waves-effect waves-light btn" onClick={this.renderEditor}>Ich habe die Instruktion gelesen</a>
        </div>
      </div>
      )
  }

  renderEditor() {
    console.log('click');
  }
};


export default Instruction;
