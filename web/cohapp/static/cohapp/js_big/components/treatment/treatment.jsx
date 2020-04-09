import {my_urls} from '../jsx-strings.jsx';
import {getPlainText} from '../helperfunctions.js';
import Preloader from '../preloader.jsx';
import Instruction from './instruction.jsx';
import Editor from './editor.jsx';
import Revision from './revision.jsx';
import CognitiveLoadDraft from './cognitive-load-draft.jsx';
import CognitiveLoadRevision from './cognitive-load-revision.jsx';
import HeaderExperiment from './header-experiment.jsx';
import AccuracyDraft from './accuracy-draft.jsx';
import 'whatwg-fetch';

class Treatment extends React.Component {
  constructor(props) {
    super(props);

    var self = this;

    // Setup state variables
    this.state = {
      // Meta variables
      user: null,
      measurement: null,
      group: null,
      // Display variables
      showEditor: false,
      showInstruction: false,
      showRevisionPrompt: false,
      showAccuracyDraft: false,
      showRevision: false,
      showThankYouPage: false,
      showCognitiveLoadDraft: false,
      showCognitiveLoadRevision: false,
      // State variables
      seenInstruction: false,
      seenEditor: false,
      seenRevisionPrompt: false,
      seenRevision: false,
      // Cognitive load
      cognitiveLoadDraft: null,
      cognitiveLoadRevision: null,
      cognitiveLoadMiddle: {'firstQuestion': 0,
                'secondQuestion': 0,
                'fourthQuestion': 0},
      // Accuracy Statements
      accuracyDraft: null,
      accuracyRevision: null,
      // Data variables
      durationDraft: null,
      durationRevision: null,
      draftAnalyzed: null,
      draftText: '',
      draftPlainText: '',
      revisionAnalyzed: null,
      revisionText: '',
      revisionPlainText: ''
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
      self.setState({user: data, group: data['next_measure']});
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
    this.analyzeRevision = this.analyzeRevision.bind(this);
    this.updateDraft = this.updateDraft.bind(this);
    this.updateRevision = this.updateRevision.bind(this);
    this.renderInstruction = this.renderInstruction.bind(this);
    this.renderEditor = this.renderEditor.bind(this);
    this.renderRevisionPrompt = this.renderRevisionPrompt.bind(this);
    this.renderRevision = this.renderRevision.bind(this);
    this.userClickedInstruction = this.userClickedInstruction.bind(this);
    this.userClickedRevisionPrompt = this.userClickedRevisionPrompt.bind(this);
    // this.sendDataToServer = this.sendDataToServer.bind(this);
    this.updateCognitiveLoadDraft = this.updateCognitiveLoadDraft.bind(this);
    this.updateCognitiveLoadRevision = this.updateCognitiveLoadRevision.bind(this);
    this.updateCognitiveLoadMiddle = this.updateCognitiveLoadMiddle.bind(this);
    this.updateAccuracyDraft = this.updateAccuracyDraft.bind(this);
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
              instructionText={this.state.user.instruction}
              renderNextState={this.userClickedInstruction} />;
        // Render editor
        } else if (this.state.showEditor) {
            template = <Editor analyzeText={this.analyzeText}
                             updateDraft={this.updateDraft}
                             draftText={this.state.draftText}
                             editorVisible={this.state.showEditor} />;
        // Render cognitive load draft
        } else if (this.state.showCognitiveLoadDraft) {
          template = <CognitiveLoadDraft updateDraft={this.updateCognitiveLoadDraft} />;
        // Render prompt for revision
        } else if (this.state.showRevisionPrompt) {
          template = <Instruction
              instructionText={this.state.user.instruction_first}
              renderNextState={this.userClickedRevisionPrompt}
              seenInstruction={this.state.seenInstruction}
              draftAnalyzed={this.state.draftAnalyzed} />;
        // Render accuracy statements
        } else if (this.state.showAccuracyDraft) {
          template = <AccuracyDraft updateAccuracyDraft={this.updateAccuracyDraft} />
        // Render editor to revise draft
        } else if (this.state.showRevision) {
          template = <Revision measurement={this.state.user.next_measure}
                               draftText={this.state.draftText}
                               draftAnalyzed={this.state.draftAnalyzed}
                               updateRevision={this.updateRevision}
                               editorVisible={this.state.showRevision}
                               revisionText={this.state.revisionText}
                               analyzeRevision={this.analyzeRevision}
                               measurementDetails={this.state.user}
                               updateEffortMiddle={this.updateCognitiveLoadMiddle}
                               instruction={this.state.user.instruction_second} />;
        // Render cognitive load revision
        } else if (this.state.showCognitiveLoadRevision) {
          template = <CognitiveLoadRevision group={this.state.group} updateRevision={this.updateCognitiveLoadRevision} />;
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
   * Render instruction of experiment
   * We want to give users control to
   * have another look at the instruction
   * @return {None}
   */
  renderInstruction() {
    // The user should only be allowed to see the instruction if it hasn't
    // already submmitted the draft. We want to reduce variability in
    // our experiment.
    if (this.state.seenEditor == false) {
      this.setState({showEditor: false, showInstruction: true,
                     showRevisionPrompt: false, showRevision: false});
    }

  }

  /**
   * Render editor when user clicks
   * that she has read the instruction
   * @return {None}
   */
  renderEditor() {
    // Do not let user change text when it has already been
    // submitted. The user might change the draft Duration
    // variable which would give us wrong data. Therefore
    // restrict the access to the editor if seen once.
    if (this.state.seenEditor == false) {
      // Only render editor if the instruction has been read
      if (this.state.seenInstruction) {
        // Display editor by state change
        this.setState({showEditor: true, showInstruction: false,
                       showRevisionPrompt: false, showRevision: false});
      }
    }
  }

  /**
   * Render revision prompt
   * @return {undefined}
   */
  renderRevisionPrompt() {
    // Only render revision prompt if instruction has been read
    // and text has been written
    if (this.state.seenInstruction && this.state.seenEditor) {
      this.setState({showEditor: false, showInstruction: false,
                     showRevisionPrompt: true, showRevision: false});
    }
  }

  /**
   * Render accuacy statement for the draft
   */
  renderAccuracyDraft() {
    if (this.state.seenInstruction && this.state.seenEditor &&
        this.state.seenRevisionPrompt) {
      this.setState({showEditor: false, showInstruction: false,
                     showRevisionPrompt: false, showAccuracyDraft: true});
    }
  }

  /**
   * Render revision
   * @return {undefined}
   */
  renderRevision() {
    // Only render revision prompt if instruction has been read
    // and text has been written and revision prompt has been read
    if (this.state.seenInstruction && this.state.seenEditor &&
        this.state.seenRevisionPrompt) {
      this.setState({showEditor: false, showInstruction: false,
                     showRevisionPrompt: false, showRevision: true});
    }
  }

  /**
   * When user clicks the instruction we
   * want to know that and only display
   * the revisionprompt or the revision if
   * the instruction has been read
   * @return {undefined}
   */
  userClickedInstruction() {
    // Only update the data if user has not already
    // seen the instruction
    if (this.state.seenInstruction == false) {
      this.setState({seenInstruction: true,
                     // Set draftTime to zero
                     durationDraft: new Date()}, () => {
        this.renderEditor();
      })
    }
  }

  /**
   * When user clicks the instruction for the
   * revision prompt allow user to use the
   * revision prompt tab
   * @return {undefined}
   */
  userClickedRevisionPrompt() {
    this.setState({seenRevisionPrompt: true,
                   // Set time for revision
                   durationRevision: new Date()}, () => {
      this.renderAccuracyDraft();
    })
  }

  /**
   * Analyze Text of draft.
   * The draft is the first text before the subject
   * can revise her text.
   */
  analyzeText() {
    var self = this;

    // Set state variables
    this.setState({showEditor: false, showInstruction: false,
                   showCognitiveLoadDraft: true,
                   showRevisionPrompt: false, showRevision: false,
                   draftAnalyzed: null,
                   durationDraft: (new Date() - this.state.durationDraft) / 1000,
                   draftPlainText: getPlainText(this.state.draftText)}, () => {
      // Analyze Text from server
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
        // Set state of revisionText according to measurement
        if (self.state.user.next_measure == 'control-group' || self.state.user.next_measure == 'cmap') {
          self.setState({revisionText: self.state.draftText});
        } else {
          self.setState({revisionText: data['html_string']});
        }

        self.setState({draftAnalyzed: data, seenEditor: true});
      });
    });
  }

  /**
   * Update Cognitive load draft items
   */
  updateCognitiveLoadDraft(data) {
    this.setState({cognitiveLoadDraft: data,
                   showCognitiveLoadDraft: false,
                   showRevisionPrompt: true});
  }

  /**
   * Update Cognitive load middle items
   */
  updateCognitiveLoadMiddle(data) {
    this.setState({'cognitiveLoadMiddle': data});
  }

  /**
   * Update Cognitive load draft items
   */
  updateCognitiveLoadRevision(data) {
    var self = this;

    console.log(data);

    // Update state and send data to server
    this.setState({cognitiveLoadRevision: data,
                   showCognitiveLoadRevision: false});
  }

  /**
   * Update the data for the accuracy draft
   */
  updateAccuracyDraft(data) {
    // Update state and send data to server
    this.setState({accuracyDraftLocal: data['accuracyLocal'],
                   accuracyDraftGlobal: data['accuracyGlobal'],
                   cognitiveloadUnderstandabilityDraft: data['cognitiveloadUnderstandabilityDraft'],
                   showAccuracyDraft: false,
                   showRevision: true});
  }

  /**
   * Analyze Text
   */
  analyzeRevision() {
    var self = this;

    // Show revision questionnaire
    self.setState({showEditor: false, showInstruction: false,
            showRevisionPrompt: false, showRevision: false,
            showCognitiveLoadRevision: true});

    // Set state variables
    this.setState({durationRevision: (new Date() - this.state.durationRevision) / 1000,
                   revisionPlainText: getPlainText(this.state.revisionText)}, () => {
      // Analyze Text from server
      fetch(this.urls.textanalyzer + this.experiment_id, {
        method: 'POST',
        credentials: 'same-origin',
        body: JSON.stringify({
          text: self.state.revisionPlainText
        }),
        headers: new Headers({
          'Content-Type': 'application/json'
        })
      }).then((response) => {
        return response.json();
      }).catch((error) => {
        console.log(error);
      }).then((data) => {
        self.setState({'revisionAnalyzed': data});
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

  /**
   * Store text from revision
   */
  updateRevision(text) {
    this.setState({'revisionText': text});

    // Store text in local storage
    if (typeof(Storage) !== "undefined") {
      localStorage.setItem('textrevision', text);
    }
  }

  componentDidUpdate(prevProps, prevState) {

    if (prevProps.revisionAnalyzed !== this.state.revisionAnalyzed &&
        this.state.cognitiveLoadRevision != null) {
      // Send data to server after cognitive load
      // revision data has been stored
      let dataToSend = {
          // Draft
          'pre_text': this.state.draftPlainText,
          'pre_page_duration': this.state.durationDraft,
          'pre_num_sentences': this.state.draftAnalyzed.numSentences,
          'pre_num_clusters': this.state.draftAnalyzed.numCluster,
          'pre_num_coherent_sentences': this.state.draftAnalyzed.cohSentences,
          'pre_num_non_coherent_sentences': this.state.draftAnalyzed.cohNotSentences,
          'pre_num_concepts': this.state.draftAnalyzed.numConcepts,
          'pre_local_cohesion': this.state.draftAnalyzed['local cohesion'],
          // Accuracy statements
          'accuracy_draft_local': this.state.accuracyDraftLocal,
          'accuracy_draft_global': this.state.accuracyDraftGlobal,
          'accuracy_revision_local': this.state.cognitiveLoadRevision['accuracyRevisionLocal'],
          'accuracy_revision_global': this.state.cognitiveLoadRevision['accuracyRevisionGlobal'],
          // Mental effort ratings
          'cld_draft_question1': this.state.cognitiveLoadDraft['firstQuestion'],
          'cld_draft_question2': this.state.cognitiveLoadDraft['secondQuestion'],
          'cld_draft_question4': this.state.cognitiveloadUnderstandabilityDraft,
          'cld_revision_question1': this.state.cognitiveLoadRevision['firstQuestion'],
          'cld_revision_question2': this.state.cognitiveLoadRevision['secondQuestion'],
          'cld_revision_question4': this.state.cognitiveLoadRevision['fourthQuestion'],
          'cld_middle_question1': this.state.cognitiveLoadMiddle['firstQuestion'],
          'cld_middle_question2': this.state.cognitiveLoadMiddle['secondQuestion'],
          'cld_middle_question4': this.state.cognitiveLoadMiddle['fourthQuestion'],
          // Revision
          'post_text': this.state.revisionPlainText,
          'post_page_duration': this.state.durationRevision,
          'post_num_sentences': this.state.revisionAnalyzed.numSentences,
          'post_num_clusters': this.state.revisionAnalyzed.numCluster,
          'post_num_coherent_sentences': this.state.revisionAnalyzed.cohSentences,
          'post_num_non_coherent_sentences': this.state.revisionAnalyzed.cohNotSentences,
          'post_num_concepts': this.state.revisionAnalyzed.numConcepts,
          'post_local_cohesion': this.state.revisionAnalyzed['local cohesion'],
          // Nuetzlichkeit Fragebogen
          'g06fu1fb': this.state.cognitiveLoadRevision['g06fu1fb'],
          'g8fu3fb': this.state.cognitiveLoadRevision['g8fu3fb'],
          'g07fu2fb': this.state.cognitiveLoadRevision['g07fu2fb'],
          'g10fu5fb': this.state.cognitiveLoadRevision['g10fu5fb'],
          'g9fu4fb': this.state.cognitiveLoadRevision['g9fu4fb'],
          // Emotionale Erregung
          'g11eda5': this.state.cognitiveLoadRevision['g11eda5'],
          'g12eda6': this.state.cognitiveLoadRevision['g12eda6'],
          'g13eda7': this.state.cognitiveLoadRevision['g13eda7'],
          'g14eda8': this.state.cognitiveLoadRevision['g14eda8'],
      };

      // Analyze Text from server
      fetch(this.urls.textdata + this.experiment_id, {
        method: 'POST',
        credentials: 'same-origin',
        body: JSON.stringify(dataToSend),
        headers: new Headers({
          'Content-Type': 'application/json'
        })
      }).then((response) => {
        return response.json();
      }).catch((error) => {
        console.log(error);
      }).then((data) => {
        location.reload();
      });
    }
  }
}

ReactDOM.render(
  <Treatment />,
  document.getElementById('treatment')
);
