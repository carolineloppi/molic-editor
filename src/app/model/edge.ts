import { NodeType } from './node-type';

export class Edge {
  originNodeId: string;
  originNodeType: NodeType;
  targetNodeId: string;
  targetNodeType: NodeType;
  edgeType: NodeType; // TODO: restringit para simpleNodeType vs EdgeType?
}
