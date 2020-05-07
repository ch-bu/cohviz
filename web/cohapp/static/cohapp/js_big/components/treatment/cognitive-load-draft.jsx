class CognitiveLoadDraft extends React.Component {
  constructor(props) {
    super(props);


    this.state = {
      question1Clicked: false,
      question2Clicked: false,
      // Emotionale Erregung
      emo1_draft: false,
      emo2_draft: false,
      emo3_draft: false,
      emo4_draft: false,
    };

    this.buttonInteraction = this.buttonInteraction.bind(this);
  }

  render() {

    // Only render button after every item has been clicked
    var button = '';
    if (this.state.question1Clicked && this.state.question2Clicked &&
        this.state.emo1_draft && this.state.emo2_draft && this.state.emo3_draft &&
        this.state.emo4_draft) {
      button = <div className="container row">
          <a id="instruction-read" className="waves-effect waves-light btn"
          onClick={this.buttonInteraction}>Weiter</a>
        </div>;
    }

    return (
      <div className="cognitiveload container">
        <div className="row load-question">
          <p className="strong-p">Wie stark hast du dich beim Verfassen deines argumentativen Textes mental angestrengt?</p>
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
          <p className="strong-p">Wie schwierig war es für dich, den argumentativen Text verfassen?</p>
          <div className="col s4 m2">
            <p>gar nicht schwierig</p>
          </div>
          <div className="col s4 m3">
            <p className="range-field">
              <input ref={(el) => { this.secondQuestion = el; }}
                type="range" id="question2" min="1" max="9"
                onMouseDown={() => this.setState({question2Clicked: true})} />
            </p>
          </div>
          <div className="col s4 m2">
            <p>sehr schwierig</p>
          </div>
        </div>

        <div className="container row">
          <h2 style={{fontSize: '2.2rem'}}>Emotionale Erregung</h2>
          <p>Inwiefern hast du folgende Gefühle während der Verfassens des Textes empfunden?</p>
        </div>

        <div className="container row">
          <p className="strong-p">Zufriedenheit/Glück</p>
          <div className="col s4 m2">
            <p>überhaupt nicht</p>
          </div>
          <div className="col s4 m3">
            <p className="range-field">
              <input ref={(el) => { this.emo1_draft = el; }}
                type="range" id="emo1_draft" min="1" max="9"
                onMouseDown={() => this.setState({emo1_draft: true})} />
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
              <input ref={(el) => { this.emo2_draft = el; }}
                type="range" id="emo2_draft" min="1" max="9"
                onMouseDown={() => this.setState({emo2_draft: true})} />
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
              <input ref={(el) => { this.emo3_draft = el; }}
                type="range" id="emo3_draft" min="1" max="9"
                onMouseDown={() => this.setState({emo3_draft: true})} />
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
              <input ref={(el) => { this.emo4_draft = el; }}
                type="range" id="emo4_draft" min="1" max="9"
                onMouseDown={() => this.setState({emo4_draft: true})} />
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

  buttonInteraction() {
    // Data of all questions
    var data = {'firstQuestion': this.firstQuestion.value,
                'secondQuestion': this.secondQuestion.value,
                'emo1_draft': this.emo1_draft.value,
                'emo2_draft': this.emo2_draft.value,
                'emo3_draft': this.emo3_draft.value,
                'emo4_draft': this.emo4_draft.value};

    // Update draft in parent
    this.props.updateDraft(data);
  }
};


export default CognitiveLoadDraft;
