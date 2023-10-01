import express from 'express';
import expressWs from 'express-ws';
import cors from 'cors';
import {randomUUID} from "crypto";
import {IActiveConnections, IIncomingMessage} from "./types";

const app = express();
expressWs(app);

const port = 8000;

app.use(cors());

const router = express.Router();

const activeConnections: IActiveConnections = {};

router.ws('/paint', (ws, _) => {
  const id = randomUUID();

  activeConnections[id] = ws;

  ws.on('message', (msg) => {
    const messageData = JSON.parse((msg.toString())) as IIncomingMessage;

    switch (messageData.type) {
      case 'SEND_PIXELS' :
        Object.keys(activeConnections).forEach((key) => {
          const conn = activeConnections[key];

          if (key !== id) {
            conn.send(JSON.stringify({
              type: 'NEW_PIXELS',
              payload: {
                x: messageData.payload.x,
                y: messageData.payload.y,
                color: messageData.payload.color
              }
            }));
          }
        });
        break;

      case 'STOP_DRAWING':
        Object.keys(activeConnections).forEach(connId => {
          const conn = activeConnections[connId];
          if(connId !== id){
            conn.send(JSON.stringify({
              type: 'STOP_DRAWING',
            }));
          }
        });
        break;

      default:
        console.log('Unknown message type', messageData.type);
    }
  });

  ws.on('close', () => {
    delete activeConnections[id];
    console.log('client disconnected id=', id);
  });
});

app.use(router);

app.listen(port, () => {
  console.log(`Server started on ${port} port!`);
});