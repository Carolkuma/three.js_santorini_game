import React from "react";
import { Plane } from '@react-three/drei';
import {Euler} from 'three';

export const Ground: React.FC<{ xPos: number, zPos: number }> = ({ xPos, zPos }) => {

  const GROUND_SIZE = 5;

  return <Plane args={[GROUND_SIZE, GROUND_SIZE]} 
    position={[xPos, 0, zPos]} 
    rotation={new Euler( 3 * Math.PI / 2, 0, 0, 'XYZ' )}>
    <meshStandardMaterial color="green" />
  </Plane>
};
