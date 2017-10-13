import Preloader from '../preloader.jsx';
import Integrated from './treatments/integrated.jsx';
import ControlGroup from './treatments/control-group.jsx';
import CMap from './treatments/cmap.jsx';
import Segmented from './treatments/segmented.jsx';
import Massed from './treatments/massed.jsx';

class Revision extends React.Component {
  constructor(props) {
    super(props);
  }

  render() {

    let measurement = <Preloader />;

    // Return correct component according
    // to measurement send from server
    switch (this.props.measurement) {
      case 'integrated':
        measurement = <Integrated draftText={this.props.draftText}
                                         draftAnalyzed={this.props.draftAnalyzed}
                                         updateRevision={this.props.updateRevision}
                                         editorVisible={this.props.editorVisible}
                                         revisionText={this.props.revisionText}
                                         analyzeRevision={this.props.analyzeRevision} />;
        break;
      case 'control-group':
        measurement = <ControlGroup draftText={this.props.draftText}
                                    updateRevision={this.props.updateRevision}
                                    revisionText={this.props.revisionText}
                                    editorVisible={this.props.editorVisible}
                                    analyzeRevision={this.props.analyzeRevision} />;
        break;
      case 'cmap':
        measurement = <CMap draftText={this.props.draftText}
                            updateRevision={this.props.updateRevision}
                            draftAnalyzed={this.props.draftAnalyzed}
                            revisionText={this.props.revisionText}
                            editorVisible={this.props.editorVisible}
                            analyzeRevision={this.props.analyzeRevision} />;
        break;
      case 'cmap-integrated':
        measurement = <CMap draftText={this.props.draftText}
                            updateRevision={this.props.updateRevision}
                            draftAnalyzed={this.props.draftAnalyzed}
                            revisionText={this.props.revisionText}
                            editorVisible={this.props.editorVisible}
                            analyzeRevision={this.props.analyzeRevision} />;
        break;
      case 'segmented':
        measurement = <Segmented draftText={this.props.draftText}
                                 updateRevision={this.props.updateRevision}
                                 draftAnalyzed={this.props.draftAnalyzed}
                                 revisionText={this.props.revisionText}
                                 editorVisible={this.props.editorVisible}
                                 analyzeRevision={this.props.analyzeRevision}
                                 measurement={this.props.measurementDetails}
                                 updateEffortMiddle={this.props.updateEffortMiddle} />;
        break;
      case 'control segmented-massed':
      case 'massed':
        measurement = <Massed draftText={this.props.draftText}
                              updateRevision={this.props.updateRevision}
                              draftAnalyzed={this.props.draftAnalyzed}
                              revisionText={this.props.revisionText}
                              editorVisible={this.props.editorVisible}
                              analyzeRevision={this.props.analyzeRevision}
                              measurement={this.props.measurementDetails}
                              updateEffortMiddle={this.props.updateEffortMiddle}
                              measurement={this.props.measurement} />;
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
