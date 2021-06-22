import { SLACK_EVENT, ERROR_EVENT } from "./index";
import Events from "events";
import logger from "../../../logger";
// import { mikroProducer, KafkaConfig } from "mikro-kafka-client";

const mikroKafkaClient = require("mikro-kafka-client");
const mikroProducer = mikroKafkaClient.mikroProducer;
const KafkaConfig = mikroKafkaClient.kafkaConfig;

export type NotificationModel = {
  title: string,
  channel: string,
  message: any,
  type: string,
};

const Emitter = Events.EventEmitter;
const emitter = new Emitter();

emitter.on(SLACK_EVENT, function (model: NotificationModel) {
  const config: KafkaConfig = {
    hostname: process.env.KAFKA_HOST,
    username: process.env.KAFKA_USERNAME,
    password: process.env.KAFKA_PASSWORD,
    topic: process.env.KAFKA_NOTIFICATION_TOPIC,
    groupId: process.env.KAFKA_CLUSTER_ID,
  };
  model.type = "SLACK";

  mikroProducer(
    config,
    model,
    `${model.channel}${new Date().getTime()}`,
    function (response) {
      logger.info(
        `mikro multi-outlet sign up notification sent to [${
          model.channel
        }] with result [${JSON.stringify(response)}]`
      );
    }
  );
});

emitter.on(ERROR_EVENT, function (value) {
  logger.error(`event failed with error ${JSON.stringify(value)}`);
});

export default emitter;
