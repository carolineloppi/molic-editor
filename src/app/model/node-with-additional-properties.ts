export class NodeWithAdditionalProperties extends Node {
  topic: string;
  dialogs: string;

  addProperties(topic: string, dialogs: string) {
    this.topic = topic;
    this.dialogs = dialogs;
  }
}
