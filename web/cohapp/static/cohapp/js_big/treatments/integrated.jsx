import {my_urls} from '../components/jsx-strings.jsx';
import {getPlainText} from '../components/helperfunctions.js';
import Instruction from '../components/instruction.jsx';
import Preloader from '../components/preloader.jsx';
import Editor from '../components/editor.jsx';
import HeaderExperiment from '../components/header-experiment.jsx';

class TreatmentIntegrated extends React.Component {
  constructor(props) {
    super(props);

    var self = this;

    // Setup state variables
    this.state = {
      // Meta variables
      user: null,
      measurement: null,
      // Display variables
      showEditor: false,
      showInstruction: false,
      showRevisionPrompt: false,
      showRevision: false,
      // Data variables
      durationDraft: null,
      draftAnalyzed: null,
      draftText: '',
      draftPlainText: '',
    };

    // Get urls
    this.urls = my_urls;

    // Get hash of experiment
    var path = window.location.href;
    this.experiment_id = path.substr(path.lastIndexOf('/') + 1);

    // Fetch user data
    fetch(this.urls.user_specific + this.experiment_id, {
      method: 'GET',
      credentials: "same-origin"
    }).then(function(response) {
      return response.json();
    }).then(function(data) {
      self.setState({user: data});
    });

    // Fetch measurement data
    fetch(this.urls.measurement + this.experiment_id, {
      method: 'GET',
      credentials: 'same-origin'
    }).then(function(response) {
      return response.json();
    }).then(function(data) {
      self.setState({measurement: data[0],
                     showInstruction: true});
    });

    // Bind this to methods

    this.analyzeText = this.analyzeText.bind(this);
    this.updateDraft = this.updateDraft.bind(this);
    this.renderInstruction = this.renderInstruction.bind(this);
    this.renderEditor = this.renderEditor.bind(this);
    this.renderRevisionPrompt = this.renderRevisionPrompt.bind(this);
    this.renderRevision = this.renderRevision.bind(this);
  }

  render() {
    // Show preloader if state user not shown
    let template = <Preloader />;

    // User data has been fetched
    if (this.state.user != null || this.state.measurement) {
      // Measurement data has been fetched
      if (this.state.measurement != null) {

        // Render instruction
        if (this.state.showInstruction) {
          // Render instruction for current measurement
          template = <Instruction
              instructionText={this.state.measurement.instruction}
              renderNextState={this.renderEditor} />;
        // Render editor
        } else if (this.state.showEditor) {
            template = <Editor analyzeText={this.analyzeText}
                             updateDraft={this.updateDraft}
                             draftText={this.state.draftText}
                             editorVisible={this.state.showEditor} />;
        } else if (this.state.showRevisionPrompt) {
          template = <Instruction
              instructionText={this.state.measurement.instruction_review}
              renderNextState={this.renderRevision} />;
        } else if (this.state.showRevision) {
          template = <h1>Revision</h1>;
        }
      }
    }

    return (
      <div>
          <HeaderExperiment showEditor={this.state.showEditor}
                            showInstruction={this.state.showInstruction}
                            showRevisionPrompt={this.state.showRevisionPrompt}
                            showRevision={this.state.showRevision}
                            renderInstruction={this.renderInstruction}
                            renderEditor={this.renderEditor}
                            renderRevisionPrompt={this.renderRevisionPrompt}
                            renderRevision={this.renderRevision} />
         {template}
      </div>
    );
  }

  /**
   * Render editor when user clicks
   * that she has read the instruction
   * @return {None}
   */
  renderEditor() {
    // Display editor by state change
    this.setState({showEditor: true, showInstruction: false,
                   showRevisionPrompt: false, showRevision: false}, () => {
        // Start timer for draft
        // this.setState({durationDraft: new Date()});
    });
  }

  /**
   * Render instruction of experiment
   * We want to give users control to
   * have another look at the instruction
   * @return {None}
   */
  renderInstruction() {
    this.setState({showEditor: false, showInstruction: true,
                   showRevisionPrompt: false, showRevision: false});
  }

  /**
   * Render
   * @return {[type]} [description]
   */
  renderRevisionPrompt() {
    this.setState({showEditor: false, showInstruction: false,
                   showRevisionPrompt: true, showRevision: false});
  }

  /**
   * Render revision
   * @return {[type]} [description]
   */
  renderRevision() {
    this.setState({showEditor: false, showInstruction: false,
                   showRevisionPrompt: false, showRevision: true});
  }

  /**
   * Analyze Text
   */
  analyzeText() {
    var self = this;

    this.setState({showEditor: false, showInstruction: false,
                   showRevisionPrompt: false, showRevision: false});

    // Save time for draft
    // this.setState({durationDraft: (new Date() - this.state.durationDraft) / 1000});

    this.setState({'draftPlainText': getPlainText(this.state.draftText)}, () => {
      // Analyze Text
      fetch(this.urls.textanalyzer + this.experiment_id, {
        method: 'POST',
        credentials: 'same-origin',
        body: JSON.stringify({
          text: self.state.draftPlainText
        }),
        headers: new Headers({
          'Content-Type': 'application/json'
        })
      }).then((response) => {
        return response.json();
      }).catch((error) => {
        console.log(error);
      }).then((data) => {
        console.log(data);
        self.setState({'draftAnalyzed': data,
                showEditor: false, showInstruction: false,
                showRevisionPrompt: true, showRevision: false});
      });
    });


  }

  /**
   * Store text from draft
   */
  updateDraft(text) {
    this.setState({'draftText': text});

    // Store text in local storage
    if (typeof(Storage) !== "undefined") {
      localStorage.setItem('textdraft', text);
    }
  }
}

ReactDOM.render(
  <TreatmentIntegrated />,
  document.getElementById('treatment-integrated')
);
