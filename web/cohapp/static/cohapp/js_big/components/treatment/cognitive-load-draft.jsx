class CognitiveLoadDraft extends React.Component {
  constructor(props) {
    super(props);


    this.state = {
      question1Clicked: false,
      question2Clicked: false
    };

    this.buttonInteraction = this.buttonInteraction.bind(this);
  }

  render() {

    // Only render button after every item has been clicked
    var button = '';
    if (this.state.question1Clicked && this.state.question2Clicked) {
      button = <div className="container row">
          <a id="instruction-read" className="waves-effect waves-light btn"
          onClick={this.buttonInteraction}>Weiter</a>
        </div>;
    }

    return (
      <div className="cognitiveload container">
        <div className="row load-question">
          <p className="strong-p">Wie stark hast du dich beim Verfassen deiner Erklärung angestrengt?</p>
          <div className="col s4 m2">
            <p>gar nicht angestrengt</p>
          </div>
          <div className="col s4 m3">
            <form action="#">
            <p className="range-field">
              <input ref={(el) => { this.firstQuestion = el; }}
                type="range" id="question1" min="1" max="9"
                onMouseDown={() => this.setState({question1Clicked: true})} />
            </p>
            </form>
          </div>
          <div className="col s4 m2">
            <p>sehr stark angestrengt</p>
          </div>
        </div>
        <div className="row load-question">
          <p className="strong-p">Wie schwierig war es für dich, die Erklärung zu verfassen?</p>
          <div className="col s4 m2">
            <p>sehr schwierig</p>
          </div>
          <div className="col s4 m3">
            <p className="range-field">
              <input ref={(el) => { this.secondQuestion = el; }}
                type="range" id="question2" min="1" max="9"
                onMouseDown={() => this.setState({question2Clicked: true})} />
            </p>
          </div>
          <div className="col s4 m2">
            <p>gar nicht schwierig</p>
          </div>
        </div>
        {button}
      </div>
    )
  }

  buttonInteraction() {
    // Data of all questions
    var data = {'firstQuestion': this.firstQuestion.value,
                'secondQuestion': this.secondQuestion.value};

    // Update draft in parent
    this.props.updateDraft(data);
  }
};


export default CognitiveLoadDraft;
