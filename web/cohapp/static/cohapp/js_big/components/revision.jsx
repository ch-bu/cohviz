import Preloader from './preloader.jsx';
import MeasureIntegrated from './treatments/measure-integrated.jsx';

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
        measurement = <MeasureIntegrated draftText={this.props.draftText}
                                         draftAnalyzed={this.props.draftAnalyzed}
                                         updateRevision={this.props.updateRevision}
                                         editorVisible={this.props.editorVisible}
                                         revisionText={this.props.revisionText} />;
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
