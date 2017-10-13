import Preloader from '../../preloader.jsx';
import Instruction from '../instruction.jsx';
import StaticCmap from './static-cmap.jsx';

class Segmented extends React.Component {
  constructor(props) {
    super(props);

    // Bind this to methods
    this.updateRevision = this.updateRevision.bind(this);
    this.returnInnerHTML = this.returnInnerHTML.bind(this);
    this.renderVideo = this.renderVideo.bind(this);

    // Set state
    this.state = {
      showFeedback: true,
      showVideo: false,
      showRevision: false
    };
  }

  render() {

    let content = null;

    if (this.state.showFeedback) {
      content = <StaticCmap
                  draftText={this.props.draftText}
                  draftAnalyzed={this.props.draftAnalyzed}
                  revisionText={this.props.revisionText}
                  editorVisible={this.props.editorVisible}
                  nextRender={this.renderVideo} />;
    } else {
      console.log('showVideo');
      content = <p>Video yeah</p>;
    }

    return (
      <div className="row">
        {content}
      </div>
    )
  }

  /**
   * Render Video
   */
  renderVideo() {
    // Update state after user clicks revision
    this.setState({
      showVideo: true,
      showFeedback: false,
      showRevision: false
    });

    console.log('I clicked');
  }

  /**
   * Return dangerous html to editor
   * @return {dict} html
   */
  returnInnerHTML() {
    return {__html: this.props.draftText}
  }

  // We need to store the revision in a state variable
  // in order to process it afterwards. Otherwise we will
  // lose the changes when the component is mounted again
  updateRevision() {
    this.props.updateRevision(this.textInput.innerHTML);
  }
};

export default Segmented;
