import { FundOutModule } from './fund-out.module';

describe('FundOutModule ', () => {
  it('should expect fund out module to be defined', () => {
    const module: FundOutModule = new FundOutModule();
    expect(module).toBeDefined();
  });
});
