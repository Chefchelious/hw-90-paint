export interface ICoords {
  x: number;
  y: number;
  color: string;
}
export interface IIncomingMessage {
  type: string;
  payload: ICoords;
}