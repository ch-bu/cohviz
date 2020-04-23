class CognitiveLoadRevision extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      firstQuestionClicked: false,
      secondQuestionClicked: false,
      fourthQuestionClicked: false,
      accuracyRevisionLocalClicked: false,
      accuracyRevisionGlobalClicked: false,
      // Nützlichkeit des Feedbacks
      g06fu1fbClicked: false,
      g8fu3fbClicked: false,
      g07fu2fbClicked: false,
      g10fu5fbClicked: false,
      g9fu4fbClicked: false,
      // Emotionale Erregung
      g11eda5Clicked: false,
      g12eda6Clicked: false,
      g13eda7Clicked: false,
      g14eda8Clicked: false,
    };

    this.buttonInteraction = this.buttonInteraction.bind(this);
    this.renderNuetzlichkeit = this.renderNuetzlichkeit.bind(this);
  }

  render() {

    // Only render button after every item has been clicked
    var button = '';
    if (this.state.firstQuestionClicked && this.state.secondQuestionClicked &&
        this.state.fourthQuestionClicked && this.state.accuracyRevisionLocalClicked &&
        this.state.accuracyRevisionGlobalClicked) {
      button = <div className="container row">
          <a id="instruction-read" className="waves-effect waves-light btn"
          onClick={this.buttonInteraction}>Weiter</a>
        </div>;
    }

    var nuetzlichkeit = '';

    if ((this.props.group == "cmap" || this.props.group == "cmap-integrated")) {
      nuetzlichkeit = this.renderNuetzlichkeit(true)
    }

    console.log(this.props.group);
    console.log(nuetzlichkeit);


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


        {nuetzlichkeit}
        

        <div className="container">
          <h2>Emotionale Erregung</h2>
          <p>Inwiefern hast du folgende Gefühle während der Überarbeitung des Textes empfunden?</p>
        </div>

        <div className="container row">
          <p className="strong-p">Zufriedenheit/Glück.</p>
          <div className="col s4 m2">
            <p>überhaupt nicht</p>
          </div>
          <div className="col s4 m3">
            <p className="range-field">
              <input ref={(el) => { this.g11eda5 = el; }}
                type="range" id="accuracyGlobal" min="1" max="9"
                onMouseDown={() => this.setState({g11eda5Clicked: true})} />
            </p>
          </div>
          <div className="col s4 m2">
            <p>extrem</p>
          </div>
        </div>

        <div className="container row">
          <p className="strong-p">Aufregung/Enthusiasmus</p>
          <div className="col s4 m2">
            <p>überhaupt nicht</p>
          </div>
          <div className="col s4 m3">
            <p className="range-field">
              <input ref={(el) => { this.g12eda6 = el; }}
                type="range" id="accuracyGlobal" min="1" max="9"
                onMouseDown={() => this.setState({g12eda6Clicked: true})} />
            </p>
          </div>
          <div className="col s4 m2">
            <p>extrem</p>
          </div>
        </div>

        <div className="container row">
          <p className="strong-p">Nervosität</p>
          <div className="col s4 m2">
            <p>überhaupt nicht</p>
          </div>
          <div className="col s4 m3">
            <p className="range-field">
              <input ref={(el) => { this.g13eda7 = el; }}
                type="range" id="accuracyGlobal" min="1" max="9"
                onMouseDown={() => this.setState({g13eda7Clicked: true})} />
            </p>
          </div>
          <div className="col s4 m2">
            <p>extrem</p>
          </div>
        </div>

        <div className="container row">
          <p className="strong-p">Besorgtheit</p>
          <div className="col s4 m2">
            <p>überhaupt nicht</p>
          </div>
          <div className="col s4 m3">
            <p className="range-field">
              <input ref={(el) => { this.g14eda8 = el; }}
                type="range" id="accuracyGlobal" min="1" max="9"
                onMouseDown={() => this.setState({g14eda8Clicked: true})} />
            </p>
          </div>
          <div className="col s4 m2">
            <p>extrem</p>
          </div>
        </div>

        {button}
      </div>
    )
  }

  renderNuetzlichkeit(show) {
    if (show) {
      return (<div><div className="container">
            <h2>Nützlichkeit des Feedbacks</h2>
          </div>

          <div className="container row">
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

          <div className="container row">
            <p className="strong-p">Durch das Feedback habe ich keine neuen Erkenntnisse in Bezug auf das Schreiben von kohäsiven Texten gewonnen.</p>
            <div className="col s4 m2">
              <p>trifft gar nicht zu</p>
            </div>
            <div className="col s4 m3">
              <p className="range-field">
                <input ref={(el) => { this.g8fu3fb = el; }}
                  type="range" id="accuracyGlobal" min="1" max="9"
                  onMouseDown={() => this.setState({g8fu3fbClicked: true})} />
              </p>
            </div>
            <div className="col s4 m2">
              <p>trifft voll und ganz zu</p>
            </div>
          </div>

          <div className="container row">
            <p className="strong-p">Das Feedback hat mir geholfen die Kohäsion meines Textes zu verbessern.</p>
            <div className="col s4 m2">
              <p>trifft gar nicht zu</p>
            </div>
            <div className="col s4 m3">
              <p className="range-field">
                <input ref={(el) => { this.g07fu2fb = el; }}
                  type="range" id="accuracyGlobal" min="1" max="9"
                  onMouseDown={() => this.setState({g07fu2fbClicked: true})} />
              </p>
            </div>
            <div className="col s4 m2">
              <p>trifft voll und ganz zu</p>
            </div>
          </div>

          <div className="container row">
            <p className="strong-p">Die Überarbeitung des Textes ist mir dank des Feedbacks leichtgefallen.</p>
            <div className="col s4 m2">
              <p>trifft gar nicht zu</p>
            </div>
            <div className="col s4 m3">
              <p className="range-field">
                <input ref={(el) => { this.g10fu5fb = el; }}
                  type="range" id="accuracyGlobal" min="1" max="9"
                  onMouseDown={() => this.setState({g10fu5fbClicked: true})} />
              </p>
            </div>
            <div className="col s4 m2">
              <p>trifft voll und ganz zu</p>
            </div>
          </div>

          <div className="container row">
            <p className="strong-p">Ich konnte mit dem Feedback nichts anfangen, weil ich die Concept Map nicht verstanden habe.</p>
            <div className="col s4 m2">
              <p>trifft gar nicht zu</p>
            </div>
            <div className="col s4 m3">
              <p className="range-field">
                <input ref={(el) => { this.g9fu4fb = el; }}
                  type="range" id="accuracyGlobal" min="1" max="9"
                  onMouseDown={() => this.setState({g9fu4fbClicked: true})} />
              </p>
            </div>
            <div className="col s4 m2">
              <p>trifft voll und ganz zu</p>
            </div>
          </div>
        </div>
      )
    }

    return '';
  }

  buttonInteraction() {
    let iscmap = (this.props.group == "cmap" || this.props.group == "cmap-integrated");

    // Data of all questions
    var data = {'firstQuestion': this.firstQuestion.value,
                'secondQuestion': this.secondQuestion.value,
                'fourthQuestion': this.fourthQuestion.value,
                'accuracyRevisionLocal': this.accuracyRevisionLocal.value,
                'accuracyRevisionGlobal': this.accuracyRevisionGlobal.value,
                'g06fu1fb': iscmap ? this.g06fu1fb.value : 0,
                'g8fu3fb': iscmap ? this.g8fu3fb.value : 0,
                'g07fu2fb': iscmap ? this.g07fu2fb.value : 0,
                'g10fu5fb': iscmap ? this.g10fu5fb.value : 0,
                'g9fu4fb': iscmap ? this.g9fu4fb.value : 0,
                'g11eda5': this.g11eda5.value,
                'g12eda6': this.g12eda6.value,
                'g13eda7': this.g13eda7.value,
                'g14eda8': this.g14eda8.value,
                };

    // Update draft in parent
    this.props.updateRevision(data);
  }
};


export default CognitiveLoadRevision;
