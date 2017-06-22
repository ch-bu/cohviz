import {getInstruction} from '../components/jsx-strings.jsx';

class TreatmentIntegrated extends React.Component {
  render() {
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
