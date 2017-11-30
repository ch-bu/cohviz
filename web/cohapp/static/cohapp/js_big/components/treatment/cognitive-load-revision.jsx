class CognitiveLoadRevision extends React.Component {
  constructor(props) {
    super(props);

    this.buttonInteraction = this.buttonInteraction.bind(this);
  }

  render() {

    return (
      <div className="cognitiveload">
        <div className="container row">
          <p className="strong-p">Wie stark hast du dich bei der Überarbeitung deiner Erkärung angestrengt?</p>
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
          <p className="strong-p">Wie schwierig war es für dich, deine Erklärung zu überarbeiten?</p>
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
          <p className="strong-p">Wie hoch schätzt du die Verständlichkeit deiner überarbeiteten Erklärung ein?</p>
          <div className="col s4 m2">
            <p>0% (gar nicht verständlich)</p>
          </div>
          <div className="col s4 m3">
            <p className="range-field">
              <input ref={(el) => { this.fourthQuestion = el; }}
                type="range" id="question4" min="0" max="100" />
            </p>
          </div>
          <div className="col s4 m2">
            <p>100% (sehr verständlich)</p>
          </div>
        </div>
        <div className="container row">
          <p className="strong-p">Wie hoch schätzt du die lokale Kohäsion deiner überarbeiteten Erklärung ein?</p>
          <div className="col s4 m2">
            <p>0% (gar nicht lokal kohäsiv)</p>
          </div>
          <div className="col s4 m3">
            <form action="#">
            <p className="range-field">
              <input ref={(el) => { this.accuracyRevisionLocal = el; }}
                type="range" id="question1" min="0" max="100" />
            </p>
            </form>
          </div>
          <div className="col s4 m2">
            <p>100% (vollkommen lokal kohäsiv)</p>
          </div>
        </div>
        <div className="container row">
          <p className="strong-p">Wie hoch schätzt du die globale Kohäsion deiner überarbeiteten Erklärung ein?</p>
          <div className="col s4 m2">
            <p>gar nicht global kohäsiv</p>
          </div>
          <div className="col s4 m3">
            <p className="range-field">
              <input ref={(el) => { this.accuracyRevisionGlobal = el; }}
                type="range" id="question2" min="0" max="100" />
            </p>
          </div>
          <div className="col s4 m2">
            <p>vollkommen global kohäsiv</p>
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
                'fourthQuestion': this.fourthQuestion.value,
                'accuracyRevisionLocal': this.accuracyRevisionLocal.value,
                'accuracyRevisionGlobal': this.accuracyRevisionGlobal.value};

    // Update draft in parent
    this.props.updateRevision(data);
  }
};


export default CognitiveLoadRevision;
