const getRandomStan = (): number => {
  const number = 100000 + Math.random() * 900000;
  return Math.floor(number);
};

export default getRandomStan;
