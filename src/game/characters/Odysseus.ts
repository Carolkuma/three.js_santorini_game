import { Ctx } from 'boardgame.io';
import { getAdjacentPositions } from '../utility';
import { Character, CharacterState } from '../../types/CharacterTypes';
import { Mortal } from './Mortal';
import { GameState, Player } from '../../types/GameTypes';
import { Board } from '../space';

interface OdysseusAttrs {
  specialActive: boolean,
  specialUsed: boolean,
  movingOpponent: boolean,
  workerToMovePos: number
}

const checkForValidSpecial = (
  G: GameState,
  ctx: Ctx,
  player: Player,
  char: CharacterState<OdysseusAttrs>,
) => {
  char.attrs.specialActive = true;
  let returnValue = false;

  if (char.selectedWorker !== -1) {
    const worker = char.workers[char.selectedWorker];
    if (Odysseus.validMove(G, ctx, player, char, worker.pos).length > 0) {
      returnValue = true;
    }
  } else {
    char.workers.forEach((worker) => {
      if (Odysseus.validMove(G, ctx, player, char, worker.pos).length > 0) {
        returnValue = true;
      }
    });
  }

  char.attrs.specialActive = false;
  return returnValue;
};

export const Odysseus: Character<OdysseusAttrs> = {
  ...Mortal,
  desc: `Start of Your Turn: Once, force to unoccupied corner spaces any 
    number of opponent Workers that neighbor your Workers.`,
  buttonText: 'Move Opponent',
  attrs: {
    specialActive: false,
    specialUsed: false,
    movingOpponent: false,
    workerToMovePos: -1,
  },

  onTurnBegin: (
    G: GameState,
    ctx: Ctx,
    player: Player,
    char: CharacterState<OdysseusAttrs>,
  ) => {
    if (!char.attrs.specialUsed) {
      char.buttonActive = checkForValidSpecial(G, ctx, player, char);
    }
  },

  buttonPressed: (
    G: GameState,
    ctx: Ctx,
    player: Player,
    char: CharacterState<OdysseusAttrs>,
  ) => {
    char.attrs.specialActive = !char.attrs.specialActive;

    if (char.attrs.specialUsed) {
      char.buttonActive = false;
      char.attrs.specialActive = false;
      char.buttonText = 'Move Opponent';
    } else if (char.attrs.specialActive) {
      char.buttonText = 'Cancel';
    } else {
      char.buttonText = 'Move Opponent';
    }

    return Mortal.buttonPressed(G, ctx, player, char);
  },

  validMove(
    G: GameState,
    ctx: Ctx,
    player: Player,
    char: CharacterState<OdysseusAttrs>,
    originalPos: number,
  ): number[] {
    const valids: number[] = [];

    if (char.attrs.specialActive) {
      let adjacents: number[] = [];
      char.workers.forEach((worker) => {
        adjacents = adjacents.concat(getAdjacentPositions(worker.pos));
      });
      if (!char.attrs.movingOpponent) {
        G.players[player.opponentId].char.workers.forEach((worker) => {
          if (adjacents.includes(worker.pos)) {
            valids.push(worker.pos);
          }
        });
      } else {
        [0, 4, 20, 24].forEach((pos) => { // corner positions
          if (!G.spaces[pos].isDomed && !G.spaces[pos].inhabited) {
            valids.push(pos);
          }
        });
      }

      return valids;
    }

    return Mortal.validMove(G, ctx, player, char, originalPos);
  },

  move: (
    G: GameState,
    ctx: Ctx,
    player: Player,
    char: CharacterState<OdysseusAttrs>,
    pos: number,
  ) => {
    if (char.attrs.specialActive) {
      char.attrs.specialUsed = true;
      char.buttonText = 'End Ability';

      if (!char.attrs.movingOpponent) {
        char.attrs.movingOpponent = true;
        char.attrs.workerToMovePos = pos;
        return 'move';
      }

      char.attrs.movingOpponent = false;
      const oppWorkerNum = G.spaces[char.attrs.workerToMovePos].inhabitant.workerNum;
      Board.free(G, char.attrs.workerToMovePos);
      Board.place(G, pos, player.opponentId, oppWorkerNum);

      if (!checkForValidSpecial(G, ctx, player, char)) {
        char.attrs.specialActive = false;
        char.buttonText = 'Move Opponent';
        char.buttonActive = false;
      } else {
        char.attrs.specialActive = true;
      }

      return 'move';
    }

    char.buttonActive = false;
    char.attrs.specialActive = false;
    return Mortal.move(G, ctx, player, char, pos);
  },
};
