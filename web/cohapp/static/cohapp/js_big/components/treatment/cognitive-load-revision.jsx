class CognitiveLoadRevision extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      firstQuestionClicked: false,
      secondQuestionClicked: false,
      fourthQuestionClicked: false,
      accuracyRevisionLocalClicked: false,
      accuracyRevisionGlobalClicked: false,
      g06fu1fbClicked: false,
    };

    this.buttonInteraction = this.buttonInteraction.bind(this);
  }

  render() {

    // Only render button after every item has been clicked
    var button = '';
    if (this.state.firstQuestionClicked && this.state.secondQuestionClicked &&
        this.state.fourthQuestionClicked && this.state.accuracyRevisionLocalClicked &&
        this.state.accuracyRevisionGlobalClicked) {
      button = <div className="container row">
          <a id="instruction-read" className="waves-effect waves-light btn"
          onClick={this.buttonInteraction}>STOP. Warten Sie auf weitere Instruktionen</a>
        </div>;
    }

    return (
      <div className="cognitiveload">
        <div className="container row">
          <p className="strong-p">Wie stark hast du dich bei der Überarbeitung deines argumentativen Textes mental angestrengt?</p>
          <div className="col s4 m2">
            <p>gar nicht angestrengt</p>
          </div>
          <div className="col s4 m3">
            <p className="range-field">
              <input
                ref={(el) => { this.firstQuestion = el; }}
                type="range" id="question1" min="1" max="9"
                onMouseDown={() => this.setState({firstQuestionClicked: true})} />
            </p>
          </div>
          <div className="col s4 m2">
            <p>sehr angestrengt</p>
          </div>
        </div>
        <div className="container row">
          <p className="strong-p">Wie schwierig war es für dich, den argumentativen Text zu überarbeiten?</p>
          <div className="col s4 m2">
            <p>gar nicht schwierig</p>
          </div>
          <div className="col s4 m3">
            <p className="range-field">
              <input
                ref={(el) => { this.secondQuestion = el; }}
                type="range" id="question2" min="1" max="9"
                onMouseDown={() => this.setState({secondQuestionClicked: true})} />
            </p>
          </div>
          <div className="col s4 m2">
            <p>sehr schwierig</p>
          </div>
        </div>
        <div className="container row">
          <p className="strong-p">Wie hoch schätzt du die Verständlichkeit deines überarbeiteten argumentativen Textes ein?</p>
          <div className="col s4 m2">
            <p>0% (gar nicht verständlich)</p>
          </div>
          <div className="col s4 m3">
            <p className="range-field">
              <input ref={(el) => { this.fourthQuestion = el; }}
                type="range" id="question4" min="1" max="9"
                onMouseDown={() => this.setState({fourthQuestionClicked: true})} />
            </p>
          </div>
          <div className="col s4 m2">
            <p>100% (sehr verständlich)</p>
          </div>
        </div>
        <div className="container row">
          <p className="strong-p">Wie hoch schätzt du die lokale Kohäsion deines überarbeiteten argumentativen Textes ein?</p>
          <div className="col s4 m2">
            <p>0% (gar nicht lokal kohäsiv)</p>
          </div>
          <div className="col s4 m3">
            <form action="#">
            <p className="range-field">
              <input ref={(el) => { this.accuracyRevisionLocal = el; }}
                type="range" id="accuracyLocal" min="1" max="9"
                onMouseDown={() => this.setState({accuracyRevisionLocalClicked: true})} />
            </p>
            </form>
          </div>
          <div className="col s4 m2">
            <p>100% (vollkommen lokal kohäsiv)</p>
          </div>
        </div>
        <div className="container row">
          <p className="strong-p">Wie hoch schätzt du die globale Kohäsion deines überarbeiteten argumentativen Textes ein?</p>
          <div className="col s4 m2">
            <p>gar nicht global kohäsiv</p>
          </div>
          <div className="col s4 m3">
            <p className="range-field">
              <input ref={(el) => { this.accuracyRevisionGlobal = el; }}
                type="range" id="accuracyGlobal" min="1" max="9"
                onMouseDown={() => this.setState({accuracyRevisionGlobalClicked: true})} />
            </p>
          </div>
          <div className="col s4 m2">
            <p>vollkommen global kohäsiv</p>
          </div>
        </div>


        <div className="container row">
          <h2>Nützlichkeit des Feedbacks</h2>
          <p className="strong-p">Ich habe das Feedback als hilfreich bei der Überarbeitung meines Textes hinsichtlich der Kohäsion meines Textes empfunden.</p>
          <div className="col s4 m2">
            <p>trifft gar nicht zu</p>
          </div>
          <div className="col s4 m3">
            <p className="range-field">
              <input ref={(el) => { this.g06fu1fb = el; }}
                type="range" id="accuracyGlobal" min="1" max="9"
                onMouseDown={() => this.setState({g06fu1fbClicked: true})} />
            </p>
          </div>
          <div className="col s4 m2">
            <p>trifft voll und ganz zu</p>
          </div>
        </div>
        {button}
      </div>
    )
  }

  buttonInteraction() {
    // Data of all questions
    var data = {'firstQuestion': this.firstQuestion.value,
                'secondQuestion': this.secondQuestion.value,
                'fourthQuestion': this.fourthQuestion.value,
                'accuracyRevisionLocal': this.accuracyRevisionLocal.value,
                'accuracyRevisionGlobal': this.accuracyRevisionGlobal.value,
                'g06fu1fb': this.g06fu1fb.value};

    // Update draft in parent
    this.props.updateRevision(data);
  }
};


export default CognitiveLoadRevision;
