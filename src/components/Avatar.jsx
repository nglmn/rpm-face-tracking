import React, { useEffect } from 'react'
import { useGLTF } from "@react-three/drei";
import { useFrame, useGraph } from '@react-three/fiber';

const Avatar = ({ headMesh, rotation }) => {
    const avatar = useGLTF("https://models.readyplayer.me/6669900222f78f074aa7da96.glb?morphTargets=ARKit&textureAtlas=1024");
    const { nodes } = useGraph(avatar.scene);

    useEffect(() => {
        headMesh = nodes.Wolf3D_Avatar;
    }, [nodes])

    useFrame((_, delta) => {
        console.log(rotation)
        // if (rotation) {
        //     console.log({
        //         x: rotation.x,
        //         y: rotation.y,
        //         z: rotation.z
        //     })
        // }
        // nodes.Head.rotation.set(rotation.x, rotation.y, rotation.z)
    })

    return <primitive object={avatar.scene} position={[0, -1.7, 4]} />
}

export default Avatar