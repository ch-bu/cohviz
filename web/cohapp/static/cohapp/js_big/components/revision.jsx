import Preloader from './preloader.jsx';
import MeasureIntegrated from './measure-integrated.jsx';

class Revision extends React.Component {
  constructor(props) {
    super(props);
  }

  render() {

    let measurement = <Preloader />;

    // Return correct component according
    // to measurement send from server
    switch (this.props.measurement) {
      case 'Integriert':
        measurement = <MeasureIntegrated draftText={this.props.draftText} />;
        break;
      default:
        <Preloader />;
    }

    return (
      <div>
        {measurement}
      </div>
    )
  }
};

export default Revision;
