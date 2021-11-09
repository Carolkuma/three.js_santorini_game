import { Ctx } from 'boardgame.io';
import { Character, CharacterState } from '../../types/CharacterTypes';
import { Mortal } from './Mortal';
import { GameState, Player } from '../../types/GameTypes';
import { getAdjacentPositions } from '../utility';

export const Graeae: Character = {
  ...Mortal,
  desc: `Setup: When placing your Workers, place 3 of your color.\n
    Your Build: Build with a Worker that did not Move.\n
    Banned VS: Nemesis`,
  numWorkers: 3,

  validBuild: (
    G: GameState,
    ctx: Ctx,
    player: Player,
    char: CharacterState,
    originalPos: number,
  ) => {
    let adjacents: number[] = [];
    const valids: number[] = [];

    for (let i = 0; i < char.numWorkers; i++) {
      if (i !== char.selectedWorker) {
        // add on the adjacent positions of each worker
        adjacents = adjacents.concat(getAdjacentPositions(char.workers[i].pos));
      }
    }

    adjacents.forEach((pos) => {
      if (!G.spaces[pos].inhabitant && !G.spaces[pos].isDomed) {
        valids.push(pos);
      }
    });

    return valids;
  },
};
