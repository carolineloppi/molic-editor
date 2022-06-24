import { EdgeTypeEnum } from './edge-type';

export class Edge {
  id: number;
  originNodeId: number;
  targetNodeId: number;
  edgeType: EdgeTypeEnum;
  utterance: string;
}
