module Main where
import Game.NetworkedGameEngine
import Control.Concurrent (newMVar)
import qualified Game.SecretHitler.SecretHitler as H
import qualified Game.Kittens.ExplodingKittens as K
main = do
  commsList <- newMVar []
  initialize [
    GameDescriptor {
      playGame = H.playSecretHitler commsList,
      descName = "SecretHitler",
      shardNames = ["Hitler","Not Hitler"],
      onMessage = H.hitlerMessage commsList},
    GameDescriptor {
      playGame = K.playExplodingKittens commsList,
      descName = "ExplodingKittens",
      shardNames = ["Unicorn","Kitten"],
      onMessage = K.kittenMessage commsList}
    ]
 


