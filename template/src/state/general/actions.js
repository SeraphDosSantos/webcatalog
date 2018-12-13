import {
  UPDATE_IS_DARK_MODE,
  UPDATE_IS_FULL_SCREEN,
} from '../../constants/actions';

export const updateIsFullScreen = isFullScreen => (dispatch) => {
  dispatch({
    type: UPDATE_IS_FULL_SCREEN,
    isFullScreen,
  });
};

export const updateIsDarkMode = isDarkMode => (dispatch) => {
  dispatch({
    type: UPDATE_IS_DARK_MODE,
    isDarkMode,
  });
};
