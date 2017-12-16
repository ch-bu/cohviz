class AccuracyDraft extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      accuracyLocalClicked: false,
      accuracyGlobalClicked: false,
      cognitiveloadClicked: false
    };

    this.buttonInteraction = this.buttonInteraction.bind(this);
  }

  render() {
    // Only render button if all questions have been clicked
    var button = '';
    if (this.state.accuracyLocalClicked && this.state.accuracyGlobalClicked &&
        this.state.cognitiveloadClicked) {
        button = <div className="container row">
                  <a id="instruction-read" className="waves-effect waves-light btn"
                  onClick={this.buttonInteraction}>STOP. Warten Sie auf weitere Instruktionen</a>
                </div>;
    }

    return (
      <div className="cognitiveload container">
        <div className="row load-question">
          <p className="strong-p">Wie hoch schätzt du die Verständlichkeit deiner jetzigen Erklärung ein?</p>
          <div className="col s4 m2">
            <p>0% (gar nicht verständlich)</p>
          </div>
          <div className="col s4 m3">
            <p className="range-field">
              <input ref={(el) => { this.fourthQuestion = el; }}
                type="range" id="question4" min="0" max="100"
                onMouseDown={() => this.setState({cognitiveloadClicked: true})} />
            </p>
          </div>
          <div className="col s4 m2">
            <p>100% (vollkommen verständlich)</p>
          </div>
        </div>
        <div className="row load-question">
          <p className="strong-p">Wie hoch schätzt du die lokale Kohäsion deiner jetzigen Erklärung ein?</p>
          <div className="col s4 m2">
            <p>0% (gar nicht lokal kohäsiv)</p>
          </div>
          <div className="col s4 m3">
            <form action="#">
            <p className="range-field">
              <input ref={(el) => { this.firstQuestion = el; }}
                type="range" id="question1" min="0" max="100"
                onMouseDown={() => this.setState({accuracyLocalClicked: true})} />
            </p>
            </form>
          </div>
          <div className="col s4 m2">
            <p>100% (vollkommen lokal kohäsiv)</p>
          </div>
        </div>
        <div className="row load-question">
          <p className="strong-p">Wie hoch schätzt du die globale Kohäsion deiner jetzigen Erklärung ein?</p>
          <div className="col s4 m2">
            <p>0% (gar nicht global kohäsiv)</p>
          </div>
          <div className="col s4 m3">
            <p className="range-field">
              <input ref={(el) => { this.secondQuestion = el; }}
                type="range" id="question2" min="0" max="100"
                onMouseDown={() => this.setState({accuracyGlobalClicked: true})} />
            </p>
          </div>
          <div className="col s4 m2">
            <p>100% (vollkommen global kohäsiv)</p>
          </div>
        </div>
        {button}
      </div>
    )
  }

  buttonInteraction() {
    // Data of all questions
    var data = {'accuracyLocal': this.firstQuestion.value,
                'accuracyGlobal': this.secondQuestion.value,
                'cognitiveloadUnderstandabilityDraft': this.fourthQuestion.value};

    // Update draft in parent
    this.props.updateAccuracyDraft(data);
  }
};


export default AccuracyDraft;
