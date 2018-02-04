class Contact extends React.Component {
  constructor(props) {
    super(props);
  }

  render() {
    return (
      <div id="contact">
        <div className="contact-wrapper">
          <h2>Contact</h2>
          <p>If you are interested in using CohViz and have further questions,
          feel free to contact us. We are glad to hear from you.</p>

          <form action="https://formspree.io/christian.burkhart@ezw.uni-freiburg.de" method="POST">
            <div>
              <div >
                <input name="name" type="text" placeholder="Your name" data-cip-id="cIPJQ342845639"></input>
              </div>
              <div >
                <input type="email" name="email" placeholder="Your e-mail" data-cip-id="cIPJQ342845640"></input>
              </div>
              <div >
                <textarea name="nachricht" rows="4" cols="10" placeholder="Your message"></textarea>
              </div>
              <div>
                <button class="waves-effect waves-light btn" type="submit">Send</button>
              </div>
            </div>
          </form>
        </div>
      </div>
    )
  }
}

export default Contact;
