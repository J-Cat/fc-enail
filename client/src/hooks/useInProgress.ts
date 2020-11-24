import { useSelector } from 'react-redux';
import { useHistory, useLocation } from 'react-router-dom';
import { RootState } from '../store/reducers/rootReducer';
import { Constants } from '../models/constants';

export const useInProgress = (): void => {
  const history = useHistory();
  const location = useLocation();
  const scriptRunning = useSelector<RootState, boolean>(state => state.enail.state?.scriptRunning || false);
  
  if ((scriptRunning) && location.pathname !== Constants.CLIENT_BASE_PATH && !location.pathname.endsWith('/home')) {
    history.push(`${Constants.CLIENT_BASE_PATH}`);
  }
};