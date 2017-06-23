import {my_urls} from '../components/jsx-strings.jsx';
import Instruction from '../components/instruction.jsx';
import Preloader from '../components/preloader.jsx';

class TreatmentIntegrated extends React.Component {
  constructor(props) {
    super(props);

    var self = this;

    this.state = {
      user: null,
      measurement: null,
      showEditor: false
    };

    // Get urls
    var urls = my_urls;

    // Get hash of experiment
    var path = window.location.href;
    this.experiment_id = path.substr(path.lastIndexOf('/') + 1);

    // Fetch user data
    fetch(urls.user_specific + this.experiment_id, {
      method: 'GET',
      credentials: "same-origin"
    }).then(function(response) {
      return response.json();
    }).then(function(data) {
      self.setState({user: data});
    });

    // Fetch measurement data
    fetch(urls.measurement + this.experiment_id, {
      method: 'GET',
      credentials: 'same-origin'
    }).then(function(response) {
      return response.json();
    }).then(function(data) {
      self.setState({measurement: data[0]});
    });

    // Bind this to methods
    this.renderEditor = this.renderEditor.bind(this);
  }

  render() {
    // Show preloader if state user not shown
    let template = <Preloader />;

    // User data has been fetched
    if (this.state.user != null) {
      // Measurement data has been fetched
      if (this.state.measurement != null) {

        if (this.state.showEditor) {
          template = <h1>Template</h1>;
        } else {
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
    this.setState({showEditor: true});
  }
}

ReactDOM.render(
  <TreatmentIntegrated />,
  document.getElementById('treatment-integrated')
);
