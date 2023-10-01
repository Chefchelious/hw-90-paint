import React, {useEffect, useRef, useState} from 'react';
import {IIncomingMessage, IPixels} from "../../types";
import {COLORS} from "../../constants.ts";

const Canvas = () => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const contextRef = useRef<CanvasRenderingContext2D | null>(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const ws = useRef<WebSocket | null>(null);

  const [color, setColor] = useState('');

  useEffect(() => {
    ws.current = new WebSocket('ws://localhost:8000/paint');

    ws.current.onclose = () => console.log('ws closed');

    const canvas = canvasRef.current;

    if (!canvas) return;

    canvas.width = 600;
    canvas.height = 600;

    const context = canvas.getContext('2d');

    if (!context) return;

    context.lineJoin = 'round';
    context.lineCap = 'round';
    context.strokeStyle = 'pink';
    context.lineWidth = 10;
    contextRef.current = context;

    ws.current.onmessage = (event) => {
      const data = JSON.parse(event.data) as IIncomingMessage;
      const pixelsArr = JSON.parse(event.data) as IPixels;

      if (data && data.payload && data.type === 'NEW_PIXELS') {
        context.lineTo(data.payload.x, data.payload.y);
        context.strokeStyle = data.payload.color;
        context.stroke();
      }

      if(data.type === 'STOP_DRAWING'){
        context.beginPath();
      }

      if (pixelsArr.type === 'ALL_PIXELS') {
        pixelsArr.payload.forEach(pixel => {
          if (pixel.payload) {
            context.lineTo(pixel.payload.x, pixel.payload.y);
            context.strokeStyle = pixel.payload.color;
            context.stroke();
          }
          if (!pixel.payload && pixel.type === 'STOP_DRAWING') {
            context.beginPath();
          }
        });
      }

    };

    return () => {
      ws.current?.close();
    };

  }, []);

  const startDrawing = ({ nativeEvent }: React.MouseEvent<HTMLCanvasElement>) => {
    if (!contextRef.current) return;

    setIsDrawing(true);

    const { offsetX, offsetY } = nativeEvent;
    contextRef.current.beginPath();
    contextRef.current.moveTo(offsetX, offsetY);
  };
  const stopDrawing = () => {
    if (!contextRef.current) return;
    contextRef.current.beginPath();

    if(ws.current){
      ws.current.send(JSON.stringify({
        type:'STOP_DRAWING',
      }))
    }

    setIsDrawing(false);
  };
  const draw = ({ nativeEvent }: React.MouseEvent<HTMLCanvasElement>) => {
    if (!contextRef.current) return;
    if (!isDrawing) return;

    const { offsetX, offsetY } = nativeEvent;

    contextRef.current.lineTo(offsetX, offsetY);
    contextRef.current.strokeStyle = color;
    contextRef.current.stroke();

    nativeEvent.preventDefault();

    if (!ws.current) return;

    ws.current.send(JSON.stringify({
      type: 'SEND_PIXELS',
      payload: {
        x: offsetX,
        y: offsetY,
        color
      }
    }));
  };
  const handleColorClick = (color: string) => {
    setColor(color);
  };

  return (
    <div>
      <div>
        {COLORS.map((color, idx) => (
          <button
            key={idx}
            className="color-input"
            onClick={() => handleColorClick(color)}
            style={{backgroundColor: color, border: '1px solid black'}}
          />
        ))}

      </div>
      <canvas
        ref={canvasRef}
        style={{border: '1px solid black'}}
        onMouseDown={startDrawing}
        onMouseUp={stopDrawing}
        onMouseMove={draw}
        onMouseLeave={stopDrawing}
      />
    </div>
  );
};

export default Canvas;