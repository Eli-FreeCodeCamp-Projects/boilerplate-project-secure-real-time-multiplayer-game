import Ut from '../public/js/utils.mjs'
import {generateStartPos, SizeHelper} from '../public/js/gameHelper.mjs';
const uuid = require("uuid");
const {Coins} = require ('../public/js/enums.mjs');

module.exports = class CoinRace{

    constructor(sizes={}){
        this.players = [];
        this.counterNames = 1;
        this.stats = {};
        
        this.gSize = new SizeHelper(sizes);
        this.coin = this.addCoin();
    }

    setPlayerName(name=''){
        let playerName = '';
        if(Ut.isStrNotEmpty(name) && Ut.isAtrrKey(name)){
            playerName = name
        }else{
            playerName = `Player${this.counterNames}`;
            this.counterNames++;
        }
        return playerName
    }

    getArrayCoins(){
        return [
            {
                name: Coins.BANANA.description,
                value: 1
            },
            {
                name: Coins.LEMON.description,
                value: 2
            },
            {
                name: Coins.CHERRY.description,
                value: 3
            },
            {
                name: Coins.CARROT.description,
                value: 4
            },
            {
                name: Coins.SINGLE_COIN.description,
                value: 5
            },
            {
                name: Coins.COINS.description,
                value: 10
            },
            {
                name: Coins.BAG_COINS.description,
                value: 20
            },
            {
                name: Coins.SILVER_CHEST.description,
                value: 30
            },
            {
                name: Coins.GOLD_CHEST.description,
                value: 50
            }
        ]
    }

    getCoinData(){
        const coins = this.getArrayCoins();
        const key = generateStartPos(1, coins.length, 1)
        return coins[key]
    }

    getPlayers(){
        return this.players.map(obj=>{
            return obj.toObject();
        })
    }

    addCoin(){
        const coin = this.getCoinData()
        return {
            x: generateStartPos(
                this.gSize.getPlayMinX(),
                this.gSize.getPlayMaxX(),
                6
            ),
            y: generateStartPos(
                this.gSize.getPlayMinY(),
                this.gSize.getPlayMaxY(),
                6
            ),
            key: coin.name,
            value: coin.value,
            id: uuid.v4()
        }
    }

}