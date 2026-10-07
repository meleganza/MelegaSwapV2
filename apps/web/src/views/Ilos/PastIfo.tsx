
import { ifosConfig } from 'config/constants'
import 'config/constants/types';
import IfoLayout from './components/IfoLayout'
import './components/IfoCardV3Data';

ifosConfig.filter((ifo) => !ifo.isActive);

const PastIfo = () => {
  return (
    <IfoLayout/>
  )
}

export default PastIfo
