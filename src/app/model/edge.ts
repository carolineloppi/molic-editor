import { EdgeType } from './edge-type';

export class Edge {
  id: number;
  originNodeId: number;
  targetNodeId: number;
  edgeType: EdgeType;
  utterance: string;
}
