import { CharacterState, Character } from ".";
import { Mortal } from "./Mortal";
import { getAdjacentPositions } from '../utility'
import { GameState, Player } from '../../types/GameTypes';
import { Board } from '../space'
import { Ctx } from 'boardgame.io';

// interface attrsType {
//   numBuilds: number,
//   firstBuildPos: number,
// }

export const Demeter: Character = {
  ...Mortal,
  name: 'Demeter',
  desc: `Your Build: Your worker may build one additional time, but not on the same space.`,
  buttonText: 'Skip 2nd Build',
  attrs: {
    numBuilds: 0,
    firstBuildPos: -1,
  },

  buttonPressed: (
    G: GameState,
    ctx: Ctx,
    player: Player,
    char: CharacterState
  ) => {
    // reset stuff
    char.attrs.numBuilds = 0;
    char.buttonActive = false;

    // set game stage
    return 'end';
  },


  validBuild: (
    G: GameState,
    ctx: Ctx,
    player: Player,
    char: CharacterState,
    originalPos: number
  ) => {
    let adjacents: number[] = getAdjacentPositions(originalPos);
    let valids: number[] = []

    if (char.attrs.numBuilds === 0) {
      adjacents.forEach(pos => {
        if (!G.spaces[pos].inhabited && !G.spaces[pos].is_domed) {
          valids.push(pos);
        }
      })
    }
    else {
      adjacents.forEach(pos => {
        if (!G.spaces[pos].inhabited && !G.spaces[pos].is_domed && pos !== char.attrs.firstBuildPos) {
          valids.push(pos);
        }
      })
    }

    return valids;
  },

  build: (
    G: GameState,
    ctx: Ctx,
    player: Player,
    char: CharacterState,
    pos: number
  ) => {

    char.attrs.numBuilds++;

    if (char.attrs.numBuilds === 1) {
      char.attrs.firstBuildPos = pos;
      Board.build(G, pos);
      char.buttonActive = true;
      return 'build'
    }
    else {
      char.attrs.numBuilds = 0;
      char.buttonActive = false;
      Board.build(G, pos);
      return 'end'
    }
  },
}
