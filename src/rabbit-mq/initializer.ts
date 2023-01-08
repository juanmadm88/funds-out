import { rabbitConnection } from 'fif-payments-module-rabbit';
import { Constants } from '../constants';
// import { ILogger, LoggerService } from '../logger/logger.service';
//TODO: ARREGLAR EL TEMA DEL LOGGER
export class InitProducer {
  // private static logger: ILogger = new LoggerService(Constants.INIT_PRODUCER.NAME);
  private static async connect(aRabbitConfig: any): Promise<any> {
    try {
      await rabbitConnection.getConnection(aRabbitConfig, true);
    } catch (error) {
      throw error;
    }
  }
  public static async init(aRabbitConfig: any): Promise<any> {
    const methodName: string = Constants.INIT_PRODUCER.INIT_METHOD_NAME;
    const processTransactionExchange = aRabbitConfig.exchanges[0].name;
    const transactionQueues = [aRabbitConfig.queues[0]];
    const transactionQueuesToBind = [aRabbitConfig.queues[0]];
    try {
      await this.connect(aRabbitConfig.config);
      await rabbitConnection.createChannels(aRabbitConfig.channel);
      console.log('\x1b[32m channels created');

      await rabbitConnection.createExchanges(aRabbitConfig.exchanges);
      console.log('\x1b[32m exchanges created');

      await rabbitConnection.createQueues(
        aRabbitConfig.channel.transaction.id,
        transactionQueues
      );
      console.log('\x1b[32m queues created');

      // bind exchange with queue transaction
      await rabbitConnection.bind(
        aRabbitConfig.channel.transaction.id,
        transactionQueuesToBind,
        processTransactionExchange
      );
      console.log('\x1b[32m bind exchanges with queues');
      console.log('\x1b[32m rabbit was connected sucessfull');
      console.log(`\x1b[32m channels=${JSON.stringify(aRabbitConfig.channel)}`);
      console.log(
        `\x1b[32m exchanges=${JSON.stringify(aRabbitConfig.exchanges)}`
      );
      console.log(`\x1b[32m queues=${JSON.stringify(aRabbitConfig.queues)}`);
      // this.logger.info(methodName, 'rabbit was connected sucessfull');
    } catch (error) {
      // this.logger.error(methodName, 'Error initializating rabbit ', error);
      throw error;
    }
  }
}
