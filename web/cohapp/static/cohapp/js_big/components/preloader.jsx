class Preloader extends React.Component {
  constructor(props) {
    super(props);

  }

  render() {
    return (
      <div className="row">
        <div className="progress">
            <div className="indeterminate"></div>
        </div>
      </div>
    )
  }
};


export default Preloader;
