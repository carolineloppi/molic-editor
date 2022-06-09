import { NodeType } from './node-type';

export class Node {
  id: number;
  positionX: number;
  positionY: number;
  sourceNodesId: number[];
  targetNodesId: number[];
  typeOfNode: NodeType;

  //repositionOnCanvas(newPositionX, newPositionY): boolean {}
}
