import styled from 'styled-components';
import React from 'react';

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
      list-style-type: none;

      li {
        list-style-type: none;
        font-size: 1.3rem;
        margin-bottom: 10px;
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

class Research extends React.Component {
  constructor(props) {
    super(props);
  }

  render() {
    return (
      <Container>
        <div className="textcontainer">
          <h2>Research</h2>
          <p>In the past years we published numerous experiments that investigated the effectiveness of CohViz.</p>

        <ul>
          <li>Lachner, A., & Neuburg, C. (2019). Learning by writing explanations: computer-based feedback about the explanatory cohesion enhances students’ transfer. <i>Instructional Science</i>, 47(1), 19-37. https://dx.doi.org/10.1007/s11251-018-9470-4</li>
          <li>Lachner, A., Backfisch, I., & Nückles, M. (2018). Does the accuracy matter? Accurate concept map feedback helps students improve the cohesion of their explanations.<i>Educational Technology Research and Development</i>, 66, 1051-1067. https://dx.doi.org/10.1007/s11423-018-9571-4 </li>
          <li>Lachner, A., & Schurer, T. (2018). Effects of the specificity and the format of external representations on students’ revisions of fictitious others’ texts. <i>Journal of Writing Research</i>, 9, 333-351. https://dx.doi.org/10.17239/jowr-2018.09.03.04 </li>
          <li>Lachner, A., Burkhart, C., & Nückles, M. (2017). Mind the gap! Automated concept map feedback supports students in writing cohesive explanations. <i>Journal of Experimental Psychology: Applied</i>, 23, 29-46. https://dx.doi.org/10.1037/xap0000111 </li>
          <li>Lachner, A., Burkhart, C., & Nückles, M. (2017). Formative computer-based feedback in the university classroom: Specific concept maps scaffold students’ writing. <i>Computers in Human Behavior</i>, 72, 459-469. https://dx.doi.org/10.1016/j.chb.2017.03.008 </li>
        </ul>
        </div>
      </Container>
    )
  }
}

export default Research;
