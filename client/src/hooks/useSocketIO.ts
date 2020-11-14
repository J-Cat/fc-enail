import { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { io } from 'socket.io-client';
import { Constants } from '../models/constants';
import { setState } from '../store/reducers/enailReducer';
import { updateCurrentProfile } from '../store/reducers/profileReducer';
import { RootState } from '../store/reducers/rootReducer';
import { IE5ccState } from '../store/state/IEnailState';
import { IProfile } from '../store/state/IProfileState';

export const useSocketIO = () => {
  const token = useSelector((state: RootState) => state.auth.token);
  const dispatch = useDispatch();

  useEffect(() => {
    const socket = io(Constants.SOCKET_URL, { auth: { token }});
    socket.on('E5CC', (data: IE5ccState) => {
      dispatch(setState(data))
    });

    socket.on('PID', (profile: IProfile) => {
      dispatch(updateCurrentProfile(profile));
    });

    return () => { 
      socket.disconnect();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
}
