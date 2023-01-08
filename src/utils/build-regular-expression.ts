const buildRegularExpression = (aPattern: any = /^\d+$/): RegExp => {
  return new RegExp(aPattern);
};

export default buildRegularExpression;
