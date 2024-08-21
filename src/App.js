import { useEffect } from "react";
import { Canvas, useFrame, useGraph } from "@react-three/fiber";
import { Color, Matrix4, Euler } from "three";
import { useGLTF } from "@react-three/drei";
import { FilesetResolver, FaceLandmarker } from "@mediapipe/tasks-vision";

// import model from "../src/model/uploads_files_2594037_F026.glb";

import './App.css';

let video;
let faceLandmarker;
let lastVideoTime = -1;
let headMesh;
let rotation;
let matrix;
let blendShapes;

function App() {

  async function setup() {

    const vision = await FilesetResolver.forVisionTasks("https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@latest/wasm");
    faceLandmarker = await FaceLandmarker.createFromOptions(
      vision,
      {
        baseOptions: {
          modelAssetPath: "https://storage.googleapis.com/mediapipe-models/face_landmarker/face_landmarker/float16/1/face_landmarker.task",
          delegate: "GPU"
        },
        outputFaceBlendshapes: true,
        outputFacialTransformationMatrixes: true,
        runningMode: "VIDEO"
      });

    video = document.getElementById("video");
    navigator.mediaDevices.getUserMedia({
      video: {
        width: 600,
        height: 400
      },
      audio: false
    }).then((stream) => {
      video.srcObject = stream;
      video.addEventListener("loadeddata", predict);
    })
  }

  function predict() {
    const nowInMs = Date.now();
    if (lastVideoTime !== video.currentTime) {
      lastVideoTime = video.currentTime;
      const result = faceLandmarker.detectForVideo(video, nowInMs);
      if (result.facialTransformationMatrixes[0]?.data && result.faceBlendshapes) {
        matrix = new Matrix4().fromArray(result.facialTransformationMatrixes[0]?.data);

        rotation = new Euler().setFromRotationMatrix(matrix);

        blendShapes = result.faceBlendshapes[0].categories;
      }
    }

    requestAnimationFrame(predict);
  }
  useEffect(() => {
    setup();
  }, [])
  return (
    <div className="App">
      <video autoPlay id="video" style={{ transform: "rotateY(180deg)", display: "none" }} />
      <div className="avatarWrapper">
        <Canvas
          camera={{
            fov: 20
          }}
          style={{ borderRadius: "50%" }}
        >
          <ambientLight intensity={1} />
          <pointLight position={[1, 1, 1]} color={new Color(15, 15, 15)} intensity={1} />
          <pointLight position={[-1, 1, 1]} color={new Color(20, 10, 5)} intensity={0.5} />
          <Avatar headMesh={headMesh} rotation={rotation} />
        </Canvas>
      </div>
    </div>
  );
}

const Avatar = () => {
  const avatar = useGLTF("https://models.readyplayer.me/6669900222f78f074aa7da96.glb?morphTargets=ARKit&textureAtlas=1024");
  const { nodes } = useGraph(avatar.scene);

  useEffect(() => {
    headMesh = nodes.Wolf3D_Avatar;
  }, [nodes])

  useFrame((_, delta) => {
    if (blendShapes) {
      blendShapes.forEach((blendshape) => {
        let index = headMesh.morphTargetDictionary[blendshape.categoryName];
        if (index) {
          headMesh.morphTargetInfluences[index] = blendshape.score
        }
      })
    }


    if (rotation) {
      nodes.Head.rotation.set(rotation.x / 2, -rotation.y / 2, -rotation.z / 2)
      nodes.Neck.rotation.set(-rotation.x / 3, -rotation.y / 3, -rotation.z / 3)
      nodes.Spine1.rotation.set(rotation.x / 3, -rotation.y / 3, -rotation.z / 3)
    }
  })

  return <primitive object={avatar.scene} position={[0, -1.7, 3]} />
}

export default App;
