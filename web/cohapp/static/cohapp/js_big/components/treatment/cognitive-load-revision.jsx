class CognitiveLoadRevision extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      finishedFirstQuestion: false,
      finishedSecondQuestion: false,
      finishedThirdQuestion: false,
      finishedFourthQuestion: false
    };

    // Bind methods
    this.firstQuestionInteraction = this.firstQuestionInteraction.bind(this);
    this.secondQuestionInteraction = this.secondQuestionInteraction.bind(this);
    this.thirdQuestionInteraction = this.thirdQuestionInteraction.bind(this);
    this.fourthQuestionInteraction = this.fourthQuestionInteraction.bind(this);
    this.buttonInteraction = this.buttonInteraction.bind(this);
  }

  render() {

    return (
      <div className="cognitiveload">
        <div className="container row">
          <p className="strong-p">Wie stark hast du dich bei der Überarbeitung des Entwurfs angestrengt?</p>
          <div className="col s4 m2">
            <p>sehr stark angestrengt</p>
          </div>
          <div className="col s4 m3">
            <p className="range-field">
              <input onMouseUp={this.firstQuestionInteraction}
                ref={(el) => { this.firstQuestion = el; }}
                type="range" id="question1" min="1" max="9" />
            </p>
          </div>
          <div className="col s4 m2">
            <p>gar nicht angestrengt</p>
          </div>
        </div>
        {this.state.finishedFirstQuestion ?
        <div className="container row">
          <p className="strong-p">Wie schwierig war es für dich, den Entwurf zu überarbeiten?</p>
          <div className="col s4 m2">
            <p>sehr schwierig</p>
          </div>
          <div className="col s4 m3">
            <p className="range-field">
              <input onMouseUp={this.secondQuestionInteraction}
                ref={(el) => { this.secondQuestion = el; }}
                type="range" id="question2" min="1" max="9" />
            </p>
          </div>
          <div className="col s4 m2">
            <p>gar nicht schwierig</p>
          </div>
        </div> : ''}
        {this.state.finishedSecondQuestion ?
        <div className="container row">
          <p className="strong-p">Wie überzeugend schätzt du deine überarbeitete Erörterung ein?</p>
          <div className="col s4 m2">
            <p>sehr überzeugend</p>
          </div>
          <div className="col s4 m3">
            <p className="range-field">
              <input onMouseUp={this.thirdQuestionInteraction}
                ref={(el) => { this.thirdQuestion = el; }}
                type="range" id="question3" min="1" max="5" />
            </p>
          </div>
          <div className="col s4 m2">
            <p>gar nicht überzeugend</p>
          </div>
        </div> : ''}
        {this.state.finishedThirdQuestion ?
        <div className="container row">
          <p className="strong-p">Wie verständlich schätzt du deine überarbeitete Erörterung ein?</p>
          <div className="col s4 m2">
            <p>sehr verständlich</p>
          </div>
          <div className="col s4 m3">
            <p className="range-field">
              <input onMouseUp={this.fourthQuestionInteraction} ref={(el) => { this.fourthQuestion = el; }}
                type="range" id="question4" min="1" max="5" />
            </p>
          </div>
          <div className="col s4 m2">
            <p>gar nicht verständlich</p>
          </div>
        </div> : ''}
        {this.state.finishedFourthQuestion ?
        <div className="s12 m8 offset-m2 l6 offset-l2 col">
          <a id="instruction-read" className="waves-effect waves-light btn" onClick={this.buttonInteraction}>Weiter</a>
        </div> : ''}
      </div>
    )
  }

  firstQuestionInteraction() {
    this.setState({finishedFirstQuestion: true});
  }

  secondQuestionInteraction() {
    this.setState({finishedSecondQuestion: true});
  }

  thirdQuestionInteraction() {
    this.setState({finishedThirdQuestion: true});
  }

  fourthQuestionInteraction() {
    this.setState({finishedFourthQuestion: true});
  }

  buttonInteraction() {
    // Data of all questions
    var data = {'firstQuestion': this.firstQuestion.value,
                'secondQuestion': this.secondQuestion.value,
                'thirdQuestion': this.thirdQuestion.value,
                'fourthQuestion': this.fourthQuestion.value};

    // Update draft in parent
    this.props.updateRevision(data);
  }
};


export default CognitiveLoadRevision;
