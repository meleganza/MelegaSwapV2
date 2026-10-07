
import '@pancakeswap/localization';
import 'react-router-dom';
import '@pancakeswap/uikit';
import Container from 'components/Layout/Container'
import './components/Hero';
import CurrentIfo from './CurrentIfo'
import './PastIfo';

const Ilos = () => {
  // const { path, url, isExact } = useRouteMatch()
  return (
    <>
      <Container>
        {/* <Route exact path={`${path}`}> */}
          <CurrentIfo />
        {/* </Route> */}
      </Container>
    </>
  )
}

export default Ilos
