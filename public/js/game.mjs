import Player from './Player.mjs';
import Collectible from './Collectible.mjs';
import {generateStartPos, SizeHelper} from './gameHelper.mjs';
import Ut from './utils.mjs';
import controls from './controls.mjs';

const startGame = ()=>{

    const home = 'http://localhost:3000/public/img/';
    class CoinRace{
        constructor(sizes={}){
            this.socket = io();
            this.gSize = new SizeHelper(sizes);
            this.players = [];
            this.avatars = this.getAvatars();
            this.mainPlayer;
            this.coin;
            this.coins = this.getCoins()
            this.tick;
            this.endGame;
            this.error;
        }

        init(){
            this.socket.on('init', ({ id, players, coin }) =>{
                // Cancel animation if one already exists and
                // the page isn't refreshed, like if the server
                // restarts
                cancelAnimationFrame(this.tick);

                // Create our player when we log on
                this.mainPlayer = new Player({ 
                    x: generateStartPos(this.gSize.getPlayMinX(), this.gSize.getPlayMaxX(), 5),
                    y: generateStartPos(this.gSize.getPlayMinY(), this.gSize.getPlayMaxY(), 5),
                    id, 
                    main: true,
                    size: this.gSize
                });
                //-> Add player controls
                controls(this.mainPlayer, this.socket);

                // Send our player back to the server
                this.socket.emit('new-player', this.mainPlayer.toObject());

                // Add new player when someone logs on
                this.socket.on('new-player', obj => {
                    // Check that player doesn't already exist
                    const playerIds = this.players.map(player => player.id);
                    if (!playerIds.includes(obj.id)) {
                        this.players.push(new Player(obj));
                    }
                });

                //-> set player name
                this.socket.on('set-player-name', obj => {
                    // Check that player doesn't already exist
                    const selPlayer = this.players.map((player, index)=>({id: player.id, isMain: player.main, index: index}))
                        .filter(player => player.id === obj.id);
                    if (selPlayer.length === 1) {
                        const {id, isMain, index} = selPlayer[0]
                        this.players[index].name = obj.name
                    }

                    if(obj.id === this.mainPlayer.id){
                        this.mainPlayer.name = obj.name
                    }
                });

                // Handle movement
                this.socket.on('move-player', ({ id, dir, posObj }) => {
                    const player = this.players.find(obj => obj.id === id);
                    player.moveDir(dir);
                    
                    // Force sync in case of lag
                    player.x = posObj.x;
                    player.y = posObj.y;
                });

                this.socket.on('stop-player', ({ id, dir, posObj }) => {
                    const player = this.players.find(obj => obj.id === id);
                    player.stopDir(dir);
                    // Force sync in case of lag
                    player.x = posObj.x;
                    player.y = posObj.y;
                });

                // Handle new coin gen
                this.socket.on('new-coin', newCoin => {
                    this.coin = new Collectible(newCoin);
                });

                // Handle player disconnection
                this.socket.on('remove-player', id => {
                    this.players = this.players.filter(player => player.id !== id);
                    //this.removePlayerStats()
                });

                // Handle endGame state
                this.socket.on('end-game', result => this.endGame = result);

                // Update scoring player's score
                this.socket.on('update-player', playerObj => {
                    const scoringPlayer = this.players.find(obj => obj.id === playerObj.id);
                    scoringPlayer.score = playerObj.score;
                });

                // Handle serverError state
                this.socket.on('server-error', error => {
                    console.log("Server Fatal Error: ")
                    console.log(error)
                    this.socket.disconnect()
                    if(Ut.isObject(error)){
                        //-> Send message to user to notify error
                        this.error = error.msg
                    }
                });

                // Populate list of connected players and 
                // create current coin when logging in
                this.players = players.map(player=>new Player(player))
                    .concat(this.mainPlayer);
                this.coin = new Collectible(coin);

                this.draw()
            })
        }
        
        preloadImage(src, alt){
            const img = new Image();
            img.src = src;
            img.alt = alt;
            return img;
        }

        preloadCoinImage(src, alt){
            const img = this.preloadImage(`${home}coins/${src}`, alt);
            img.width = this.gSize.coinSize
            img.height = this.gSize.coinSize
            return img
        }

        preloadAvatarImage(src, alt){
            const img = this.preloadImage(`${home}avatars/${src}`, alt);
            img.width = this.gSize.playerSize
            img.height = this.gSize.playerSize
            return img
        }

        getAvatars(){
            return {
                'white_cat': {
                    name: 'white_cat',
                    img: this.preloadAvatarImage('white_cat.png', 'White Cat')
                },
                'red_cat': {
                    name: 'red_cat',
                    img: this.preloadAvatarImage('red_cat.png', 'Red Cat')
                }
            }
        }

        getCoins(){
            return {
                'banana': {
                    name: 'banana',
                    value: 1,
                    img: this.preloadCoinImage('banana.png', 'Banana Coin')
                },
                'lemon': {
                    name: 'lemon',
                    value: 2,
                    img: this.preloadCoinImage('lemon.png', 'Lemon Coin')
                },
                'cherry': {
                    name: 'cherry',
                    value: 3,
                    img: this.preloadCoinImage('cherry.png', 'Cherry Coin')
                },
                'carrot': {
                    name: 'carrot',
                    value: 4,
                    img: this.preloadCoinImage('carrot.png', 'Carrot Coin')
                },
                'single_coin': {
                    name: 'single_coin',
                    value: 5,
                    img: this.preloadCoinImage('single_coin.png', 'Single gold Coin')
                },
                'coins': {
                    name: 'coins',
                    value: 10,
                    img: this.preloadCoinImage('coins.png', 'Some gold Coin')
                },
                'bag_coins': {
                    name: 'bag_coins',
                    value: 20,
                    img: this.preloadCoinImage('bag_coins.png', 'Bag of gold Coins')
                },
                'silver_chest': {
                    name: 'silver_chest',
                    value: 30,
                    img: this.preloadCoinImage('silver_chest.png', 'Chest of silver Coins')
                },
                'gold_chest': {
                    name: 'gold_chest',
                    value: 50,
                    img: this.preloadCoinImage('gold_chest.png', 'Chest of gold Coins')
                }
            }
        }

        setRank(ctx){
            //-> Players Rank
            ctx.font = `13px 'Press Start 2P'`;
            ctx.fillText(this.mainPlayer.calculateRank(this.players), 700, 32.5);
        }

        drawHeader(ctx){
            // Controls text
            ctx.fillStyle = 'white';
            ctx.textAlign = 'center';
            // Game title
            ctx.font = `16px 'Press Start 2P'`;
            ctx.fillText('Coin Race', this.gSize.bodyWidth / 2, 32.5);

            //-> Players Rank
            this.setRank(ctx)
        }

        drawCoin(ctx){
            if(Ut.isObject(this.coin) && Ut.isObject(this.coins[this.coin.key])){
                ctx.drawImage(this.coins[this.coin.key].img, this.coin.x, this.coin.y,this.gSize.coinSize, this.gSize.coinSize)
            }
            else{
                throw new Error('Fatal Error: Invalid coin')
            }
            
        }

        drawPlayers(ctx){
            // Calculate score and draw players each frame
            this.players.forEach(player => {
                const currDir = Object.keys(player.movementDirection).filter(dir => player.movementDirection[dir]);
                currDir.forEach(dir => player.movePlayer(dir, player.speed));

                if(player.id !== this.mainPlayer.id){
                    ctx.drawImage(this.avatars.red_cat.img, player.x, player.y);
                }
                else{
                    ctx.drawImage(this.avatars.white_cat.img, player.x, player.y);
                }

                if (player.collision(this.coin)) {
                    this.coin.destroyed = player.id;
                }
            });
                    
        }

        drawGameBody(ctx){
            //-> draw players
            this.drawPlayers(ctx)
            //-> draw coin
            this.drawCoin(ctx)
            // Remove destroyed coin
            if (this.coin.destroyed) {
                this.socket.emit('destroy-item', { playerId: this.coin.destroyed, coinValue: this.coin.value, coinId: this.coin.id });
            }
        }

        removePlayerStats(){
            //-> Players Rank
            const container = document.querySelector('div.players-stats');
            if(Ut.isElement(container)){
                container.innerHTML = '';
            }
        }
        removeBadPlayerStats(){
            //-> Players Rank
            const container = document.querySelector('div.players-stats');
            if(Ut.isElement(container) && container.childNodes.length > 0){
                const playerIds = this.players.map(player => player.id);
                const orphans = Array.from(container.childNodes).filter(el => {
                    const id = el.id.replace('stats-', '')
                    return !playerIds.includes(id)
                });
                if(orphans.length > 0){
                    orphans.forEach(el=>{
                        el.remove();
                    })
                }
            }
        }
        setPlayerStat(container, player){
            //-> Players Rank
            const name_element = container.querySelector('.name');
            const score_element = container.querySelector('.score-value');
            score_element.textContent = `Score : ${player.score}`
            name_element.textContent = player.name
        }

        setPlayerStatsContainer(container, playerAttrId, isMain){
            //-> Create player container
            let element = document.createElement('div');
            element.setAttribute('id', playerAttrId);
            element.classList.add('player-info')
            if(isMain === true){
                element.classList.add('active')
            }
            //-> Add name element
            let newElement = document.createElement('h3');
            newElement.classList.add('name');
            element.appendChild(newElement);
            //-> Add score-value element
            newElement = document.createElement('div');
            newElement.classList.add('score-value');
            element.appendChild(newElement);
            //-> Add earned element
            newElement = document.createElement('div');
            newElement.classList.add('earned');
            element.appendChild(newElement);
            //-> Append player stats to container
            container.appendChild(element)
            return container
        }

        setPlayersStats(){
            //-> Players Rank
            const container = document.querySelector('div.players-stats');
            this.removeBadPlayerStats();
            const sortedScores = this.players.sort((a, b) => {
                b.score - a.score
            });
            sortedScores.forEach(player => {
                let playerAttrId = player.id.replace(' ', '-');
                if(Ut.isStrNotEmpty(playerAttrId)){
                    playerAttrId = `stats-${playerAttrId}`
                    let element = document.getElementById(playerAttrId)
                    const isMain = (player.id === this.mainPlayer.id)
                    if(element){
                        this.setPlayerStat(element, player)
                    }
                    else{
                        element = this.setPlayerStatsContainer(container, playerAttrId, isMain)
                        this.setPlayerStat(element, player)
                    }
                }
            });
        }

        drawGameInfo(){
            

            this.setPlayersStats()
        }

        draw() {
            const canvas = document.getElementById('game-window');
            if (canvas.getContext) {
                const ctx = canvas.getContext("2d");
                //-> clear canvas
                ctx.clearRect(0, 0, this.gSize.bodyWidth, this.gSize.bodyHeight);

                //-> draw header
                this.drawHeader(ctx)

                //-> draw body
                this.drawGameBody(ctx)
                
                this.drawGameInfo()

                if (!this.endGame) this.tick = requestAnimationFrame(()=>this.draw());
            }
        }
    }

    const game = new CoinRace();
    game.init();
}

window.addEventListener("load", startGame());