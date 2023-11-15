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

  toObject(){
    return {
        id: this.id,
        x: this.x,
        y: this.y,
        w: this.w,
        h: this.h,
        name: this.name,
        score: this.score,
        main: this.isMain
    }
  }
  moveDir(dir) {
    this.movementDirection[dir] = true;
  }

  stopDir(dir) {
    this.movementDirection[dir] = false;
  }

  movePlayer(dir, speed) {
    if (dir === 'up') this.y - speed >= this.sh.getPlayMinY() ? this.y -= speed : this.y -= 0;
    if (dir === 'down') this.y + speed <= this.sh.getPlayMaxY() ? this.y += speed : this.y += 0;
    if (dir === 'left') this.x - speed >= this.sh.getPlayMinX() ? this.x -= speed : this.x -= 0;
    if (dir === 'right') this.x + speed <= this.sh.getPlayMaxX() ? this.x += speed : this.x += 0;
  }

  collision(item) {
    if (
      (this.x < item.x + this.sh.coinSize &&
        this.x + this.sh.playerSize > item.x &&
        this.y < item.y + this.sh.coinSize &&
        this.y + this.sh.playerSize > item.y)
    )
      return true;
  }

  calculateRank(arr) {
    const sortedScores = arr.sort((a, b) => b.score - a.score);
    const mainPlayerRank = this.score === 0 ? arr.length : (sortedScores.findIndex(obj => obj.id === this.id) + 1);

    return `Rank: ${mainPlayerRank} / ${arr.length}`
  }
}

export default Player;
