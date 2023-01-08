import buildRegularExpression from './build-regular-expression';

describe('buildRegularExpression', () => {
  it('should expect default regular expression /^d+$/ being created, when argument is not provided', () => {
    const regularExpression: RegExp = buildRegularExpression();
    expect(regularExpression).toBeDefined();
    expect(regularExpression).toStrictEqual(/^\d+$/);
  });
  it('should expect specific regular expression being created, when argument is provided', () => {
    const regularExpression: RegExp = buildRegularExpression('[0-9]');
    expect(regularExpression).toBeDefined();
    expect(regularExpression).toStrictEqual(new RegExp('[0-9]'));
  });
});
