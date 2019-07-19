import styled from 'styled-components';

const Container = styled.div`
  background-color: rgb(249, 249, 249);
  min-height: 80vh;
  width: 100%;
  font-family: "Open Sans";
  box-shadow: 0 2px 4px 0 rgba(17, 22, 26, 0.16), 0 2px 4px 0 rgba(17, 22, 26, 0.08), 0 4px 8px 0 rgba(17, 22, 26, 0.08);

  .textcontainer {
    margin: 0 auto;
    width: 70%;
    padding-top: 5vh;

    h2 {
      text-align: center;
      font-family: "Open Sans";
    }

    p {
      font-size: 1.3rem;
    }
    

    ul {
      list-style-position: inside;
      list-style-type: square;

      li {
        list-style-type: square;
      }
    }

    a {
      font-size: 1.3rem;
      color: rgba(0, 0, 0, 0.87);
      border-bottom: 2px solid #5773c1;

      &:hover {
        background-color: #ebeef6;
      }
    }
  }
`;

class Contact extends React.Component {
  constructor(props) {
    super(props);
  }

  render() {
    return (
      <Container>
        <div className="textcontainer">
          <h2>Contact</h2>
          <p>If you are interested in using CohViz and have further questions,
          feel free to contact us. We are glad to hear from you.</p>

          <ul>
            <li><a href="https://www.iwm-tuebingen.de/www/de/personen/ma.html?uid=alachner">Andreas Lachner</a></li>
            <li><a href="https://www.ezw.uni-freiburg.de/institut/nueckles">Matthias Nückles</a></li>
            <li><a href="https://www.ezw.uni-freiburg.de/institut/mitarbeiter/burkhart">Christian Burkhart</a></li>
          </ul>

          {/* <form action="https://formspree.io/christian.burkhart@ezw.uni-freiburg.de" method="POST">
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
          </form> */}
        </div>
      </Container>
    )
  }
}

export default Contact;
