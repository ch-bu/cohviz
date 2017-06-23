class Preloader extends React.Component {
  constructor(props) {
    super(props);
  }

  render() {
    return (
      <div className="row" id="preloader">
        <div className="progress s4 offset-s4 col">
            <div className="indeterminate"></div>
        </div>
      </div>
    )
  }
};


export default Preloader;
