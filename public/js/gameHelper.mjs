class SizeHelper{
    constructor({
            headerWidth=800,
            headerHeigth=45,
            bodyWidth=800,
            bodyHeight=600,
            playerSize=30,
            coinSize=30,
            playBorder=5}){
        this.bodyWidth = bodyWidth;
        this.bodyHeight = bodyHeight;
        this.playerSize = playerSize;
        this.coinSize = coinSize;
        this.headerWidth = headerWidth;
        this.headerHeigth = headerHeigth;
        this.playBorder = playBorder;
    }

    getPlayMinX(){
        return (this.bodyWidth / 2) - (this.bodyWidth - (this.playBorder * 2)) / 2
    }

    getPlayMaxX(){
        return (this.bodyWidth - this.playerSize) - this.playBorder
    }

    getPlayMinY(){
        return (this.bodyHeight / 2) - (this.bodyHeight - 100) / 2
    }

    getPlayMaxY(){
        return (this.bodyHeight - this.playerSize) - this.playBorder
    }

    getPlayWidth(){
        return this.bodyWidth - (this.playBorder * 2)
    }

    getPlayHeight(){
        return (this.bodyHeight - this.headerHeigth) - (this.playBorder * 2)
    }
}
const generateStartPos = (min, max, multiple) => {
    return Math.floor(Math.random() * ((max - min) / multiple)) * multiple + min;
  };

export {
    SizeHelper,
    generateStartPos
  }