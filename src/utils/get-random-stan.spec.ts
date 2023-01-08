import getRandomStan from './get-random-stan';

describe('getRandomStan', () => {
  it('expect a number to be returned', () => {
    const randomNumber: number = getRandomStan();
    expect(randomNumber).toBeDefined();
  });
});
