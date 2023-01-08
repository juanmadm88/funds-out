import { Constants } from '../../constants';

const getFileNameByStatus = (aStatus: any): string => {
  const fileName: string =
    Constants.statusDictionary[aStatus] || Constants.CREATE_INTERNAL_ERROR;
  return fileName;
};

export default getFileNameByStatus;
