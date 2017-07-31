import Preloader from '../preloader.jsx';
import Integrated from './treatments/integrated.jsx';
import ControlGroup from './treatments/control-group.jsx';
import CMap from './treatments/cmap.jsx';

class Revision extends React.Component {
  constructor(props) {
    super(props);

    console.log(this.props.measurement);
  }

  render() {

    let measurement = <Preloader />;

    // Return correct component according
    // to measurement send from server
    switch (this.props.measurement) {
      case 'Integriert':
        measurement = <Integrated draftText={this.props.draftText}
                                         draftAnalyzed={this.props.draftAnalyzed}
                                         updateRevision={this.props.updateRevision}
                                         editorVisible={this.props.editorVisible}
                                         revisionText={this.props.revisionText}
                                         analyzeRevision={this.props.analyzeRevision} />;
        break;
      case 'control group':
        measurement = <ControlGroup draftText={this.props.draftText}
                                    updateRevision={this.props.updateRevision}
                                    revisionText={this.props.revisionText}
                                    editorVisible={this.props.editorVisible}
                                    analyzeRevision={this.props.analyzeRevision} />;
        break;
      case 'Cmap':
        measurement = <CMap draftText={this.props.draftText}
                            updateRevision={this.props.updateRevision}
                            draftAnalyzed={this.props.draftAnalyzed}
                            revisionText={this.props.revisionText}
                            editorVisible={this.props.editorVisible}
                            analyzeRevision={this.props.analyzeRevision} />;
        break;
      case 'Cmap Integrated':
        measurement = <CMap draftText={this.props.draftText}
                            updateRevision={this.props.updateRevision}
                            draftAnalyzed={this.props.draftAnalyzed}
                            revisionText={this.props.revisionText}
                            editorVisible={this.props.editorVisible}
                            analyzeRevision={this.props.analyzeRevision} />;
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
