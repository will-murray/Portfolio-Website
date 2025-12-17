import { useRef, useState, useEffect } from "react";
import Complex from "./Complex.js";
import * as Conversion from "./Conversion.js";
import { ColoringFunctionManager } from "./ColoringFunctionManager.js";
import { RenderingFunctionManager } from "./RenderingFunctionManager.js";

function FractalCanvas(
  {mode,coloringFunctionManager,redraw,setRedraw, maxSeqLength, renderingFunctionManager}
) {
  // Canvas level params
  const canvasRef = useRef(null);
  const size = 500;
  const span = 1;
  const origin = [0, 0];
  const inc = span / size;
  

  const [cursX,setCursx] = useState(0);
  const [cursY,setCursy] = useState(0);
  //Coloring functions manager - this needs to be shared with the 3D colorwave visualizer

  const linearIndex = (x, y) => y * size * 4 + 4 * x;
  const juliaSet = (x, y) => {

    setCursx(x);
    setCursy(y);
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d", { willReadFrequently: true });
    ctx.clearRect(0, 0, size, size);
    let imgData = ctx.getImageData(0, 0, size, size);

    const click = Conversion.pixelsToComplex(x, y, span, size, origin);
    const c = new Complex(parseFloat(click[0]), parseFloat(click[1]));

    for (let i = origin[0] - span; i < origin[0] + span; i += inc * 2) {
      for (let j = origin[1] - span; j < origin[1] + span; j += inc * 2) {
        let z = new Complex(i, j);
        let result = sequenceLengthIter(z, c, 0);
        let px = Conversion.complexToPixels(i, j, span, size, origin);

        if (result < maxSeqLength) {
          let col = coloringFunctionManager.current.eval(result);
          let a = 255;
          let l1 = linearIndex(px[0], px[1]);
          let l2 = linearIndex(px[0] + 1, px[1]); //upper right
          let l3 = linearIndex(px[0], px[1] + 1); //lower left
          let l4 = linearIndex(px[0] + 1, px[1] + 1); //lower right

          imgData.data[l1] = col[0];
          imgData.data[l1 + 1] = col[1];
          imgData.data[l1 + 2] = col[2];
          imgData.data[l1 + 3] = a;

          imgData.data[l2] = col[0];
          imgData.data[l2 + 1] = col[1];
          imgData.data[l2 + 2] = col[2];
          imgData.data[l2 + 3] = a;

          imgData.data[l3] = col[0];
          imgData.data[l3 + 1] = col[1];
          imgData.data[l3 + 2] = col[2];
          imgData.data[l3 + 3] = a;

          imgData.data[l4] = col[0];
          imgData.data[l4 + 1] = col[1];
          imgData.data[l4 + 2] = col[2];
          imgData.data[l4 + 3] = a;
        }
      }
    }
    ctx.putImageData(imgData, 0, 0);
  };

  const mandelbrotSet = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d", { willReadFrequently: true });
    ctx.clearRect(0, 0, size, size);
    let imgData = ctx.getImageData(0, 0, size, size);

    for (let i = origin[0] - span; i < origin[0] + span; i += inc * 2) {
      for (let j = origin[1] - span; j < origin[1] + span; j += inc * 2) {
        let c = new Complex(i, j);
        let result = sequenceLengthIter(new Complex(0, 0), c, 0);

        if (result !== maxSeqLength) {
          let px = Conversion.complexToPixels(i, j, span, size, origin);
          let k = linearIndex(px[0], px[1]);

          let col = coloringFunctionManager.current.eval(result);

          imgData.data[k] = col[0];
          imgData.data[k + 1] = col[1];
          imgData.data[k + 2] = col[2];
          imgData.data[k + 3] = 255;
        }
      }
    }
    ctx.putImageData(imgData, 10, 10);
  };

  const sequenceLengthIter = (z, c, iteration) => {
    while (z.magnitude() < 2 && iteration < maxSeqLength) {
      renderingFunctionManager.current.eval(z);
  
      z.plus(c);
      iteration++;
    }
    return iteration > maxSeqLength || iteration < 3 ? maxSeqLength : iteration;
  };

  useEffect(() => {
    if (mode === 0) juliaSet(cursX, cursY);
    else mandelbrotSet();
  }, [mode,redraw,cursX,cursY]);

  return (
    <canvas
      ref={canvasRef}
      width={size}
      height={size}
      onMouseMove={(e) => {
        if (mode == 0) {
          const rect = canvasRef.current.getBoundingClientRect();
          let x = e.clientX - rect.left;
          let y = e.clientY - rect.top;
          juliaSet(x, y);
        }
      }}
    />
  );
}


function FractalController({ 
  mode,
  setMode,
  coloringFunctionManager,
  redraw,
  setRedraw,
  maxSeqLength,
  setMaxSeqLength,
  renderingFunctionManager,
}) {

  const changeMode = () => {
    setMode((prev) => (prev + 1) % 2);
  };

  const changeColor = () => {
    coloringFunctionManager.current.next_color();
    setRedraw((prev) => prev + 1);
  }

  const invertColor = () => {
    coloringFunctionManager.current.invert_coloring_function();
    setRedraw((prev) => prev + 1);
  }

  const changeMaxSeqLength = (newSeqLength) => {
    setMaxSeqLength((prev) => prev + 1)
  }

  const changeRenderingFunction = () =>{
    renderingFunctionManager.current.next_state()
    setRedraw((prev) => prev + 1);


  }

  return (
    <div>

      <button onClick={changeMode}>
        Switch to {mode === 0 ? "Mandelbrot" : "Julia"} Set
      </button>
      <button onClick={changeColor}>
        Change Color Function
      </button>
      <button onClick={invertColor}>
        Invert Colors
      </button>
      <button onClick={changeRenderingFunction}>
        Change Rendering Function
      </button>

    </div>
  );
}


function FractalApp() {
  const [mode, setMode] = useState(0);
  const [redraw, setRedraw] = useState(0);
  const coloringFunction = useRef(new ColoringFunctionManager());
  const [maxSeqLength, setMaxSeqLength] = useState(20)
  const renderingFunctionManager = useRef(new RenderingFunctionManager());

  

  return (
    <div>
      <FractalController 
        mode={mode}
        setMode={setMode} 
        redraw={redraw} 
        setRedraw={setRedraw} 
        coloringFunctionManager={coloringFunction} 
        maxSeqLength={maxSeqLength} 
        setMaxSeqLength={setMaxSeqLength}
        renderingFunctionManager={renderingFunctionManager}

      />
      <FractalCanvas
        mode={mode}
        redraw={redraw} 
        coloringFunctionManager={coloringFunction} 
        maxSeqLength={maxSeqLength} 
        renderingFunctionManager={renderingFunctionManager}
      />
    </div>
  );
}

export default FractalApp;
