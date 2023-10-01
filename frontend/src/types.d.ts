export interface ICoords {
  x: number;
  y: number;
}
export interface IIncomingMessage {
  type: string;
  payload: ICoords;
}