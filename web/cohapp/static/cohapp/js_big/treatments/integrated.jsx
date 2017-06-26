import {my_urls} from '../components/jsx-strings.jsx';
import Instruction from '../components/instruction.jsx';
import Preloader from '../components/preloader.jsx';
import Editor from '../components/editor.jsx';

class TreatmentIntegrated extends React.Component {
  constructor(props) {
    super(props);

    var self = this;

    // Setup state variables
    this.state = {
      user: null,
      measurement: null,
      showEditor: false,
      showInstruction: false,
      durationDraft: null,
      draftAnalyzed: null
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
    this.renderEditor = this.renderEditor.bind(this);
    this.analyzeText = this.analyzeText.bind(this);
  }

  render() {
    // Show preloader if state user not shown
    let template = <Preloader />;

    // User data has been fetched
    if (this.state.user != null) {
      // Measurement data has been fetched
      if (this.state.measurement != null) {
        // Instruction has been read
        if (this.state.showEditor) {
          template = <Editor analyzeText={this.analyzeText} />;
        } else if (this.state.showInstruction) {
          // Render instruction for current measurement
          template = <Instruction
              instruction_text={this.state.measurement.instruction}
              renderEditor={this.renderEditor} />
        }
      }
    }

    return (
      <div>
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
    this.setState({showEditor: true}, () => {
        // Start timer for draft
        this.setState({durationDraft: new Date()});
    });
  }

  /**
   * Analyze Text
   */
  analyzeText() {
    var self = this;

    // Save time for draft
    this.setState({durationDraft: (new Date() - this.state.durationDraft) / 1000});

    // Analyze Text
    fetch(this.urls.textanalyzer + this.experiment_id, {
      method: 'POST',
      credentials: 'same-origin',
      body: JSON.stringify({
        text: 'Michael ist ein Haus. Im Haus gibt es Schränke.'
      }),
      headers: new Headers({
        'Content-Type': 'application/json'
      })
    }).then((response) => {
      return response.json();
    }).catch((error) => {
      console.log(error);
    }).then((data) => {
      self.setState({'draftAnalyzed': data});
    });
  }
}

ReactDOM.render(
  <TreatmentIntegrated />,
  document.getElementById('treatment-integrated')
);
