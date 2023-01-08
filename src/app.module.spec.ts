import { AppModule } from './app.module';

describe('AppModule', () => {
  it('should expect app module to be defined', () => {
    const app: AppModule = new AppModule();
    expect(app).toBeDefined();
  });
});
