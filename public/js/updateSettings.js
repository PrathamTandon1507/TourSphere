import axios from 'axios';
import { showAlert } from './alerts';

//type is either password or data
export const updateSettings = async (data, type) => {
  try {
    const url =
      type === 'password'
        ? '/api/v1/users/updatePassword'
        : '/api/v1/users/updateMe';

    const result = await axios({
      method: 'PATCH',
      url,
      data,
    });

    console.log(result.data);
    if (result.data.status === 'success') {
      showAlert('success', `Updated ${type.toUpperCase} successfuly`);
      window.setTimeout(() => {
        location.assign('/');
      }, 1500);
    }

    console.log(result);
  } catch (err) {
    showAlert('error', err.response.data.message);
  }
};
