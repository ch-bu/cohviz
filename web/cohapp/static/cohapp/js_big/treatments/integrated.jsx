import {getInstruction, my_urls, preloader} from '../components/jsx-strings.jsx';
import Instruction from '../components/instruction.jsx';

class TreatmentIntegrated extends React.Component {
  constructor(props) {
    super(props);

    var self = this;

    this.state = {
      user: null,
      measurement: null
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

  }

  render() {
    // Show preloader if state user not shown
    let template = preloader;

    // User data has been fetched
    if (this.state.user != null) {
      // Measurement data has been fetched
      if (this.state.measurement != null) {
        // Render instruction for current measurement
        template = <Instruction instruction_text={this.state.measurement.instruction} />
      }
    }

    return (
      <div>
         {template}
      </div>
    );
  }


}

ReactDOM.render(
  <TreatmentIntegrated />,
  document.getElementById('treatment-integrated')
);
