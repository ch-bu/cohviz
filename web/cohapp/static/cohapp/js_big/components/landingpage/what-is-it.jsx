class WhatIsIt extends React.Component {
  constructor(props) {
    super(props);
  }

  render() {
    return (
      <div id="whatisit">
        <div className="whatisit-container">
          <div className="whatisit-general">
            <h1>What is it?</h1>

            <p>CohViz is an empirically tested web-app
            that makes use of concepts maps to visualize text cohesion.
            Nodes represent concepts of the text and edges represent
            their corresponding grammatical relationship (e.g., subject - object).</p>

            <ul>
              <li>Lachner, A., Burkhart, C., & Nückles, M. (2017). Mind the gap! Automated concept map
              feedback supports students in writing cohesive explanations. Journal of Experimental Psychology:
              Applied, 23(1), 29-46.</li>
              <li>Lachner, A., Burkhart, C., & Nückles, M. (2017). Formative computer-based feedback in
              the university classroom: Specific concept maps scaffold students\' writing.
              Computers in Human Behavior, 72, 459-469.</li>
              <li>Lachner, A., Backfisch, I., & Nückles, M. (2017). Does the accuracy matter?
              Accurate concept map feedback helps students improve the
              cohesion of their explanations. Educational Technology
              Research and Development, 1-17.</li>
            </ul>
          </div>

          <div class="whatisit-contact">
            <h2>Contact</h2>
            <p>If you are interested in using CohVis and have further questions,
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
      </div>
    )
  }
}

export default WhatIsIt;
