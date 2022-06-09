import { Edge } from './edge';
import { NodeType } from './node-type';
export class Diagram {
  nodes: Node[];
  edges: Edge[];

  addNode(node: Node): boolean {
    this.nodes.push(node);
    //TODO: validar inserção e retornar boolean corretamente.
    return true;
  }
  addEdge(edge: Edge): boolean {
    this.edges.push(edge);
    return true;
  }

  deleteNode(nodeId: string): boolean {
    return true;
  }
  deleteEdge(edgeId: string): boolean {
    return false;
  }

  saveDiagram(name: string, path: string): boolean {
    return false;
  }
  loadDiagram(name: string, path: string): boolean {
    return false;
  }
  newDiagram(): boolean {
    return false;
  }
}
