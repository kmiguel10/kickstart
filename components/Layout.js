import react from "react";
import Header from "./Header";
import { Container } from "semantic-ui-react";

const Layout = (props) => {
  //Header
  //wrap components inside header and footer
  //Footer
  return (
    <Container>
      <Header />
      {props.children}
    </Container>
  );
};

export default Layout;
