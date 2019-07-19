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

class About extends React.Component {
  constructor(props) {
    super(props);
  }

  render() {
    return (
      <Container>
        <div className="textcontainer">
          <h2>About</h2>

          <p>CohViz is a web app which provides students with automated concept-map like representations of their explanatory texts. Nodes within the concept map show the concepts in the explanation, and links show the structural relationships between these concepts.</p>
          
          <p>The concept maps can be used to inspect one’s text with regard to its local and global cohesion. Local cohesion refers to textual relations that make connections between adjacent sentences explicit. Local cohesion is achieved either by considering relatively simple syntactic cohesive ties, such as connectives (e.g., therefore, and, because), or by considering more advanced cohesive ties like reiterating arguments. Global cohesion refers to the overall text organization, so that the key relations of the central ideas are made explicit. This can particularly be established by structuring the relevant concepts of the text in a way that is in accordance with the genre-typical rhetorical structure of the text.</p>
            
          <p>Regarding local cohesion, the concept map depicts students’ local cohesion gaps as isolated fragments within the concept maps. With regard to the global cohesion, the concept map depicts the structural relationships between the concepts of the explanation. As such, the visualization of one’s own explanation may encourage the individual writer to evaluate her or his global structure of the text (e.g., missing concepts or relations), and thus facilitate identifying problems in global cohesion.</p>
        </div>
      </Container>
    )
  }
}

export default About;


