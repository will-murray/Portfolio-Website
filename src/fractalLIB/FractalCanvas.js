import { useRef, useState, useEffect, use } from "react";
import Complex from "./Complex.js";
import * as Conversion from "./Conversion.js";
import { ColoringFunctionManager } from "./ColoringFunctionManager.js";
import { RenderingFunctionManager } from "./RenderingFunctionManager.js";
import ColorWave from "../colorwave.js";
import { or } from "three/tsl";

function FractalCanvas({
  mode,
  coloringFunctionManager,
  redraw,
  colorChange,
  maxSeqLength,
  keyPressed,
  renderingFunctionManager,
}) {
  // Canvas level params
  const canvasRef = useRef(null);
  const size = 500;
  const span = 0.1;
  let origin = [-1, -0.3];
  const inc = span / size;
  const keyPressStep = 10 // number of pixels to move per key press

  const [cursX, setCursx] = useState(0);
  const [cursY, setCursy] = useState(0);
  //Coloring functions manager - this needs to be shared with the 3D colorwave visualizer

  const linearIndex = (x, y) => y * size * 4 + 4 * x;
  
  const juliaSet = (x, y, writeToCanvas = true) => {
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
    if(writeToCanvas){
      ctx.putImageData(imgData, 0, 0);
    }else{
      return imgData
    }
  };

  const mandelbrotSet = (writeToCanvas = true) => {
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
    if(writeToCanvas){
      ctx.putImageData(imgData, 0, 0);
    }else{
      return imgData
    }

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
  }, [mode, redraw, maxSeqLength, cursX, cursY]);

  useEffect(() =>{
    const ctx = canvasRef.current.getContext("2d", { willReadFrequently: true });
    const initialImgData = ctx.getImageData(0,0,size,size)
    let targetImgData = null
    if (mode === 0){
      targetImgData = juliaSet(cursX, cursY, false); 
    }else{
      targetImgData = mandelbrotSet(false);
    }

    ctx.putImageData(targetImgData,0,0)
      
    const duration = 0.5;
    const start = performance.now();

    const lerpVectors = (v1, v2, alpha) => {
      return {
        x: v1[0] + (v2[0] - v1[0]) * alpha,
        y: v1[1] + (v2[1] - v1[1]) * alpha,
        z: v1[2] + (v2[2] - v1[2]) * alpha
      };
    }

    const animateColorChange = () =>{

      let currentImgData = ctx.getImageData(0,0,size,size)
      const now = performance.now();
      const t = Math.min((now - start) / (duration * 1000), 1);
      for(let i = 0;i<targetImgData.data.length;i +=4){
        let c = lerpVectors(
          [initialImgData.data[i], initialImgData.data[i+1], initialImgData.data[i+2]],
          [targetImgData.data[i], targetImgData.data[i+1], targetImgData.data[i+2]],
          t
          
        )
        currentImgData.data[i] = c.x
        currentImgData.data[i+1] = c.y
        currentImgData.data[i+2] = c.z
        currentImgData.data[i+3] = 255
        
        
        
      }
      ctx.putImageData(currentImgData, 0, 0);

      if(t < 1){
        requestAnimationFrame(animateColorChange)
      }
    
    }

    requestAnimationFrame(animateColorChange)


  },[colorChange])




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
  triggerRedraw,
  colorChange,
  triggerColorChange,
  maxSeqLength,
  setMaxSeqLength,
  renderingFunctionManager,
}) {
  const changeMode = () => {
    setMode((prev) => (prev + 1) % 2);
  };

  const changeColor = () => {
    coloringFunctionManager.current.next_color();
    triggerColorChange(() => colorChange + 1);

  };

  const invertColor = () => {
    coloringFunctionManager.current.invert_coloring_function();
    triggerColorChange(() => colorChange + 1);
  };

  const changeMaxSeqLength = (newSequenceLength) => {
    setMaxSeqLength(newSequenceLength);
  };

  const changeRenderingFunction = () => {
    renderingFunctionManager.current.next_state();
    triggerColorChange(() => colorChange + 1);
  };

  const modeName = () =>{
    if( mode == 0){
      return "Julia"
    }
    return "Mandlebrot"
  }

  return (
    

    <div style={{display:"flex", flexDirection:"row" , justifyContent:"space-between",margin:"20px"}}>
      
      <div >
        <div className="inputbox" style={{display: "flex"}}>
          <button onClick={changeMode} >
            change mode
          </button>
          <p>
            {modeName()} mode
          </p>

        </div>

        <div className="inputbox" style={{display: "flex"}}>
          <button onClick={changeColor}>Change Color Function</button>
          <button onClick={invertColor}>Invert Colors</button>
          <p>
            Color Function: {coloringFunctionManager.current.names[coloringFunctionManager.current.function_state]}
          </p>
        </div>
        
        <div className="inputbox" style={{display: "flex"}}>
        
          <button onClick={changeRenderingFunction}>
            Change Rendering Function
          </button>

        </div>

      </div>

      <div className="inputbox">
        <p>Sequence Depth = {maxSeqLength}</p>
        <input
          type="range"
          min="0"
          max="200"
          value={maxSeqLength}
          onChange={(e) => changeMaxSeqLength(Number(e.target.value))}
          style={{ width: "100%" }}
        />
      </div>

    </div>
  );
}

function FractalApp({keyPressed}) {
  const [redraw, triggerRedraw] = useState(0);
  const [colorChange, triggerColorChange] = useState(0)
  const [mode, setMode] = useState(1);
  const coloringFunction = useRef(new ColoringFunctionManager());
  const [maxSeqLength, setMaxSeqLength] = useState(100);
  const renderingFunctionManager = useRef(new RenderingFunctionManager());


  useEffect(() =>{
    console.log(keyPressed)
  },[keyPressed])
  return (
    <div>
      <FractalController
        mode={mode}
        setMode={setMode}
        redraw={redraw}
        triggerRedraw={triggerRedraw}
        colorChange={colorChange}
        triggerColorChange={triggerColorChange}
        coloringFunctionManager={coloringFunction}
        maxSeqLength={maxSeqLength}
        setMaxSeqLength={setMaxSeqLength}
        renderingFunctionManager={renderingFunctionManager}
      />
      <div  id="theGoodStuff"  style={{backgroundColor:"black", padding:"20px",borderRadius:"30px"}}>
        <div style={{border:"solid",borderColor:"grey", margin:"5px"}}>
          <FractalCanvas 
          mode={mode}
          redraw={redraw}
          triggerRedraw={triggerRedraw}
          colorChange={colorChange}
          triggerColorChange={triggerColorChange}
          coloringFunctionManager={coloringFunction}
          maxSeqLength={maxSeqLength}
          renderingFunctionManager={renderingFunctionManager}
          keyPressed={keyPressed}
          />
        </div >

        <div style={{border:"solid",borderColor:"grey", margin:"5px"}}>
          <ColorWave
            coloringFunctionManager={coloringFunction}
            redraw={redraw}
            colorChange={colorChange}
            maxSeqLength={maxSeqLength}
          />

        </div>
          
        </div>        
        
    </div>
  );
}

export default FractalApp;
