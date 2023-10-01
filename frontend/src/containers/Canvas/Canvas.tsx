import React, {useEffect, useRef, useState} from 'react';

const Canvas = () => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const contextRef = useRef<CanvasRenderingContext2D | null>(null);
  const [isDrawing, setIsDrawing] = useState(false);

  useEffect(() => {

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

    setIsDrawing(false);
  };
  const draw = ({ nativeEvent }: React.MouseEvent<HTMLCanvasElement>) => {
    if (!contextRef.current) return;
    if (!isDrawing) return;

    const { offsetX, offsetY } = nativeEvent;

    contextRef.current.lineTo(offsetX, offsetY);
    contextRef.current.stroke();

    nativeEvent.preventDefault();
  };

  return (
    <div>
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