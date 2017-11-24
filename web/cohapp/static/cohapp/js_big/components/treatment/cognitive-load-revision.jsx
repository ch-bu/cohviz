class CognitiveLoadRevision extends React.Component {
  constructor(props) {
    super(props);

    this.buttonInteraction = this.buttonInteraction.bind(this);
  }

  render() {

    return (
      <div className="cognitiveload">
        <div className="container row">
          <p className="strong-p">Wie stark hast du dich bei der Überarbeitung des Entwurfs angestrengt?</p>
          <div className="col s4 m2">
            <p>gar nicht angestrengt</p>
          </div>
          <div className="col s4 m3">
            <p className="range-field">
              <input
                ref={(el) => { this.firstQuestion = el; }}
                type="range" id="question1" min="1" max="9" />
            </p>
          </div>
          <div className="col s4 m2">
            <p>sehr stark angestrengt</p>
          </div>
        </div>
        <div className="container row">
          <p className="strong-p">Wie schwierig war es für dich, den Entwurf zu überarbeiten?</p>
          <div className="col s4 m2">
            <p>sehr schwierig</p>
          </div>
          <div className="col s4 m3">
            <p className="range-field">
              <input
                ref={(el) => { this.secondQuestion = el; }}
                type="range" id="question2" min="1" max="9" />
            </p>
          </div>
          <div className="col s4 m2">
            <p>gar nicht schwierig</p>
          </div>
        </div>
        <div className="container row">
          <p className="strong-p">Wie überzeugend schätzt du deinen überarbeiteten Entwurf ein?</p>
          <div className="col s4 m2">
            <p>gar nicht überzeugend</p>
          </div>
          <div className="col s4 m3">
            <p className="range-field">
              <input
                ref={(el) => { this.thirdQuestion = el; }}
                type="range" id="question3" min="1" max="5" />
            </p>
          </div>
          <div className="col s4 m2">
            <p>sehr überzeugend</p>
          </div>
        </div>
        <div className="container row">
          <p className="strong-p">Wie verständlich schätzt du deinen überarbeiteten Entwurf ein?</p>
          <div className="col s4 m2">
            <p>gar nicht verständlich</p>
          </div>
          <div className="col s4 m3">
            <p className="range-field">
              <input ref={(el) => { this.fourthQuestion = el; }}
                type="range" id="question4" min="1" max="5" />
            </p>
          </div>
          <div className="col s4 m2">
            <p>sehr verständlich</p>
          </div>
        </div>
        <div className="container row">
          <a id="instruction-read" className="waves-effect waves-light btn" onClick={this.buttonInteraction}>Weiter</a>
        </div>
      </div>
    )
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
