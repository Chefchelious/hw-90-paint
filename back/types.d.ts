import { WebSocket } from 'ws';
export interface IActiveConnections {
  [id: string]: WebSocket;
}

export interface ICoords {
  x: number;
  y: number;
}
export interface IIncomingMessage {
  type: string;
  payload: ICoords;
}