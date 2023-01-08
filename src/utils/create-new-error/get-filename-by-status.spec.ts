import getFileNameByStatus from './get-filename-by-status';
import { Constants } from '../../constants';

describe('GetFileNameByStatus', () => {
  it('expected certain function when status matches the dictionary of status from Contansts file ', () => {
    const aStatus: any = 400;
    const fileName: string = getFileNameByStatus(aStatus);
    expect(fileName).toBe(Constants.CREATE_BAD_REQUEST_ERROR);
  });
  it('expected internal error function when aStatus code doesnt match any defined key from dictionary ', () => {
    const fileName: string = getFileNameByStatus('');
    expect(fileName).toBe(Constants.CREATE_INTERNAL_ERROR);
  });
});
