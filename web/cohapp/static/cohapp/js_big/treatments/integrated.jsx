import {getInstruction, my_urls} from '../components/jsx-strings.jsx';

class TreatmentIntegrated extends React.Component {
  constructor(props) {
    super(props);

    // Set initial state
    this.state = {
      data: null
    };

    var self = this;

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
      self.setState({data: data});
    });

  }

  render() {
    console.log(this.state);
    // Get jsx string of instruction
    let instruction = getInstruction();

    return (
      <div>
         {instruction}
      </div>
      );
  }
}

ReactDOM.render(
  <TreatmentIntegrated />,
  document.getElementById('treatment-integrated')
);
