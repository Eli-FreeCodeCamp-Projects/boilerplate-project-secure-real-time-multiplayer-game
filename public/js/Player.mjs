import {generateStartPos, SizeHelper} from './gameHelper.mjs';
class Player {
  constructor({id, x, y, name=undefined, score=0, speed=5, main=false, size={}}) {
    this.id = id;
    this.x = x;
    this.y = y;
    this.name = name;
    this.speed = speed;
    this.score = score;
    this.movementDirection = {};
    this.isMain = main;
    this.sh = new SizeHelper(size)
  } 
}

export default Player;
