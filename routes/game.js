import Player from '../public/js/Player.mjs';
import Ut from '../public/js/utils.mjs';
import CoinRace from '../utils/coinRace.js'
import { playerSchema, MooveOnServerSchema, DestroyItemSchema } from '../public/js/gameSchema.mjs';
const uuid = require("uuid");

module.exports = function (io) {
    
    let game = new CoinRace()
    let init;

    /**
     * On client connection handler
     * ToDo: Handle errors
     */
    io.on('connection', (sock) => {

        //-> Set Client id and uuid
        sock.uuid = uuid.v4();
        const id = sock.uuid;
        console.log(`a user connected ${id}`);

        /**
         * On Current Client Disconnect
         * Broadcast to others clients Current Client Disconnection
         * Remove Current Client from players list
         */
        sock.on('disconnect', () => {
            console.log(`a user disconnect ${id}`);
            
            sock.broadcast.emit('remove-player', id);
            const playerIds = game.players.map(player => player.id);
            const index = playerIds.indexOf(id)
            if(index >= 0 ){
                console.log(`server remove-player ${playerIds[index]}`);
                game.players.splice(index, 1);
            }
        });



        /**
         * Init the game
         */
        init = sock.emit('init', ({
            id: id,
            players: game.getPlayers(),
            coin: game.coin
        }));

        /** 
         * On New Player handled by current client
         */
        sock.on('new-player', data => {
            const { error, value } = playerSchema.validate(data);
            if(error) {
                sock.emit('server-error', {status: false, msg: "Invalid Player data transmitted!"})
                return;
            }
            // Check that player doesn't already exist
            const playerIds = game.getPlayers().map(player => player.id);
            value.main = false; 
            if (!playerIds.includes(value.id)) {
                console.log(`server add new-player ${value.id} is main ${value.isMain}`);
                value.name = game.setPlayerName(value.name)
                io.emit('set-player-name', value)
                game.players.push(new Player(value));
                console.log(game.players);
                sock.broadcast.emit('new-player', value)
            }
                
          });
        
        sock.on('move-player', (data) => {
            const { error, value } = MooveOnServerSchema.validate(data);
            if(error) {
                sock.emit('server-error', {status: false, msg: "Invalid Move data transmitted!"})
            }
            else{
                const {dir, x, y} = value
                const movingPlayer = game.players.find(obj => obj.id === id);
                if(Ut.isObject(movingPlayer)){
                    movingPlayer.moveDir(dir);
                    // Force sync in case of lag
                    movingPlayer.x = x;
                    movingPlayer.y = y;
                    sock.broadcast.emit('move-player', { id: movingPlayer.id, dir: dir, posObj: {x, y}})
                }
            }
            
            
        });

        sock.on('stop-player', (data) => {
            const { error, value } = MooveOnServerSchema.validate(data);
            if(error) {
                sock.emit('server-error', {status: false, msg: "Invalid Move data transmitted!"})
                return;
            }
            const {dir, x, y} = value
            const stoppingPlayer = game.players.find(obj => obj.id === id);
            if(Ut.isObject(stoppingPlayer)){
                stoppingPlayer.stopDir(dir);
        
                // Force sync in case of lag
                stoppingPlayer.x = x;
                stoppingPlayer.y = y;
                sock.broadcast.emit('stop-player', { id: stoppingPlayer.id, dir: dir, posObj: {x, y}})
                
            }
            
        });
        
        /**
         * Update player score based
         * Todo: This is unsecure, must be controled by server data
         */
        sock.on('update-player', playerObj => {
            const { error, value } = playerSchema.validate(playerObj);
            if(error) {
                sock.emit('server-error', {status: false, msg: "Invalid Player data transmitted!"})
                return;
            }
            const scoringPlayer = game.players.find(obj => obj.id === value.id);
            scoringPlayer.score = value.score;
    
        });

        /**
         * Destroy coin item and set new coin item.
         */
        sock.on('destroy-item', (data) => {
            const { error, value } = DestroyItemSchema.validate(data);
            if(error) {
                sock.emit('server-error', {status: false, msg: "Invalid data transmitted!"})
                return;
            }
            const { playerId, coinValue, coinId } = value
            if(coinId === game.coin.id){
                const player = game.players.find(obj => obj.id === playerId);
                if(Ut.isObject(player)){
                    //-> Update player score
                    player.score += coinValue
                    //-> Set new collectible coin data
                    game.coin = game.addCoin()
                    //-> Emit new current player score to all players
                    io.emit('update-player', player)
                    //-> Emit new collectible coin data to all players
                    io.emit('new-coin', game.coin)
                }
                else{
                    //-> Undefined player 
                }
            }else{
                //-> Coin id is invalid
            }
        });
        
        
    });
}